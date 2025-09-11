# Add Favorite Lambda
resource "aws_lambda_function" "add_favorite" {
  filename         = "${path.module}/../../../backend/lambdas/favorites/add-favorite.zip"
  function_name    = "${var.project_name}-add-favorite-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "add-favorite.handler"
  runtime         = "nodejs18.x"
  timeout         = 30

  environment {
    variables = {
      EVENTS_TABLE = var.events_table_name
      FAVORITES_TABLE = var.favorites_table_name
    }
  }

  depends_on = [data.archive_file.add_favorite_zip]
  tags = var.common_tags
}

# Remove Favorite Lambda
resource "aws_lambda_function" "remove_favorite" {
  filename         = "${path.module}/../../../backend/lambdas/favorites/remove-favorite.zip"
  function_name    = "${var.project_name}-remove-favorite-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "remove-favorite.handler"
  runtime         = "nodejs18.x"
  timeout         = 30

  environment {
    variables = {
      FAVORITES_TABLE = var.favorites_table_name
    }
  }

  depends_on = [data.archive_file.remove_favorite_zip]
  tags = var.common_tags
}

# Get Favorites Lambda
resource "aws_lambda_function" "get_favorites" {
  filename         = "${path.module}/../../../backend/lambdas/favorites/get-favorites.zip"
  function_name    = "${var.project_name}-get-favorites-${var.environment}"
  role            = aws_iam_role.lambda_role.arn
  handler         = "get-favorites.handler"
  runtime         = "nodejs18.x"
  timeout         = 30

  environment {
    variables = {
      FAVORITES_TABLE = var.favorites_table_name
      EVENTS_TABLE = var.events_table_name
    }
  }

  depends_on = [data.archive_file.get_favorites_zip]
  tags = var.common_tags
}

# Lambda permissions for API Gateway
resource "aws_lambda_permission" "add_favorite_api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.add_favorite.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "remove_favorite_api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.remove_favorite.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "get_favorites_api_gateway" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_favorites.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}
