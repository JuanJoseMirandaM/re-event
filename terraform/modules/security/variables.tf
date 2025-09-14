# =============================================================================
# SECURITY MODULE VARIABLES - FaceFinder Integration
# =============================================================================

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "common_tags" {
  description = "Common tags for all resources"
  type        = map(string)
}

variable "s3_bucket_arn" {
  description = "S3 bucket ARN for IAM policies"
  type        = string
}

variable "dynamodb_table_arn" {
  description = "DynamoDB table ARN for IAM policies"
  type        = string
}

variable "facefinder_table_arn" {
  description = "FaceFinder DynamoDB table ARN for IAM policies"
  type        = string
}

variable "rekognition_collection_id" {
  description = "Rekognition collection ID"
  type        = string
}