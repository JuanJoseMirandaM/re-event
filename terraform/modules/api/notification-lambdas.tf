# Create Notification Lambda
resource "aws_lambda_function" "create_notification" {
  filename         = "${path.module}/../../../backend/lambdas/notifications/create-notification.zip"
  function_name    = "${var.project_name}-create-notification-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "create-notification.handler"
  runtime         = "nodejs18.x"
  timeout         = 30
  
  environment {
    variables = {
      NOTIFICATIONS_TABLE = var.notifications_table_name
    }
  }
  
  depends_on = [data.archive_file.create_notification_zip]
  tags = var.common_tags
}

# Get Notifications Lambda
resource "aws_lambda_function" "get_notifications" {
  filename         = "${path.module}/../../../backend/lambdas/notifications/get-notifications.zip"
  function_name    = "${var.project_name}-get-notifications-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "get-notifications.handler"
  runtime         = "nodejs18.x"
  timeout         = 30
  
  environment {
    variables = {
      NOTIFICATIONS_TABLE = var.notifications_table_name
    }
  }
  
  depends_on = [data.archive_file.get_notifications_zip]
  tags = var.common_tags
}

# Data sources for zip files
data "archive_file" "create_notification_zip" {
  type        = "zip"
  source_file = "${path.module}/../../../backend/lambdas/notifications/create-notification.js"
  output_path = "${path.module}/../../../backend/lambdas/notifications/create-notification.zip"
}

data "archive_file" "get_notifications_zip" {
  type        = "zip"
  source_file = "${path.module}/../../../backend/lambdas/notifications/get-notifications.js"
  output_path = "${path.module}/../../../backend/lambdas/notifications/get-notifications.zip"
}

# Lambda permissions for API Gateway
resource "aws_lambda_permission" "create_notification_api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.create_notification.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "get_notifications_api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_notifications.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}
