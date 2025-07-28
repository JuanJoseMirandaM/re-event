# Lambda trigger for post-confirmation
resource "aws_lambda_function" "create_user" {
  filename      = "${path.module}/../../../backend/lambdas/user/create-user.zip"
  function_name = "${var.project_name}-create-user-${var.environment}"
  role         = aws_iam_role.lambda_role.arn
  handler      = "create-user.handler"
  runtime      = "nodejs18.x"
  timeout      = 30

  environment {
    variables = {
      USERS_TABLE = var.dynamodb_table_name
    }
  }

  depends_on = [data.archive_file.create_user_zip]
  tags = var.common_tags
}

# Lambda permission for Cognito
resource "aws_lambda_permission" "cognito_create_user" {
  statement_id  = "AllowCognitoInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.create_user.function_name
  principal     = "cognito-idp.amazonaws.com"
}