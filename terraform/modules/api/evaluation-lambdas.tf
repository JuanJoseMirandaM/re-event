# Create Evaluation Lambda
resource "aws_lambda_function" "create_evaluation" {
  filename      = "${path.module}/../../../backend/lambdas/evaluation/create-evaluation.zip"
  function_name = "${var.project_name}-create-evaluation-${var.environment}"
  role          = aws_iam_role.lambda_role.arn
  handler       = "create-evaluation.handler"
  runtime       = "nodejs18.x"
  timeout       = 30

  environment {
    variables = {
      EVALUATIONS_TABLE = var.evaluations_table_name
    }
  }

  depends_on = [data.archive_file.create_evaluation_zip]
  tags       = var.common_tags
}

# Get Evaluation Lambda
resource "aws_lambda_function" "get_evaluation" {
  filename      = "${path.module}/../../../backend/lambdas/evaluation/get-evaluation.zip"
  function_name = "${var.project_name}-get-evaluation-${var.environment}"
  role          = aws_iam_role.lambda_role.arn
  handler       = "get-evaluation.handler"
  runtime       = "nodejs18.x"
  timeout       = 30

  environment {
    variables = {
      EVALUATIONS_TABLE = var.evaluations_table_name
    }
  }

  depends_on = [data.archive_file.get_evaluation_zip]
  tags       = var.common_tags
}

# List Evaluation By Session Lambda
resource "aws_lambda_function" "get_evaluations_by_session" {
  filename      = "${path.module}/../../../backend/lambdas/evaluation/get-evaluations-by-session.zip"
  function_name = "${var.project_name}-get-evaluations-by-session-${var.environment}"
  role          = aws_iam_role.lambda_role.arn
  handler       = "get-evaluations-by-session.handler"
  runtime       = "nodejs18.x"
  timeout       = 30

  environment {
    variables = {
      EVALUATIONS_TABLE = var.evaluations_table_name
    }
  }

  depends_on = [data.archive_file.get_evaluations_by_session_zip]
  tags       = var.common_tags
}

# List Evaluation By User Lambda
resource "aws_lambda_function" "get_evaluations_by_user" {
  filename      = "${path.module}/../../../backend/lambdas/evaluation/get-evaluations-by-user.zip"
  function_name = "${var.project_name}-get-evaluations-by-user-${var.environment}"
  role          = aws_iam_role.lambda_role.arn
  handler       = "get_evaluations_by_user.handler"
  runtime       = "nodejs18.x"
  timeout       = 30

  environment {
    variables = {
      EVALUATIONS_TABLE = var.evaluations_table_name
    }
  }

  depends_on = [data.archive_file.get_evaluations_by_user_zip]
  tags       = var.common_tags
}

# Lambda permissions for API Gateway
resource "aws_lambda_permission" "create_evaluation_api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.create_evaluation.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "get_evaluation_api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_evaluation.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "get_evaluations_by_session_api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_evaluations_by_session.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "get_evaluations_by_user_api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_evaluations_by_user.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}
