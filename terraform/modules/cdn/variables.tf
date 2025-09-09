# =============================================================================
# CDN MODULE VARIABLES - FaceFinder Integration
# =============================================================================

variable "s3_bucket_name" {
  description = "Name of the S3 bucket"
  type        = string
}

variable "s3_bucket_arn" {
  description = "ARN of the S3 bucket"
  type        = string
}

variable "s3_bucket_regional_domain_name" {
  description = "Regional domain name of the S3 bucket"
  type        = string
}

variable "common_tags" {
  description = "Common tags for all resources"
  type        = map(string)
}