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
    name = "fecha"
    type = "S"
  }

  # GSI para consultar eventos por fecha
  global_secondary_index {
    name            = "FechaIndex"
    hash_key        = "fecha"
    projection_type = "ALL"
  }

  tags = var.common_tags
}

# DynamoDB Table for Notifications
resource "aws_dynamodb_table" "notifications" {
  name         = "${var.project_name}-notifications-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "notificationId"
  range_key    = "createdAt"

  attribute {
    name = "notificationId"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "S"
  }

  attribute {
    name = "targetRole"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  # GSI para consultar notificaciones por rol
  global_secondary_index {
    name            = "RoleIndex"
    hash_key        = "targetRole"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  # GSI para consultar notificaciones por usuario
  global_secondary_index {
    name            = "UserIndex"
    hash_key        = "userId"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  tags = var.common_tags
}