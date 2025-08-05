# Generate Codes Lambda
resource "aws_lambda_function" "generate_codes" {
  filename         = "${path.module}/../../../backend/lambdas/verification/generate-codes.zip"
  function_name    = "${var.project_name}-generate-codes-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "generate-codes.handler"
  runtime         = "nodejs18.x"
  timeout         = 120

  environment {
    variables = {
      VERIFICATION_CODES_TABLE = var.verification_codes_table_name
      S3_BUCKET = var.s3_bucket_name
    }
  }

  depends_on = [data.archive_file.generate_codes_zip]
  tags = var.common_tags
}

# Verify Code Lambda
resource "aws_lambda_function" "verify_code" {
  filename         = "${path.module}/../../../backend/lambdas/user/verify-code.zip"
  function_name    = "${var.project_name}-verify-code-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "verify-code.handler"
  runtime         = "nodejs18.x"
  timeout         = 30

  environment {
    variables = {
      USERS_TABLE = var.users_table_name
      VERIFICATION_CODES_TABLE = var.verification_codes_table_name
    }
  }

  depends_on = [data.archive_file.verify_code_zip]
  tags = var.common_tags
}

# Lambda permissions for API Gateway
resource "aws_lambda_permission" "generate_codes_api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.generate_codes.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "verify_code_api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.verify_code.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
} 