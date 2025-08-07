# DynamoDB Table for Points Codes
resource "aws_dynamodb_table" "points_codes" {
  name         = "${var.project_name}-points-codes-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "code"

  attribute {
    name = "code"
    type = "S"
  }

  attribute {
    name = "type"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "S"
  }

  attribute {
    name = "expiresAt"
    type = "S"
  }

  # GSI para consultar códigos por tipo
  global_secondary_index {
    name            = "TypeIndex"
    hash_key        = "type"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  # GSI para consultar códigos por fecha de expiración
  global_secondary_index {
    name            = "ExpiresIndex"
    hash_key        = "expiresAt"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  tags = var.common_tags
}

# DynamoDB Table for Points Claims
resource "aws_dynamodb_table" "points_claims" {
  name         = "${var.project_name}-points-claims-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"
  range_key    = "timestamp"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "S"
  }

  attribute {
    name = "code"
    type = "S"
  }

  attribute {
    name = "sourceType"
    type = "S"
  }

  # GSI para consultar claims por código
  global_secondary_index {
    name            = "CodeIndex"
    hash_key        = "code"
    range_key       = "timestamp"
    projection_type = "ALL"
  }

  # GSI para consultar claims por tipo de fuente
  global_secondary_index {
    name            = "SourceTypeIndex"
    hash_key        = "sourceType"
    range_key       = "timestamp"
    projection_type = "ALL"
  }

  tags = var.common_tags
} 