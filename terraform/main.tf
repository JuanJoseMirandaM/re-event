# Database Module
module "database" {
  source       = "./modules/database"
  project_name = var.project_name
  environment  = var.environment
  common_tags  = var.common_tags
}

# Auth Module
module "auth" {
  source                = "./modules/auth"
  project_name          = var.project_name
  environment           = var.environment
  common_tags           = var.common_tags
  dynamodb_table_name   = module.database.users_table_name
  dynamodb_table_arn    = module.database.users_table_arn
  google_client_id      = var.google_client_id
  google_client_secret  = var.google_client_secret
  cognito_callback_urls = var.cognito_callback_urls
  cognito_logout_urls   = var.cognito_logout_urls
}

# API Module
module "api" {
  source = "./modules/api"
  
  project_name = var.project_name
  environment  = var.environment
  common_tags  = var.common_tags
  
  # Database table names and ARNs
  users_table_name = module.database.users_table_name
  users_table_arn  = module.database.users_table_arn
  
  events_table_name = module.database.events_table_name
  events_table_arn  = module.database.events_table_arn
  
  evaluations_table_name = module.database.evaluations_table_name
  evaluations_table_arn  = module.database.evaluations_table_arn
  
  verification_codes_table_name = module.database.verification_codes_table_name
  verification_codes_table_arn  = module.database.verification_codes_table_arn

  points_codes_table_name       = module.database.points_codes_table_name
  points_codes_table_arn        = module.database.points_codes_table_arn

  points_claims_table_name      = module.database.points_claims_table_name
  points_claims_table_arn       = module.database.points_claims_table_arn
  
  fcm_tokens_table_name = module.database.fcm_tokens_table_name
  fcm_tokens_table_arn  = module.database.fcm_tokens_table_arn
  
  notifications_table_name = module.database.notifications_table_name
  notifications_table_arn  = module.database.notifications_table_arn
  
  # Required variables that need to be defined
  s3_bucket_name        = var.s3_bucket_name
  cognito_user_pool_arn = module.auth.user_pool_arn

}
