# Lambda para crear notificaciones
resource "aws_lambda_function" "create_notification" {
  function_name = "${var.project_name}-create-notification-${var.environment}"
  filename      = data.archive_file.create_notification_zip.output_path
  role          = aws_iam_role.lambda_role.arn
  handler       = "create-notification.handler"
  runtime       = "nodejs18.x"
  timeout       = 10
  memory_size   = 128

  environment {
    variables = {
      NOTIFICATIONS_TABLE = var.notifications_table_name
    }
  }

  depends_on = [data.archive_file.create_notification_zip]
  tags = var.common_tags
}

# Lambda para listar notificaciones
resource "aws_lambda_function" "list_notifications" {
  function_name = "${var.project_name}-list-notifications-${var.environment}"
  filename      = data.archive_file.list_notifications_zip.output_path
  role          = aws_iam_role.lambda_role.arn
  handler       = "list-notifications.handler"
  runtime       = "nodejs18.x"
  timeout       = 10
  memory_size   = 128

  environment {
    variables = {
      NOTIFICATIONS_TABLE = var.notifications_table_name
    }
  }

  depends_on = [data.archive_file.list_notifications_zip]
  tags = var.common_tags
}

# Lambda para marcar notificaciones como leídas
resource "aws_lambda_function" "mark_notification_read" {
  function_name = "${var.project_name}-mark-notification-read-${var.environment}"
  filename      = data.archive_file.mark_notification_read_zip.output_path
  role          = aws_iam_role.lambda_role.arn
  handler       = "mark-notification-read.handler"
  runtime       = "nodejs18.x"
  timeout       = 10
  memory_size   = 128

  environment {
    variables = {
      NOTIFICATIONS_TABLE = var.notifications_table_name
    }
  }

  depends_on = [data.archive_file.mark_notification_read_zip]
  tags = var.common_tags
}

# Permisos para invocar las funciones Lambda desde API Gateway
resource "aws_lambda_permission" "create_notification" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.create_notification.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "list_notifications" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.list_notifications.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "mark_notification_read" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.mark_notification_read.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}