# =============================================================================
# SECURITY MODULE OUTPUTS - FaceFinder Integration
# =============================================================================

output "lambda_execution_role_arn" {
  description = "ARN of the Lambda execution role"
  value       = aws_iam_role.lambda_execution_role.arn
}

output "lambda_execution_role_name" {
  description = "Name of the Lambda execution role"
  value       = aws_iam_role.lambda_execution_role.name
}

output "lambda_sqs_policy_attachment" {
  description = "SQS policy attachment for dependencies"
  value       = aws_iam_role_policy_attachment.lambda_sqs_policy_attachment
}