# Database Module
module "database" {
  source = "./modules/database"

  project_name = var.project_name
  environment  = var.environment
  common_tags  = var.common_tags
}

# Auth Module
module "auth" {
  source = "./modules/auth"

  project_name         = var.project_name
  environment          = var.environment
  common_tags          = var.common_tags
  dynamodb_table_name  = module.database.table_name
  dynamodb_table_arn   = module.database.table_arn
  google_client_id     = var.google_client_id
  google_client_secret = var.google_client_secret
  cognito_callback_urls = var.cognito_callback_urls
  cognito_logout_urls   = var.cognito_logout_urls
}