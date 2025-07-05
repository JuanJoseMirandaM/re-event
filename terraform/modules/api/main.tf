# IAM Role for Lambda
resource "aws_iam_role" "lambda_role" {
  name = "${var.project_name}-lambda-role-${var.environment}"

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

  tags = var.tags
}

# IAM Policy for Lambda
resource "aws_iam_role_policy" "lambda_policy" {
  name = "${var.project_name}-lambda-policy-${var.environment}"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem"
        ]
        Resource = [
          var.dynamodb_table_arn,
          "${var.dynamodb_table_arn}/index/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "cognito-idp:AdminGetUser",
          "cognito-idp:AdminUpdateUserAttributes",
          "cognito-idp:ListUsers"
        ]
        Resource = var.user_pool_arn
      }
    ]
  })
}

# Lambda Layer for shared dependencies
resource "aws_lambda_layer_version" "shared_layer" {
  filename         = "../backend/layers/shared.zip"
  layer_name       = "${var.project_name}-shared-layer-${var.environment}"
  source_code_hash = filebase64sha256("../backend/layers/shared.zip")

  compatible_runtimes = ["nodejs18.x"]
  description         = "Shared utilities and AWS SDK"

  depends_on = [null_resource.build_layer]
}

# Build layer
resource "null_resource" "build_layer" {
  triggers = {
    always_run = timestamp()
  }

  provisioner "local-exec" {
    command = <<EOF
      cd ../backend
      mkdir -p layers/nodejs
      cp package.json layers/nodejs/
      cd layers/nodejs
      npm install --production
      cd ..
      zip -r shared.zip nodejs/
    EOF
  }
}

# Lambda Functions
resource "aws_lambda_function" "auth_handler" {
  filename         = "../backend/dist/auth.zip"
  function_name    = "${var.project_name}-auth-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "auth.handler"
  source_code_hash = filebase64sha256("../backend/dist/auth.zip")
  runtime         = "nodejs18.x"
  timeout         = 30

  layers = [aws_lambda_layer_version.shared_layer.arn]

  environment {
    variables = {
      TABLE_NAME    = var.dynamodb_table_name
      STAGE         = var.environment
      USER_POOL_ID  = var.user_pool_id
    }
  }

  tags = var.tags
  depends_on = [null_resource.build_lambdas]
}

resource "aws_lambda_function" "users_handler" {
  filename         = "../backend/dist/users.zip"
  function_name    = "${var.project_name}-users-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "users.handler"
  source_code_hash = filebase64sha256("../backend/dist/users.zip")
  runtime         = "nodejs18.x"
  timeout         = 30

  layers = [aws_lambda_layer_version.shared_layer.arn]

  environment {
    variables = {
      TABLE_NAME    = var.dynamodb_table_name
      STAGE         = var.environment
      USER_POOL_ID  = var.user_pool_id
    }
  }

  tags = var.tags
  depends_on = [null_resource.build_lambdas]
}

resource "aws_lambda_function" "sessions_handler" {
  filename         = "../backend/dist/sessions.zip"
  function_name    = "${var.project_name}-sessions-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "sessions.handler"
  source_code_hash = filebase64sha256("../backend/dist/sessions.zip")
  runtime         = "nodejs18.x"
  timeout         = 30

  layers = [aws_lambda_layer_version.shared_layer.arn]

  environment {
    variables = {
      TABLE_NAME    = var.dynamodb_table_name
      STAGE         = var.environment
      USER_POOL_ID  = var.user_pool_id
    }
  }

  tags = var.tags
  depends_on = [null_resource.build_lambdas]
}

resource "aws_lambda_function" "points_handler" {
  filename         = "../backend/dist/points.zip"
  function_name    = "${var.project_name}-points-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "points.handler"
  source_code_hash = filebase64sha256("../backend/dist/points.zip")
  runtime         = "nodejs18.x"
  timeout         = 30

  layers = [aws_lambda_layer_version.shared_layer.arn]

  environment {
    variables = {
      TABLE_NAME    = var.dynamodb_table_name
      STAGE         = var.environment
      USER_POOL_ID  = var.user_pool_id
    }
  }

  tags = var.tags
  depends_on = [null_resource.build_lambdas]
}

