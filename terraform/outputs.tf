output "users_table_name" {
  description = "Name of the Users DynamoDB table"
  value       = module.database.users_table_name
}

output "users_table_arn" {
  description = "ARN of the Users DynamoDB table"
  value       = module.database.users_table_arn
}

output "lambda_role_arn" {
  description = "ARN of the Lambda execution role"
  value       = module.auth.lambda_role_arn
}

output "user_pool_id" {
  description = "ID of the User Pool de Cognito"
  value       = module.auth.user_pool_id
}

output "user_pool_client_id" {
  description = "ID of the User Pool Client"
  value       = module.auth.user_pool_client_id
}

output "cognito_domain" {
  description = "Cognito domain URL"
  value       = module.auth.cognito_domain
}

output "api_gateway_url" {
  description = "API Gateway URL"
  value       = module.api.api_gateway_url
}

output "api_gateway_id" {
  description = "API Gateway ID"
  value       = module.api.api_gateway_id
}

output "events_table_name" {
  description = "Name of the Events DynamoDB table"
  value       = module.database.events_table_name
}

output "events_table_arn" {
  description = "ARN of the Events DynamoDB table"
  value       = module.database.events_table_arn
}

output "evaluations_table_name" {
  description = "Name of the Evaluations DynamoDB table"
  value       = module.database.evaluations_table_name
}

output "evaluations_table_arn" {
  description = "ARN of the Evaluations DynamoDB table"
  value       = module.database.evaluations_table_arn
}

output "verification_codes_s3_bucket_name" {
  description = "Name of the verification codes S3 bucket"
  value       = module.storage.verification_codes_bucket_name
}

output "verification_codes_s3_bucket_arn" {
  description = "ARN of the verification codes S3 bucket"
  value       = module.storage.verification_codes_bucket_arn
}

# =============================================================================
# FACEFINDER OUTPUTS - Integración del proyecto FaceFinder
# =============================================================================

output "facefinder_s3_bucket_name" {
  description = "Name of the FaceFinder S3 bucket"
  value       = module.storage.bucket_name
}

output "facefinder_s3_bucket_arn" {
  description = "ARN of the FaceFinder S3 bucket"
  value       = module.storage.bucket_arn
}

output "rekognition_collection_id" {
  description = "Rekognition Collection ID for face recognition"
  value       = module.ai.collection_id
}

output "sqs_queue_url" {
  description = "SQS Queue URL for batch processing"
  value       = module.messaging.queue_url
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = module.cdn.cloudfront_domain_name
}

output "facefinder_lambda_functions" {
  description = "FaceFinder Lambda function details"
  value       = module.compute.lambda_functions
  sensitive   = true
}
