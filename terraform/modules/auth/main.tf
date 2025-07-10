# IAM Role for Lambda
resource "aws_iam_role" "lambda_role" {
  name = "ReEventLambdaRole-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = var.common_tags
}

# Attach AWS Lambda Basic Execution Role
resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# DynamoDB Write Policy
resource "aws_iam_policy" "dynamodb_write_access" {
  name = "DynamoDBWriteAccess-${var.environment}"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem"
        ]
        Resource = var.dynamodb_table_arn
      }
    ]
  })

  tags = var.common_tags
}

# Attach DynamoDB Write Policy to Lambda Role
resource "aws_iam_role_policy_attachment" "lambda_dynamodb_write" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.dynamodb_write_access.arn
}

# Lambda trigger for post-confirmation
resource "aws_lambda_function" "post_confirmation" {
  filename      = var.lambda_zip_path
  function_name = "${var.project_name}-auth-post-confirmation-${var.environment}"
  role         = aws_iam_role.lambda_role.arn
  handler      = "auth-post-confirmation.handler"
  runtime      = "nodejs18.x"
  timeout      = 30

  environment {
    variables = {
      USERS_TABLE = var.dynamodb_table_name
    }
  }

  tags = var.common_tags
}

# Lambda permission for Cognito
resource "aws_lambda_permission" "cognito_post_confirmation" {
  statement_id  = "AllowCognitoInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.post_confirmation.function_name
  principal     = "cognito-idp.amazonaws.com"
}

# Cognito User Pool
resource "aws_cognito_user_pool" "main" {
  name = "${var.project_name}-user-pool-${var.environment}"

  lambda_config {
    post_confirmation = aws_lambda_function.post_confirmation.arn
  }

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = false
    require_uppercase = true
  }

  schema {
    name                = "email"
    attribute_data_type = "String"
    required            = true
    mutable             = true
  }

  schema {
    name                = "name"
    attribute_data_type = "String"
    required            = true
    mutable             = true
  }

  schema {
    name                = "custom:company"
    attribute_data_type = "String"
    required            = false
    mutable             = true
  }

  schema {
    name                = "phone_number"
    attribute_data_type = "String"
    required            = false
    mutable             = true
  }

  auto_verified_attributes = ["email"]
  username_attributes      = ["email"]

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  tags = var.common_tags
}

# Google Identity Provider
resource "aws_cognito_identity_provider" "google" {
  user_pool_id  = aws_cognito_user_pool.main.id
  provider_name = "Google"
  provider_type = "Google"

  provider_details = {
    client_id        = var.google_client_id
    client_secret    = var.google_client_secret
    authorize_scopes = "email openid profile"
  }

  attribute_mapping = {
    email          = "email"
    email_verified = "email_verified"
    name           = "name"
    username       = "sub"
  }
}

# Cognito User Pool Client
resource "aws_cognito_user_pool_client" "main" {
  name         = "${var.project_name}-spa-client-${var.environment}"
  user_pool_id = aws_cognito_user_pool.main.id

  generate_secret = false
  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]

  supported_identity_providers = ["COGNITO", "Google"]

  callback_urls = var.cognito_callback_urls
  logout_urls   = var.cognito_logout_urls

  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["email", "openid", "profile"]
  allowed_oauth_flows_user_pool_client = true

  access_token_validity  = 1
  id_token_validity     = 1
  refresh_token_validity = 30

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }

  prevent_user_existence_errors = "ENABLED"

  read_attributes  = ["email", "name", "phone_number"]
  write_attributes = ["email", "name", "phone_number"]

  depends_on = [aws_cognito_identity_provider.google]
}

# Cognito User Pool Domain
resource "aws_cognito_user_pool_domain" "main" {
  domain       = "${var.project_name}-auth-${var.environment}"
  user_pool_id = aws_cognito_user_pool.main.id
}