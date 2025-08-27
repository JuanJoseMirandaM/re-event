# DynamoDB Table for Users
resource "aws_dynamodb_table" "users" {
  name         = "${var.project_name}-users-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "email"
    type = "S"
  }

  global_secondary_index {
    name            = "EmailIndex"
    hash_key        = "email"
    projection_type = "ALL"
  }

  tags = var.common_tags
}

# DynamoDB Table for Events
resource "aws_dynamodb_table" "events" {
  name         = "${var.project_name}-events-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "eventId"

  attribute {
    name = "eventId"
    type = "S"
  }

  attribute {
    name = "startDate"
    type = "S"
  }

  # GSI para consultar eventos por fecha
  global_secondary_index {
    name            = "DateIndex"
    hash_key        = "startDate"
    projection_type = "ALL"
  }

  tags = var.common_tags
}

# DynamoDB Table for Evaluations
resource "aws_dynamodb_table" "evaluations" {
  name         = "${var.project_name}-evaluations-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "evaluationId"

  attribute {
    name = "evaluationId"
    type = "S"
  }

  attribute {
    name = "sessionId"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  # GSI para consultar evaluaciones por sessionId
  global_secondary_index {
    name            = "SessionIndex"
    hash_key        = "sessionId"
    projection_type = "ALL"
  }

  # GSI para consultar evaluaciones por userId
  global_secondary_index {
    name            = "UserIndex"
    hash_key        = "userId"
    projection_type = "ALL"
  }

  tags = var.common_tags
}

# DynamoDB Table for Verification Codes
resource "aws_dynamodb_table" "verification_codes" {
  name         = "${var.project_name}-verification-codes-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "verificationCode"

  attribute {
    name = "verificationCode"
    type = "S"
  }

  attribute {
    name = "role"
    type = "S"
  }

  attribute {
    name = "used"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "S"
  }

  # GSI para consultar códigos por rol
  global_secondary_index {
    name            = "RoleIndex"
    hash_key        = "role"
    projection_type = "ALL"
  }

  # GSI para consultar códigos por estado (usado/no usado)
  global_secondary_index {
    name            = "UsedIndex"
    hash_key        = "used"
    projection_type = "ALL"
  }

  # GSI para consultar códigos por fecha de creación
  global_secondary_index {
    name            = "CreatedIndex"
    hash_key        = "createdAt"
    projection_type = "ALL"
  }

  tags = var.common_tags
}

# DynamoDB Table for FCM Tokens
resource "aws_dynamodb_table" "fcm_tokens" {
  name         = "${var.project_name}-fcm-tokens-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"
  range_key    = "deviceId"

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "deviceId"
    type = "S"
  }

  attribute {
    name = "token"
    type = "S"
  }

  attribute {
    name = "platform"
    type = "S"
  }

  # GSI para consultar tokens por token (útil para búsquedas)
  global_secondary_index {
    name            = "TokenIndex"
    hash_key        = "token"
    projection_type = "ALL"
  }

  # GSI para consultar tokens por plataforma
  global_secondary_index {
    name            = "PlatformIndex"
    hash_key        = "platform"
    projection_type = "ALL"
  }

  tags = var.common_tags
}
