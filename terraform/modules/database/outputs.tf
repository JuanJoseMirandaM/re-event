output "users_table_name" {
  description = "Name of the DynamoDB table"
  value       = aws_dynamodb_table.users.name
}

output "users_table_arn" {
  description = "ARN of the DynamoDB table"
  value       = aws_dynamodb_table.users.arn
}

output "events_table_name" {
  description = "Name of the Events DynamoDB table"
  value       = aws_dynamodb_table.events.name
}

output "events_table_arn" {
  description = "ARN of the Events DynamoDB table"
  value       = aws_dynamodb_table.events.arn
}

output "evaluations_table_name" {
  description = "Name of the Evaluations DynamoDB table"
  value       = aws_dynamodb_table.evaluations.name
}

output "evaluations_table_arn" {
  description = "ARN of the evaluations DynamoDB table"
  value       = aws_dynamodb_table.evaluations.arn
}

output "verification_codes_table_name" {
  description = "Name of the verification codes DynamoDB table"
  value       = aws_dynamodb_table.verification_codes.name
}

output "verification_codes_table_arn" {
  description = "ARN of the verification codes DynamoDB table"
  value       = aws_dynamodb_table.verification_codes.arn
}

# Points System Tables
output "points_codes_table_name" {
  description = "Name of the points codes DynamoDB table"
  value       = aws_dynamodb_table.points_codes.name
}

output "points_codes_table_arn" {
  description = "ARN of the points codes DynamoDB table"
  value       = aws_dynamodb_table.points_codes.arn
}

output "points_claims_table_name" {
  description = "Name of the points claims DynamoDB table"
  value       = aws_dynamodb_table.points_claims.name
}

output "points_claims_table_arn" {
  description = "ARN of the points claims DynamoDB table"
  value       = aws_dynamodb_table.points_claims.arn
}

output "fcm_tokens_table_name" {
  description = "Name of the FCM tokens DynamoDB table"
  value       = aws_dynamodb_table.fcm_tokens.name
}

output "fcm_tokens_table_arn" {
  description = "ARN of the FCM tokens DynamoDB table"
  value       = aws_dynamodb_table.fcm_tokens.arn
}