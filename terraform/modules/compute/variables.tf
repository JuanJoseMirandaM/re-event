# =============================================================================
# COMPUTE MODULE VARIABLES - FaceFinder Integration
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

variable "lambda_execution_role_arn" {
  description = "ARN of the Lambda execution role"
  type        = string
}

variable "s3_bucket_name" {
  description = "Name of the S3 bucket"
  type        = string
}

variable "s3_bucket_arn" {
  description = "ARN of the S3 bucket"
  type        = string
}

variable "dynamodb_table_name" {
  description = "Name of the DynamoDB table"
  type        = string
}

variable "rekognition_collection_id" {
  description = "Rekognition collection ID"
  type        = string
}

variable "sqs_queue_arn" {
  description = "SQS Queue ARN"
  type        = string
}

variable "sqs_queue_url" {
  description = "SQS Queue URL"
  type        = string
}

variable "lambda_sqs_policy_attachment" {
  description = "Lambda SQS policy attachment for dependencies"
  type        = any
}