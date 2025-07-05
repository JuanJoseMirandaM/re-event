output "s3_bucket_name" {
  description = "S3 bucket name"
  value       = aws_s3_bucket.frontend_bucket.id
}

output "cloudfront_url" {
  description = "CloudFront distribution URL"
  value       = "https://${aws_cloudfront_distribution.frontend_distribution.domain_name}"
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.frontend_distribution.id
}