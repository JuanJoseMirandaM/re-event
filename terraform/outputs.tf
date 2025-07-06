output "users_table_name" {
  description = "Name of the Users DynamoDB table"
  value       = aws_dynamodb_table.users.name
}

output "users_table_arn" {
  description = "ARN of the Users DynamoDB table"
  value       = aws_dynamodb_table.users.arn
}

output "lambda_role_arn" {
  description = "ARN of the Lambda execution role"
  value       = aws_iam_role.reevent_lambda_role.arn
}

output "lambda_role_name" {
  description = "Name of the Lambda execution role"
  value       = aws_iam_role.reevent_lambda_role.name
}

output "cognito_user_pool_id" {
  description = "ID of the Cognito User Pool"
  value       = aws_cognito_user_pool.main.id
}

output "cognito_user_pool_client_id" {
  description = "ID of the Cognito User Pool Client"
  value       = aws_cognito_user_pool_client.main.id
}

output "cognito_domain" {
  description = "Cognito hosted UI domain"
  value       = aws_cognito_user_pool_domain.main.domain
}

output "cognito_hosted_ui_url" {
  description = "Cognito hosted UI URL"
  value       = "https://${aws_cognito_user_pool_domain.main.domain}.auth.${var.aws_region}.amazoncognito.com"
}