# =============================================================================
# STORAGE MODULE - FaceFinder Integration
# S3 Bucket para almacenamiento de imágenes y procesamiento facial
# =============================================================================

# S3 Bucket principal para FaceFinder
resource "aws_s3_bucket" "facefinder_bucket" {
  bucket = "${var.project_name}-${var.event_name}-${var.environment}"
  tags   = var.common_tags
}

# Configuración de versionado
resource "aws_s3_bucket_versioning" "facefinder_bucket_versioning" {
  bucket = aws_s3_bucket.facefinder_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Configuración de cifrado
resource "aws_s3_bucket_server_side_encryption_configuration" "facefinder_bucket_encryption" {
  bucket = aws_s3_bucket.facefinder_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Bloquear acceso público
resource "aws_s3_bucket_public_access_block" "facefinder_bucket_pab" {
  bucket = aws_s3_bucket.facefinder_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Configuración CORS para acceso web
resource "aws_s3_bucket_cors_configuration" "facefinder_bucket_cors" {
  bucket = aws_s3_bucket.facefinder_bucket.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# Lifecycle rule para eliminar face-scans temporales
resource "aws_s3_bucket_lifecycle_configuration" "facefinder_bucket_lifecycle" {
  bucket = aws_s3_bucket.facefinder_bucket.id

  rule {
    id     = "delete_face_scans"
    status = "Enabled"

    filter {
      prefix = "face-scans/"
    }

    expiration {
      days = 1
    }
  }
}

# Notificación S3 -> SQS para procesamiento batch
resource "aws_s3_bucket_notification" "facefinder_bucket_notification" {
  bucket = aws_s3_bucket.facefinder_bucket.id

  queue {
    queue_arn = var.sqs_queue_arn
    events    = ["s3:ObjectCreated:*"]
    filter_prefix = "private/"
  }

  depends_on = [var.sqs_queue_policy_dependency]
}

# =============================================================================
# S3 BUCKET PARA CÓDIGOS DE VERIFICACIÓN
# =============================================================================

# S3 Bucket para códigos de verificación PDF
resource "aws_s3_bucket" "verification_codes_bucket" {
  bucket = "${var.project_name}-verification-codes-${var.environment}"
  tags   = var.common_tags
}

# Configuración de versionado para códigos de verificación
resource "aws_s3_bucket_versioning" "verification_codes_bucket_versioning" {
  bucket = aws_s3_bucket.verification_codes_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Configuración de cifrado para códigos de verificación
resource "aws_s3_bucket_server_side_encryption_configuration" "verification_codes_bucket_encryption" {
  bucket = aws_s3_bucket.verification_codes_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Bloquear acceso público para códigos de verificación
resource "aws_s3_bucket_public_access_block" "verification_codes_bucket_pab" {
  bucket = aws_s3_bucket.verification_codes_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Lifecycle rule para eliminar PDFs antiguos de códigos de verificación
resource "aws_s3_bucket_lifecycle_configuration" "verification_codes_bucket_lifecycle" {
  bucket = aws_s3_bucket.verification_codes_bucket.id

  rule {
    id     = "delete_old_verification_pdfs"
    status = "Enabled"

    filter {
      prefix = "verification-codes/"
    }

    expiration {
      days = 30  # Eliminar PDFs después de 30 días
    }
  }
}