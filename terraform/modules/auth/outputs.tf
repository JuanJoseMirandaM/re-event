output "user_pool_id" {
  description = "Cognito User Pool ID"
  value       = aws_cognito_user_pool.re_event_pool.id
}

output "user_pool_arn" {
  description = "Cognito User Pool ARN"
  value       = aws_cognito_user_pool.re_event_pool.arn
}

output "user_pool_client_id" {
  description = "Cognito User Pool Client ID"
  value       = aws_cognito_user_pool_client.re_event_client.id
}

output "user_pool_domain" {
  description = "Cognito User Pool Domain"
  value       = aws_cognito_user_pool_domain.re_event_domain.domain
}