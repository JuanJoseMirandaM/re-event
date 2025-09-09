# =============================================================================
# STORAGE MODULE VARIABLES - FaceFinder Integration
# =============================================================================

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "event_name" {
  description = "Event name for FaceFinder resources"
  type        = string
}

variable "common_tags" {
  description = "Common tags for all resources"
  type        = map(string)
}

variable "sqs_queue_arn" {
  description = "SQS Queue ARN for S3 notifications"
  type        = string
}

variable "sqs_queue_policy_dependency" {
  description = "Dependency for SQS queue policy"
  type        = any
}