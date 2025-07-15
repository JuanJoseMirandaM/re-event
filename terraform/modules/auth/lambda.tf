# Lambda trigger for post-confirmation
resource "aws_lambda_function" "post_confirmation" {
  filename      = "${path.module}/../../../backend/lambdas/user/auth-post-confirmation.zip"
  function_name = "${var.project_name}-auth-post-confirmation-${var.environment}"
  role         = aws_iam_role.lambda_role.arn
  handler      = "auth-post-confirmation.handler"
  runtime      = "nodejs18.x"
  timeout      = 30

  environment {
    variables = {
      USERS_TABLE = var.dynamodb_table_name
    }
  }

  depends_on = [data.archive_file.auth_post_confirmation_zip]
  tags = var.common_tags
}

# Lambda permission for Cognito
resource "aws_lambda_permission" "cognito_post_confirmation" {
  statement_id  = "AllowCognitoInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.post_confirmation.function_name
  principal     = "cognito-idp.amazonaws.com"
}