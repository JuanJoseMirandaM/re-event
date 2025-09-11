# Create Event Lambda
resource "aws_lambda_function" "create_event" {
  filename         = "${path.module}/../../../backend/lambdas/event/create-event.zip"
  function_name    = "${var.project_name}-create-event-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "create-event.handler"
  runtime         = "nodejs18.x"
  timeout         = 30

  environment {
    variables = {
      EVENTS_TABLE = var.events_table_name
    }
  }

  depends_on = [data.archive_file.create_event_zip]
  tags = var.common_tags
}

# Get Event Lambda
resource "aws_lambda_function" "get_event" {
  filename         = "${path.module}/../../../backend/lambdas/event/get-event.zip"
  function_name    = "${var.project_name}-get-event-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "get-event.handler"
  runtime         = "nodejs18.x"
  timeout         = 30

  environment {
    variables = {
      EVENTS_TABLE = var.events_table_name
    }
  }

  depends_on = [data.archive_file.get_event_zip]
  tags = var.common_tags
}

# Update Event Lambda
resource "aws_lambda_function" "update_event" {
  filename         = "${path.module}/../../../backend/lambdas/event/update-event.zip"
  function_name    = "${var.project_name}-update-event-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "update-event.handler"
  runtime         = "nodejs18.x"
  timeout         = 30

  environment {
    variables = {
      EVENTS_TABLE = var.events_table_name
    }
  }

  depends_on = [data.archive_file.update_event_zip]
  tags = var.common_tags
}

# List Events Lambda
resource "aws_lambda_function" "get_events" {
  filename         = "${path.module}/../../../backend/lambdas/event/get-events.zip"
  function_name    = "${var.project_name}-get-events-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "get-events.handler"
  runtime         = "nodejs18.x"
  timeout         = 30
  source_code_hash = data.archive_file.get_events_zip.output_base64sha256

  environment {
    variables = {
      EVENTS_TABLE = var.events_table_name
      EVALUATIONS_TABLE = var.evaluations_table_name
      FAVORITES_TABLE = var.favorites_table_name
    }
  }

  depends_on = [data.archive_file.get_events_zip]
  tags = var.common_tags
}

# Delete Event Lambda
resource "aws_lambda_function" "delete_event" {
  filename         = "${path.module}/../../../backend/lambdas/event/delete-event.zip"
  function_name    = "${var.project_name}-delete-event-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "delete-event.handler"
  runtime         = "nodejs18.x"
  timeout         = 30

  environment {
    variables = {
      EVENTS_TABLE = var.events_table_name
    }
  }

  depends_on = [data.archive_file.delete_event_zip]
  tags = var.common_tags
}

# Lambda permissions for API Gateway
resource "aws_lambda_permission" "create_event_api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.create_event.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "get_event_api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_event.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "update_event_api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.update_event.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "get_events_api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_events.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "delete_event_api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.delete_event.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}