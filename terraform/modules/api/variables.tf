variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "common_tags" {
  description = "Common tags for all resources"
  type        = map(string)
}

variable "users_table_name" {
  description = "DynamoDB users table name"
  type        = string
}

variable "users_table_arn" {
  description = "DynamoDB users table ARN"
  type        = string
}

variable "events_table_name" {
  description = "DynamoDB events table name"
  type        = string
}

variable "events_table_arn" {
  description = "DynamoDB events table ARN"
  type        = string
}

variable "evaluations_table_name" {
  description = "DynamoDB evaluations table name"
  type        = string
}

variable "evaluations_table_arn" {
  description = "DynamoDB evaluations table ARN"
  type        = string
}

variable "cognito_user_pool_arn" {
  description = "Cognito User Pool ARN for API Gateway authorization"
  type        = string
}

variable "verification_codes_table_name" {
  description = "DynamoDB verification codes table name"
  type        = string
}

variable "s3_bucket_name" {
  description = "S3 bucket name for storing verification codes PDF"
  type        = string
}

variable "verification_codes_table_arn" {
  description = "DynamoDB verification codes table ARN"
  type        = string
}

# Points System Variables
variable "points_codes_table_name" {
  description = "Name of the points codes DynamoDB table"
  type        = string
}

variable "points_codes_table_arn" {
  description = "ARN of the points codes DynamoDB table"
  type        = string
}

variable "points_claims_table_name" {
  description = "Name of the points claims DynamoDB table"
  type        = string
}

variable "points_claims_table_arn" {
  description = "ARN of the points claims DynamoDB table"
  type        = string
}

# FCM Tokens Variables
variable "fcm_tokens_table_name" {
  description = "Name of the FCM tokens DynamoDB table"
  type        = string
}

variable "fcm_tokens_table_arn" {
  description = "ARN of the FCM tokens DynamoDB table"
  type        = string
}

variable "notifications_table_name" {
  description = "Name of the notifications DynamoDB table"
  type        = string
}

variable "notifications_table_arn" {
  description = "ARN of the notifications DynamoDB table"
  type        = string
}

# Firebase Configuration Variables
variable "firebase_project_id" {
  description = "Firebase Project ID for FCM"
  type        = string
  default     = ""
}

variable "firebase_client_email" {
  description = "Firebase Client Email for FCM"
  type        = string
  default     = ""
}

variable "firebase_private_key" {
  description = "Firebase Private Key for FCM"
  type        = string
  default     = ""
  sensitive   = true
}

# =============================================================================
# FACEFINDER VARIABLES - Integración del proyecto FaceFinder
# =============================================================================

variable "facefinder_lambda_functions" {
  description = "FaceFinder Lambda functions map"
  type        = any
  default     = {}
}