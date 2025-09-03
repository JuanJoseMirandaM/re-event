# API Gateway
resource "aws_api_gateway_rest_api" "main" {
  name = "${var.project_name}-api-${var.environment}"
  
  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

# Cognito Authorizer
resource "aws_api_gateway_authorizer" "cognito" {
  name          = "${var.project_name}-cognito-authorizer-${var.environment}"
  rest_api_id   = aws_api_gateway_rest_api.main.id
  type          = "COGNITO_USER_POOLS"
  provider_arns = [var.cognito_user_pool_arn]
}

# Users resource
resource "aws_api_gateway_resource" "users" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "users"
}

resource "aws_api_gateway_resource" "user_id" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.users.id
  path_part   = "{userId}"
}

# GET /users/{userId}
resource "aws_api_gateway_method" "get_user" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.user_id.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "get_user" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.user_id.id
  http_method = aws_api_gateway_method.get_user.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.get_user.invoke_arn
}

# PUT /users/{userId}
resource "aws_api_gateway_method" "update_user" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.user_id.id
  http_method   = "PUT"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "update_user" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.user_id.id
  http_method = aws_api_gateway_method.update_user.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.update_user.invoke_arn
}

# POST /users/generate-codes
resource "aws_api_gateway_resource" "users_generate_codes" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.users.id
  path_part   = "generate-codes"
}

resource "aws_api_gateway_method" "generate_codes" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.users_generate_codes.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "generate_codes" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.users_generate_codes.id
  http_method = aws_api_gateway_method.generate_codes.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.generate_codes.invoke_arn
}

# POST /users/verify-code
resource "aws_api_gateway_resource" "users_verify_code" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.users.id
  path_part   = "verify-code"
}

resource "aws_api_gateway_method" "verify_code" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.users_verify_code.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "verify_code" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.users_verify_code.id
  http_method = aws_api_gateway_method.verify_code.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.verify_code.invoke_arn
}

# CORS
resource "aws_api_gateway_method" "users_options" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.user_id.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "users_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.user_id.id
  http_method = aws_api_gateway_method.users_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = jsonencode({
      statusCode = 200
    })
  }
}

resource "aws_api_gateway_method_response" "users_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.user_id.id
  http_method = aws_api_gateway_method.users_options.http_method
  status_code = "200"
}

resource "aws_api_gateway_integration_response" "users_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.user_id.id
  http_method = aws_api_gateway_method.users_options.http_method
  status_code = aws_api_gateway_method_response.users_options.status_code
}

# Events resource
resource "aws_api_gateway_resource" "events" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "events"
}

resource "aws_api_gateway_resource" "event_id" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.events.id
  path_part   = "{eventId}"
}

# POST /events
resource "aws_api_gateway_method" "create_event" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.events.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "create_event" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.events.id
  http_method = aws_api_gateway_method.create_event.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.create_event.invoke_arn
}

# GET /events
resource "aws_api_gateway_method" "get_events" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.events.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "get_events" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.events.id
  http_method = aws_api_gateway_method.get_events.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.get_events.invoke_arn
}

# GET /events/{eventId}
resource "aws_api_gateway_method" "get_event" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.event_id.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "get_event" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.event_id.id
  http_method = aws_api_gateway_method.get_event.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.get_event.invoke_arn
}

# PUT /events/{eventId}
resource "aws_api_gateway_method" "update_event" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.event_id.id
  http_method   = "PUT"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "update_event" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.event_id.id
  http_method = aws_api_gateway_method.update_event.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.update_event.invoke_arn
}

# DELETE /events/{eventId}
resource "aws_api_gateway_method" "delete_event" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.event_id.id
  http_method   = "DELETE"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "delete_event" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.event_id.id
  http_method = aws_api_gateway_method.delete_event.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.delete_event.invoke_arn
}

# Evaluations resource
resource "aws_api_gateway_resource" "evaluations" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "evaluations"
}

resource "aws_api_gateway_resource" "evaluations_session" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.evaluations.id
  path_part   = "session"
}