# Build Lambda functions
resource "null_resource" "build_lambdas" {
  triggers = {
    always_run = timestamp()
  }

  provisioner "local-exec" {
    command = <<EOF
      cd ../backend
      npm run build
      mkdir -p dist
      cd src/handlers
      for handler in auth users sessions points; do
        zip -j ../../dist/$handler.zip $handler.js
      done
    EOF
  }
}

# API Gateway
resource "aws_api_gateway_rest_api" "re_event_api" {
  name        = "${var.project_name}-api-${var.environment}"
  description = "API for re:Event application"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = var.tags
}

# Cognito Authorizer
resource "aws_api_gateway_authorizer" "cognito_authorizer" {
  name          = "${var.project_name}-authorizer-${var.environment}"
  rest_api_id   = aws_api_gateway_rest_api.re_event_api.id
  type          = "COGNITO_USER_POOLS"
  provider_arns = [var.user_pool_arn]
}

# CORS configuration
resource "aws_api_gateway_method" "cors_method" {
  rest_api_id   = aws_api_gateway_rest_api.re_event_api.id
  resource_id   = aws_api_gateway_rest_api.re_event_api.root_resource_id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "cors_integration" {
  rest_api_id = aws_api_gateway_rest_api.re_event_api.id
  resource_id = aws_api_gateway_rest_api.re_event_api.root_resource_id
  http_method = aws_api_gateway_method.cors_method.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = jsonencode({
      statusCode = 200
    })
  }
}

resource "aws_api_gateway_method_response" "cors_method_response" {
  rest_api_id = aws_api_gateway_rest_api.re_event_api.id
  resource_id = aws_api_gateway_rest_api.re_event_api.root_resource_id
  http_method = aws_api_gateway_method.cors_method.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "cors_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.re_event_api.id
  resource_id = aws_api_gateway_rest_api.re_event_api.root_resource_id
  http_method = aws_api_gateway_method.cors_method.http_method
  status_code = aws_api_gateway_method_response.cors_method_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS,POST,PUT,DELETE'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

# API Resources and Methods
module "auth_api" {
  source = "./api_resource"
  
  api_id          = aws_api_gateway_rest_api.re_event_api.id
  parent_id       = aws_api_gateway_rest_api.re_event_api.root_resource_id
  path_part       = "auth"
  lambda_function = aws_lambda_function.auth_handler
  authorizer_id   = null
}

module "users_api" {
  source = "./api_resource"
  
  api_id          = aws_api_gateway_rest_api.re_event_api.id
  parent_id       = aws_api_gateway_rest_api.re_event_api.root_resource_id
  path_part       = "users"
  lambda_function = aws_lambda_function.users_handler
  authorizer_id   = aws_api_gateway_authorizer.cognito_authorizer.id
}

module "sessions_api" {
  source = "./api_resource"
  
  api_id          = aws_api_gateway_rest_api.re_event_api.id
  parent_id       = aws_api_gateway_rest_api.re_event_api.root_resource_id
  path_part       = "sessions"
  lambda_function = aws_lambda_function.sessions_handler
  authorizer_id   = null
}

module "points_api" {
  source = "./api_resource"
  
  api_id          = aws_api_gateway_rest_api.re_event_api.id
  parent_id       = aws_api_gateway_rest_api.re_event_api.root_resource_id
  path_part       = "points"
  lambda_function = aws_lambda_function.points_handler
  authorizer_id   = aws_api_gateway_authorizer.cognito_authorizer.id
}

# API Deployment
resource "aws_api_gateway_deployment" "re_event_deployment" {
  depends_on = [
    module.auth_api,
    module.users_api,
    module.sessions_api,
    module.points_api
  ]

  rest_api_id = aws_api_gateway_rest_api.re_event_api.id
  stage_name  = var.environment

  lifecycle {
    create_before_destroy = true
  }
}