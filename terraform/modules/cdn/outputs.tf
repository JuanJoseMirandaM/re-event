# =============================================================================
# CDN MODULE OUTPUTS - FaceFinder Integration
# =============================================================================

output "cloudfront_distribution_id" {
  description = "CloudFront Distribution ID"
  value       = aws_cloudfront_distribution.main.id
}

output "cloudfront_domain_name" {
  description = "CloudFront Distribution domain name"
  value       = aws_cloudfront_distribution.main.domain_name
}

output "cloudfront_hosted_zone_id" {
  description = "CloudFront Distribution hosted zone ID"
  value       = aws_cloudfront_distribution.main.hosted_zone_id
}