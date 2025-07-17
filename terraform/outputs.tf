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

output "graphql_api_url" {
  description = "URL of the AppSync GraphQL API"
  value       = module.appsync.graphql_api_url
}

output "graphql_api_id" {
  description = "ID of the AppSync GraphQL API"
  value       = module.appsync.graphql_api_id
}