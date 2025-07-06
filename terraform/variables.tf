variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "reevent"
}

variable "common_tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Project     = "reEvent"
    Environment = "dev"
    App         = "reEvent"
    ManagedBy   = "Terraform"
  }
}

variable "google_client_id" {
  description = "Google OAuth Client ID"
  type        = string
  sensitive   = true
}

variable "google_client_secret" {
  description = "Google OAuth Client Secret"
  type        = string
  sensitive   = true
}

variable "cognito_callback_urls" {
  description = "Callback URLs for Cognito"
  type        = list(string)
  default     = ["http://localhost:4200/auth/callback"]
}

variable "cognito_logout_urls" {
  description = "Logout URLs for Cognito"
  type        = list(string)
  default     = ["http://localhost:4200/auth/logout"]
}