resource "aws_api_gateway_resource" "evaluations_session_id" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.evaluations_session.id
  path_part   = "{sessionId}"
}

resource "aws_api_gateway_resource" "evaluations_user" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.evaluations.id
  path_part   = "user"
}

resource "aws_api_gateway_resource" "evaluations_user_id" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.evaluations_user.id
  path_part   = "{userId}"
}

# POST /evaluations
resource "aws_api_gateway_method" "create_evaluation" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.evaluations.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "create_evaluation" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.evaluations.id
  http_method = aws_api_gateway_method.create_evaluation.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.create_evaluation.invoke_arn
}

# GET /evaluations/session/{sessionId}
resource "aws_api_gateway_method" "get_evaluations_by_session" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.evaluations_session_id.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "get_evaluations_by_session" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.evaluations_session_id.id
  http_method = aws_api_gateway_method.get_evaluations_by_session.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.get_evaluations_by_session.invoke_arn
}

# GET /evaluations/user
resource "aws_api_gateway_method" "get_evaluations_by_user" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.evaluations_user.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "get_evaluations_by_user" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.evaluations_user.id
  http_method = aws_api_gateway_method.get_evaluations_by_user.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.get_evaluations_by_user.invoke_arn
}

# GET /evaluation?userId=xxx&sessionId=yyy
resource "aws_api_gateway_method" "get_evaluation_by_session_and_user" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.evaluations.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "get_evaluation_by_session_and_user" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.evaluations.id
  http_method = aws_api_gateway_method.get_evaluation_by_session_and_user.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.get_evaluation.invoke_arn
}

# Points System Resources
resource "aws_api_gateway_resource" "points" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "points"
}

# POST /points/claim
resource "aws_api_gateway_resource" "points_claim" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.points.id
  path_part   = "claim"
}

resource "aws_api_gateway_method" "claim_points" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.points_claim.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "claim_points" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.points_claim.id
  http_method = aws_api_gateway_method.claim_points.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.claim_points.invoke_arn
}

# POST /points/deduct
resource "aws_api_gateway_resource" "points_deduct" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.points.id
  path_part   = "deduct"
}

resource "aws_api_gateway_method" "deduct_points" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.points_deduct.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "deduct_points" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.points_deduct.id
  http_method = aws_api_gateway_method.deduct_points.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.deduct_points.invoke_arn
}

# GET /points/history
resource "aws_api_gateway_resource" "points_history" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.points.id
  path_part   = "history"
}

resource "aws_api_gateway_method" "get_points_history" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.points_history.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "get_points_history" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.points_history.id
  http_method = aws_api_gateway_method.get_points_history.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.get_points_history.invoke_arn
}

# GET /points/history/{userId}
resource "aws_api_gateway_resource" "points_history_user" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.points_history.id
  path_part   = "{userId}"
}

resource "aws_api_gateway_method" "get_points_history_user" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.points_history_user.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "get_points_history_user" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.points_history_user.id
  http_method = aws_api_gateway_method.get_points_history_user.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.get_points_history.invoke_arn
}

# GET /points/total
resource "aws_api_gateway_resource" "points_total" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.points.id
  path_part   = "total"
}

resource "aws_api_gateway_method" "get_total_points" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.points_total.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "get_total_points" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.points_total.id
  http_method = aws_api_gateway_method.get_total_points.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.get_total_points.invoke_arn
}

# POST /points/generate-code
resource "aws_api_gateway_resource" "points_generate_code" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.points.id
  path_part   = "generate-code"
}

resource "aws_api_gateway_method" "generate_code" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.points_generate_code.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "generate_code" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.points_generate_code.id
  http_method = aws_api_gateway_method.generate_code.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.generate_code.invoke_arn
}

# FCM Tokens resource
resource "aws_api_gateway_resource" "fcm_tokens" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "fcm-tokens"
}

