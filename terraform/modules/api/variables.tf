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

variable "notifications_table_name" {
  description = "DynamoDB notifications table name"
  type        = string
}

variable "notifications_table_arn" {
  description = "DynamoDB notifications table ARN"
  type        = string
}

variable "cognito_user_pool_arn" {
  description = "Cognito User Pool ARN for API Gateway authorization"
  type        = string
}