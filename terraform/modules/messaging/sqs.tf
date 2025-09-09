# =============================================================================
# MESSAGING MODULE - FaceFinder Integration
# SQS para procesamiento batch de imágenes
# =============================================================================

# Dead Letter Queue
resource "aws_sqs_queue" "batch_dlq" {
  name = "${var.project_name}-batch-dlq-${var.environment}"
  tags = var.common_tags
}

# Cola principal para procesamiento batch
resource "aws_sqs_queue" "batch_queue" {
  name                      = "${var.project_name}-batch-queue-${var.environment}"
  visibility_timeout_seconds = 960  # 16 minutos
  message_retention_seconds = 1209600  # 14 días

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.batch_dlq.arn
    maxReceiveCount     = 3
  })

  tags = var.common_tags
}

# Política para permitir que S3 envíe mensajes a SQS
resource "aws_sqs_queue_policy" "batch_queue_policy" {
  queue_url = aws_sqs_queue.batch_queue.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "s3.amazonaws.com"
        }
        Action   = "sqs:SendMessage"
        Resource = aws_sqs_queue.batch_queue.arn
        Condition = {
          ArnEquals = {
            "aws:SourceArn" = var.s3_bucket_arn
          }
        }
      }
    ]
  })
}