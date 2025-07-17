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
  dynamodb_table_name  = module.database.users_table_name
  dynamodb_table_arn   = module.database.users_table_arn
  google_client_id     = var.google_client_id
  google_client_secret = var.google_client_secret
  cognito_callback_urls = var.cognito_callback_urls
  cognito_logout_urls   = var.cognito_logout_urls
}

# API Module
module "api" {
  source = "./modules/api"

  project_name                 = var.project_name
  environment                  = var.environment
  common_tags                  = var.common_tags
  users_table_name             = module.database.users_table_name
  users_table_arn              = module.database.users_table_arn
  events_table_name            = module.database.events_table_name
  events_table_arn             = module.database.events_table_arn
  notifications_table_name     = module.database.notifications_table_name
  notifications_table_arn      = module.database.notifications_table_arn
  cognito_user_pool_arn        = module.auth.user_pool_arn
}

# AppSync Module
module "appsync" {
  source = "./modules/appsync"

  project_name            = var.project_name
  environment             = var.environment
  common_tags             = var.common_tags
  notifications_table_name = module.database.notifications_table_name
  notifications_table_arn  = module.database.notifications_table_arn
  cognito_user_pool_id    = module.auth.user_pool_id
}