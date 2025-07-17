# AppSync API
resource "aws_appsync_graphql_api" "main" {
  name                = "${var.project_name}-api-${var.environment}"
  authentication_type = "AMAZON_COGNITO_USER_POOLS"
  
  user_pool_config {
    user_pool_id   = var.cognito_user_pool_id
    aws_region     = data.aws_region.current.name
    default_action = "ALLOW"
  }

  schema = file("${path.module}/schema.graphql")
  
  log_config {
    cloudwatch_logs_role_arn = aws_iam_role.appsync_logs.arn
    field_log_level          = "ERROR"
  }

  tags = var.common_tags
}

