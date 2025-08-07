# Claim Points Lambda
resource "aws_lambda_function" "claim_points" {
  filename         = "${path.module}/../../../backend/lambdas/points/claim-points.zip"
  function_name    = "${var.project_name}-claim-points-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "claim-points.handler"
  runtime         = "nodejs18.x"
  timeout         = 30

  environment {
    variables = {
      POINTS_CODES_TABLE = var.points_codes_table_name
      POINTS_CLAIMS_TABLE = var.points_claims_table_name
      USERS_TABLE = var.users_table_name
    }
  }

  depends_on = [data.archive_file.claim_points_zip]
  tags = var.common_tags
}

# Generate Code Lambda
resource "aws_lambda_function" "generate_code" {
  filename         = "${path.module}/../../../backend/lambdas/points/generate-code.zip"
  function_name    = "${var.project_name}-generate-code-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "generate-code.handler"
  runtime         = "nodejs18.x"
  timeout         = 120

  environment {
    variables = {
      POINTS_CODES_TABLE = var.points_codes_table_name
      S3_BUCKET = var.s3_bucket_name
    }
  }

  depends_on = [data.archive_file.generate_code_zip]
  tags = var.common_tags
}

# Get Points History Lambda
resource "aws_lambda_function" "get_points_history" {
  filename         = "${path.module}/../../../backend/lambdas/points/get-points-history.zip"
  function_name    = "${var.project_name}-get-points-history-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "get-points-history.handler"
  runtime         = "nodejs18.x"
  timeout         = 30

  environment {
    variables = {
      POINTS_CLAIMS_TABLE = var.points_claims_table_name
    }
  }

  depends_on = [data.archive_file.get_points_history_zip]
  tags = var.common_tags
}

# Get Total Points Lambda
resource "aws_lambda_function" "get_total_points" {
  filename         = "${path.module}/../../../backend/lambdas/points/get-total-points.zip"
  function_name    = "${var.project_name}-get-total-points-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "get-total-points.handler"
  runtime         = "nodejs18.x"
  timeout         = 30

  environment {
    variables = {
      USERS_TABLE = var.users_table_name
    }
  }

  depends_on = [data.archive_file.get_total_points_zip]
  tags = var.common_tags
}

# Lambda permissions for API Gateway
resource "aws_lambda_permission" "claim_points_api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.claim_points.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "generate_code_api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.generate_code.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "get_points_history_api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_points_history.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "get_total_points_api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_total_points.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
} 