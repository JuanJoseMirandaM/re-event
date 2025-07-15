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