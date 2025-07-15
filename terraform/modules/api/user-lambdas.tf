# Get User Lambda
resource "aws_lambda_function" "get_user" {
  filename         = "${path.module}/../../../backend/lambdas/user/get-user.zip"
  function_name    = "${var.project_name}-get-user-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "get-user.handler"
  runtime         = "nodejs18.x"
  timeout         = 30

  environment {
    variables = {
      USERS_TABLE = var.users_table_name
    }
  }

  depends_on = [data.archive_file.get_user_zip]
  tags = var.common_tags
}

# Update User Lambda
resource "aws_lambda_function" "update_user" {
  filename         = "${path.module}/../../../backend/lambdas/user/update-user.zip"
  function_name    = "${var.project_name}-update-user-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "update-user.handler"
  runtime         = "nodejs18.x"
  timeout         = 30

  environment {
    variables = {
      USERS_TABLE = var.users_table_name
    }
  }

  depends_on = [data.archive_file.update_user_zip]
  tags = var.common_tags
}

# Lambda permissions for API Gateway
resource "aws_lambda_permission" "get_user_api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_user.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "update_user_api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.update_user.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}