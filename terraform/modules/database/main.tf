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