# POST /fcm-tokens/register
resource "aws_api_gateway_resource" "fcm_tokens_register" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.fcm_tokens.id
  path_part   = "register"
}

resource "aws_api_gateway_method" "register_fcm_token" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.fcm_tokens_register.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

resource "aws_api_gateway_integration" "register_fcm_token" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.fcm_tokens_register.id
  http_method = aws_api_gateway_method.register_fcm_token.http_method

  integration_http_method = "POST"
  type                   = "AWS_PROXY"
  uri                    = aws_lambda_function.register_fcm_token.invoke_arn
}

# OPTIONS method for CORS
resource "aws_api_gateway_method" "fcm_tokens_options" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.fcm_tokens_register.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "fcm_tokens_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.fcm_tokens_register.id
  http_method = aws_api_gateway_method.fcm_tokens_options.http_method

  type = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "fcm_tokens_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.fcm_tokens_register.id
  http_method = aws_api_gateway_method.fcm_tokens_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "fcm_tokens_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.fcm_tokens_register.id
  http_method = aws_api_gateway_method.fcm_tokens_options.http_method
  status_code = aws_api_gateway_method_response.fcm_tokens_options.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

# Notifications Resource
resource "aws_api_gateway_resource" "notifications" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "notifications"
}

# Create Notification Method
resource "aws_api_gateway_method" "create_notification" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.notifications.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

# Create Notification Integration
resource "aws_api_gateway_integration" "create_notification" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.notifications.id
  http_method             = aws_api_gateway_method.create_notification.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.create_notification.invoke_arn
}

# Get Notifications Method
resource "aws_api_gateway_method" "get_notifications" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.notifications.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

# Get Notifications Integration
resource "aws_api_gateway_integration" "get_notifications" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.notifications.id
  http_method             = aws_api_gateway_method.get_notifications.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.get_notifications.invoke_arn
}

# CORS for Notifications
resource "aws_api_gateway_method" "notifications_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.notifications.id
  http_method = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "notifications_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.notifications.id
  http_method = aws_api_gateway_method.notifications_options.http_method
  status_code = "200"
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration" "notifications_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.notifications.id
  http_method = aws_api_gateway_method.notifications_options.http_method
  type        = "MOCK"
  
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_integration_response" "notifications_options" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.notifications.id
  http_method = aws_api_gateway_method.notifications_options.http_method
  status_code = aws_api_gateway_method_response.notifications_options.status_code
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

# API Gateway Deployment
resource "aws_api_gateway_deployment" "main" {
  depends_on = [
    aws_api_gateway_integration.get_user,
    aws_api_gateway_integration.update_user,
    aws_api_gateway_integration.users_options,
    aws_api_gateway_integration.create_event,
    aws_api_gateway_integration.get_events,
    aws_api_gateway_integration.get_event,
    aws_api_gateway_integration.update_event,
    aws_api_gateway_integration.delete_event,
    aws_api_gateway_integration.create_evaluation,
    aws_api_gateway_integration.get_evaluations_by_session,
    aws_api_gateway_integration.get_evaluations_by_user,
    aws_api_gateway_integration.get_evaluation_by_session_and_user,
    aws_api_gateway_integration.generate_codes,
    aws_api_gateway_integration.verify_code,
    aws_api_gateway_integration.claim_points,
    aws_api_gateway_integration.get_points_history,
    aws_api_gateway_integration.get_points_history_user,
    aws_api_gateway_integration.get_total_points,
    aws_api_gateway_integration.generate_code,
    aws_api_gateway_integration.register_fcm_token,
    aws_api_gateway_integration.fcm_tokens_options,
    aws_api_gateway_integration.create_notification,
    aws_api_gateway_integration.get_notifications
  ]

  rest_api_id = aws_api_gateway_rest_api.main.id
}

# Stage
resource "aws_api_gateway_stage" "main" {
  deployment_id = aws_api_gateway_deployment.main.id
  rest_api_id   = aws_api_gateway_rest_api.main.id
  stage_name    = var.environment

  tags = var.common_tags
}