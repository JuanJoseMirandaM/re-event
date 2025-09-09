# =============================================================================
# MESSAGING MODULE VARIABLES - FaceFinder Integration
# =============================================================================

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "common_tags" {
  description = "Common tags for all resources"
  type        = map(string)
}

variable "s3_bucket_arn" {
  description = "S3 bucket ARN for SQS policy"
  type        = string
}