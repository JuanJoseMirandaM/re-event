output "table_name" {
  description = "DynamoDB table name"
  value       = aws_dynamodb_table.re_event_table.name
}

output "table_arn" {
  description = "DynamoDB table ARN"
  value       = aws_dynamodb_table.re_event_table.arn
}

output "table_stream_arn" {
  description = "DynamoDB table stream ARN"
  value       = aws_dynamodb_table.re_event_table.stream_arn
}