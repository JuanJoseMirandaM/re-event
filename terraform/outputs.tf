output "api_gateway_url" {
  description = "API Gateway URL"
  value       = module.api.api_gateway_url
}

output "cloudfront_distribution_url" {
  description = "CloudFront distribution URL"
  value       = module.frontend.cloudfront_url
}

output "user_pool_id" {
  description = "Cognito User Pool ID"
  value       = module.auth.user_pool_id
}

output "user_pool_client_id" {
  description = "Cognito User Pool Client ID"
  value       = module.auth.user_pool_client_id
}

output "dynamodb_table_name" {
  description = "DynamoDB table name"
  value       = module.database.table_name
}

output "s3_bucket_name" {
  description = "S3 bucket name for frontend"
  value       = module.frontend.s3_bucket_name
}