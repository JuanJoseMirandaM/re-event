output "api_gateway_url" {
  description = "API Gateway URL"
  value       = "https://${aws_api_gateway_rest_api.re_event_api.id}.execute-api.${data.aws_region.current.name}.amazonaws.com/${var.environment}"
}

output "api_gateway_id" {
  description = "API Gateway ID"
  value       = aws_api_gateway_rest_api.re_event_api.id
}

data "aws_region" "current" {}