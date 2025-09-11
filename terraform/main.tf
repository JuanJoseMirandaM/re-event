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
  
  favorites_table_name = module.database.favorites_table_name
  favorites_table_arn  = module.database.favorites_table_arn
  
  # Required variables that need to be defined
  s3_bucket_name        = var.s3_bucket_name
  cognito_user_pool_arn = module.auth.user_pool_arn
  
  # Firebase Configuration
  firebase_project_id   = var.firebase_project_id
  firebase_client_email = var.firebase_client_email
  firebase_private_key  = var.firebase_private_key
  
  # FaceFinder Lambda Functions
  facefinder_lambda_functions = module.compute.lambda_functions
}

# =============================================================================
# FACEFINDER MODULES - Integración del proyecto FaceFinder
# =============================================================================

locals {
  # Tags comunes para recursos de FaceFinder
  facefinder_tags = merge(var.common_tags, {
    Event = var.event_name
    Component = "FaceFinder"
  })
}

# Storage Module - S3 para imágenes de FaceFinder
module "storage" {
  source = "./modules/storage"
  
  project_name    = var.project_name
  environment     = var.environment
  event_name      = var.event_name
  common_tags     = local.facefinder_tags
  sqs_queue_arn   = module.messaging.queue_arn
  sqs_queue_policy_dependency = module.messaging.queue_policy_dependency
}

# AI Module - Rekognition para reconocimiento facial
module "ai" {
  source = "./modules/ai"
  
  project_name = var.project_name
  environment  = var.environment
  common_tags  = local.facefinder_tags
}

# Messaging Module - SQS para procesamiento batch
module "messaging" {
  source = "./modules/messaging"
  
  project_name   = var.project_name
  environment    = var.environment
  common_tags    = local.facefinder_tags
  s3_bucket_arn  = module.storage.bucket_arn
}

# Security Module - IAM roles para FaceFinder
module "security" {
  source = "./modules/security"
  
  project_name               = var.project_name
  environment                = var.environment
  aws_region                 = var.aws_region
  common_tags                = local.facefinder_tags
  s3_bucket_arn              = module.storage.bucket_arn
  dynamodb_table_arn         = module.database.users_table_arn  # Reutilizamos la tabla unificada
  rekognition_collection_id  = module.ai.collection_id
}

# Compute Module - Lambda functions para FaceFinder
module "compute" {
  source = "./modules/compute"
  
  project_name               = var.project_name
  environment                = var.environment
  event_name                 = var.event_name
  common_tags                = local.facefinder_tags
  lambda_execution_role_arn  = module.security.lambda_execution_role_arn
  s3_bucket_name             = module.storage.bucket_name
  s3_bucket_arn              = module.storage.bucket_arn
  dynamodb_table_name        = module.database.users_table_name  # Reutilizamos la tabla unificada
  rekognition_collection_id  = module.ai.collection_id
  sqs_queue_arn              = module.messaging.queue_arn
  sqs_queue_url              = module.messaging.queue_url
  lambda_sqs_policy_attachment = module.security.lambda_sqs_policy_attachment
}

# CDN Module - CloudFront para servir imágenes
module "cdn" {
  source = "./modules/cdn"
  
  s3_bucket_name                   = module.storage.bucket_name
  s3_bucket_arn                    = module.storage.bucket_arn
  s3_bucket_regional_domain_name   = module.storage.bucket_regional_domain_name
  common_tags                      = local.facefinder_tags
}
