# Method Responses para API Gateway - Versión Simplificada
# Solo incluye los endpoints más críticos para empezar
# NOTA: No incluir endpoints que ya tienen method responses en api-gateway.tf

# =============================================================================
# USER ENDPOINTS
# =============================================================================

# GET /users/{userId}
resource "aws_api_gateway_method_response" "get_user_200" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.user_id.id
  http_method = aws_api_gateway_method.get_user.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
  }
}

resource "aws_api_gateway_method_response" "get_user_400" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.user_id.id
  http_method = aws_api_gateway_method.get_user.http_method
  status_code = "400"
}

resource "aws_api_gateway_method_response" "get_user_404" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.user_id.id
  http_method = aws_api_gateway_method.get_user.http_method
  status_code = "404"
}

# PUT /users/{userId}
resource "aws_api_gateway_method_response" "update_user_200" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.user_id.id
  http_method = aws_api_gateway_method.update_user.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
  }
}

resource "aws_api_gateway_method_response" "update_user_400" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.user_id.id
  http_method = aws_api_gateway_method.update_user.http_method
  status_code = "400"
}

# =============================================================================
# POINTS ENDPOINTS (Los más importantes)
# =============================================================================

# POST /points/claim
resource "aws_api_gateway_method_response" "claim_points_200" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.points_claim.id
  http_method = aws_api_gateway_method.claim_points.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
  }
}

resource "aws_api_gateway_method_response" "claim_points_400" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.points_claim.id
  http_method = aws_api_gateway_method.claim_points.http_method
  status_code = "400"
}

# GET /points/total
resource "aws_api_gateway_method_response" "get_total_points_200" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.points_total.id
  http_method = aws_api_gateway_method.get_total_points.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
  }
}

# GET /points/history
resource "aws_api_gateway_method_response" "get_points_history_200" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.points_history.id
  http_method = aws_api_gateway_method.get_points_history.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
  }
}

# =============================================================================
# FCM ENDPOINTS
# =============================================================================

# POST /fcm-tokens/register
resource "aws_api_gateway_method_response" "register_fcm_token_201" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.fcm_tokens_register.id
  http_method = aws_api_gateway_method.register_fcm_token.http_method
  status_code = "201"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
  }
}

# =============================================================================
# NOTIFICATIONS ENDPOINTS
# =============================================================================

# GET /notifications
resource "aws_api_gateway_method_response" "get_notifications_200" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.notifications.id
  http_method = aws_api_gateway_method.get_notifications.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
  }
}

# =============================================================================
# FACEFINDER ENDPOINTS - Method Responses
# =============================================================================

# POST /faces/generate-presigned-batch
resource "aws_api_gateway_method_response" "generate_presigned_batch_200" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.faces_generate_presigned_batch.id
  http_method = aws_api_gateway_method.generate_presigned_batch.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
  }
}

resource "aws_api_gateway_method_response" "generate_presigned_batch_400" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.faces_generate_presigned_batch.id
  http_method = aws_api_gateway_method.generate_presigned_batch.http_method
  status_code = "400"
}

# POST /faces/generate-presigned-search
resource "aws_api_gateway_method_response" "generate_presigned_search_200" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.faces_generate_presigned_search.id
  http_method = aws_api_gateway_method.generate_presigned_search.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
  }
}

resource "aws_api_gateway_method_response" "generate_presigned_search_400" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.faces_generate_presigned_search.id
  http_method = aws_api_gateway_method.generate_presigned_search.http_method
  status_code = "400"
}

# POST /faces/search-by-face
resource "aws_api_gateway_method_response" "search_by_face_200" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.faces_search_by_face.id
  http_method = aws_api_gateway_method.search_by_face.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
  }
}

resource "aws_api_gateway_method_response" "search_by_face_400" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.faces_search_by_face.id
  http_method = aws_api_gateway_method.search_by_face.http_method
  status_code = "400"
}

# GET /faces/get-faces/{page}/{size}
resource "aws_api_gateway_method_response" "get_faces_paginated_200" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.faces_get_faces_page_size.id
  http_method = aws_api_gateway_method.get_faces_paginated.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
  }
}
