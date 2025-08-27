# Register FCM Token Lambda
resource "aws_lambda_function" "register_fcm_token" {
  filename         = "${path.module}/../../../backend/lambdas/fcm/register-fcm-token.zip"
  function_name    = "${var.project_name}-register-fcm-token-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "register-fcm-token.handler"
  runtime         = "nodejs18.x"
  timeout         = 30

  environment {
    variables = {
      FCM_TOKENS_TABLE = var.fcm_tokens_table_name
    }
  }

  depends_on = [data.archive_file.register_fcm_token_zip]
  tags = var.common_tags
}

# Data source for the zip file
data "archive_file" "register_fcm_token_zip" {
  type        = "zip"
  source_file = "${path.module}/../../../backend/lambdas/fcm/register-fcm-token.js"
  output_path = "${path.module}/../../../backend/lambdas/fcm/register-fcm-token.zip"
}

# Lambda permissions for API Gateway
resource "aws_lambda_permission" "register_fcm_token_api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.register_fcm_token.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}
