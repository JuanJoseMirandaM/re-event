# =============================================================================
# MESSAGING MODULE OUTPUTS - FaceFinder Integration
# =============================================================================

output "queue_arn" {
  description = "SQS Queue ARN"
  value       = aws_sqs_queue.batch_queue.arn
}

output "queue_url" {
  description = "SQS Queue URL"
  value       = aws_sqs_queue.batch_queue.url
}

output "queue_policy_dependency" {
  description = "Dependency for SQS queue policy"
  value       = aws_sqs_queue_policy.batch_queue_policy
}

output "dlq_arn" {
  description = "Dead Letter Queue ARN"
  value       = aws_sqs_queue.batch_dlq.arn
}