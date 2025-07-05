resource "aws_cognito_user_pool" "re_event_pool" {
  name = "${var.project_name}-users-${var.environment}"

  # Password policy
  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_uppercase = true
    require_numbers   = true
    require_symbols   = false
  }

  # User attributes
  username_attributes = ["email"]
  
  auto_verified_attributes = ["email"]

  # Custom attributes
  schema {
    attribute_data_type = "String"
    name               = "role"
    mutable            = true
    
    string_attribute_constraints {
      min_length = 1
      max_length = 20
    }
  }

  schema {
    attribute_data_type = "Boolean"
    name               = "verified"
    mutable            = true
  }

  schema {
    attribute_data_type = "String"
    name               = "verification_code"
    mutable            = true
    
    string_attribute_constraints {
      min_length = 6
      max_length = 6
    }
  }

  schema {
    attribute_data_type = "Number"
    name               = "points"
    mutable            = true
    
    number_attribute_constraints {
      min_value = 0
    }
  }

  # Account recovery
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  # Email configuration
  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }

  # Verification message template
  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject        = "re:Event - Código de verificación"
    email_message        = "Tu código de verificación es {####}"
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-user-pool-${var.environment}"
  })
}

resource "aws_cognito_user_pool_client" "re_event_client" {
  name         = "${var.project_name}-client-${var.environment}"
  user_pool_id = aws_cognito_user_pool.re_event_pool.id

  generate_secret = false

  # Auth flows
  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]

  # OAuth configuration
  supported_identity_providers = ["COGNITO", "Google", "Facebook"]

  callback_urls = [
    var.environment == "prod" ? "https://${var.domain_name}/callback" : "http://localhost:4200/callback"
  ]

  logout_urls = [
    var.environment == "prod" ? "https://${var.domain_name}/logout" : "http://localhost:4200/logout"
  ]

  allowed_oauth_flows = ["code"]
  allowed_oauth_scopes = ["email", "openid", "profile"]
  allowed_oauth_flows_user_pool_client = true

  # Token validity
  access_token_validity  = 60    # 1 hour
  id_token_validity     = 60    # 1 hour
  refresh_token_validity = 30   # 30 days

  token_validity_units {
    access_token  = "minutes"
    id_token      = "minutes"
    refresh_token = "days"
  }
}

# User Pool Domain
resource "aws_cognito_user_pool_domain" "re_event_domain" {
  domain       = "${var.project_name}-${var.environment}"
  user_pool_id = aws_cognito_user_pool.re_event_pool.id
}

# Google Identity Provider (optional)
resource "aws_cognito_identity_provider" "google" {
  count         = var.google_client_id != "" ? 1 : 0
  user_pool_id  = aws_cognito_user_pool.re_event_pool.id
  provider_name = "Google"
  provider_type = "Google"

  provider_details = {
    client_id        = var.google_client_id
    client_secret    = var.google_client_secret
    authorize_scopes = "email openid profile"
  }

  attribute_mapping = {
    email    = "email"
    username = "sub"
    name     = "name"
  }
}

# LinkedIn Identity Provider (optional)
resource "aws_cognito_identity_provider" "linkedin" {
  count         = var.linkedin_client_id != "" ? 1 : 0
  user_pool_id  = aws_cognito_user_pool.re_event_pool.id
  provider_name = "LinkedIn"
  provider_type = "OIDC"

  provider_details = {
    client_id                = var.linkedin_client_id
    client_secret            = var.linkedin_client_secret
    attributes_request_method = "GET"
    oidc_issuer              = "https://www.linkedin.com/oauth"
    authorize_scopes         = "r_liteprofile r_emailaddress"
  }

  attribute_mapping = {
    email    = "email"
    username = "sub"
    name     = "name"
  }
}