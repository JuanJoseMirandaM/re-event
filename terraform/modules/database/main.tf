resource "aws_dynamodb_table" "re_event_table" {
  name           = "${var.project_name}-${var.environment}"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "PK"
  range_key      = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  attribute {
    name = "GSI1PK"
    type = "S"
  }

  attribute {
    name = "GSI1SK"
    type = "S"
  }

  attribute {
    name = "GSI2PK"
    type = "S"
  }

  attribute {
    name = "GSI2SK"
    type = "S"
  }

  global_secondary_index {
    name     = "GSI1"
    hash_key = "GSI1PK"
    range_key = "GSI1SK"
  }

  global_secondary_index {
    name     = "GSI2"
    hash_key = "GSI2PK"
    range_key = "GSI2SK"
  }

  point_in_time_recovery {
    enabled = var.environment == "prod" ? true : false
  }

  server_side_encryption {
    enabled = true
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-table-${var.environment}"
  })
}

# DynamoDB backup vault for production
resource "aws_backup_vault" "re_event_backup" {
  count       = var.environment == "prod" ? 1 : 0
  name        = "${var.project_name}-backup-${var.environment}"
  kms_key_arn = aws_kms_key.backup_key[0].arn
  tags        = var.tags
}

resource "aws_kms_key" "backup_key" {
  count       = var.environment == "prod" ? 1 : 0
  description = "KMS key for DynamoDB backup"
  tags        = var.tags
}

resource "aws_backup_plan" "re_event_backup_plan" {
  count = var.environment == "prod" ? 1 : 0
  name  = "${var.project_name}-backup-plan-${var.environment}"

  rule {
    rule_name         = "daily_backup"
    target_vault_name = aws_backup_vault.re_event_backup[0].name
    schedule          = "cron(0 5 ? * * *)"

    lifecycle {
      cold_storage_after = 30
      delete_after       = 120
    }
  }

  tags = var.tags
}