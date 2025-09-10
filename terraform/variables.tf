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

variable "s3_bucket_name" {
  description = "S3 bucket name for storing verification codes PDF"
  type        = string
  default     = "reevent-verification-codes-dev"
}

# Firebase Configuration Variables
variable "firebase_project_id" {
  description = "Firebase Project ID for FCM notifications"
  type        = string
  default     = ""
}

variable "firebase_client_email" {
  description = "Firebase Client Email for FCM notifications"
  type        = string
  default     = ""
}

variable "firebase_private_key" {
  description = "Firebase Private Key for FCM notifications"
  type        = string
  default     = ""
  sensitive   = true
}

# =============================================================================
# FACEFINDER VARIABLES - Integración del proyecto FaceFinder
# =============================================================================

variable "event_name" {
  description = "Event name for FaceFinder resources"
  type        = string
  default     = "aws-community-day-bolivia-2025"
}

variable "aws_profile" {
  description = "AWS profile to use for FaceFinder resources"
  type        = string
  default     = "terraform"
}
