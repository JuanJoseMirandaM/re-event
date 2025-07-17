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

variable "cognito_user_pool_id" {
  description = "Cognito User Pool ID for AppSync authentication"
  type        = string
}

variable "notifications_table_name" {
  description = "DynamoDB notifications table name"
  type        = string
}

variable "notifications_table_arn" {
  description = "DynamoDB notifications table ARN"
  type        = string
}