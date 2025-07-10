# Get User Lambda
resource "aws_lambda_function" "get_user" {
  filename         = "${path.module}/../../../backend/lambdas/user/get-user.zip"
  function_name    = "${var.environment}-get-user"
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
}

# Update User Lambda
resource "aws_lambda_function" "update_user" {
  filename         = "${path.module}/../../../backend/lambdas/user/update-user.zip"
  function_name    = "${var.environment}-update-user"
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
}

# ZIP files
data "archive_file" "get_user_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/lambdas/user"
  output_path = "${path.module}/../../../backend/lambdas/user/get-user.zip"
  excludes    = ["update-user.js", "auth-post-confirmation.js", "*.zip"]
}

data "archive_file" "update_user_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/lambdas/user"
  output_path = "${path.module}/../../../backend/lambdas/user/update-user.zip"
  excludes    = ["get-user.js", "auth-post-confirmation.js", "*.zip"]
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