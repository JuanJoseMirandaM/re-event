# =============================================================================
# COMPUTE MODULE - FaceFinder Integration
# Lambda functions para procesamiento de imágenes y reconocimiento facial
# =============================================================================

# Placeholder ZIP file para Lambda functions
data "archive_file" "lambda_placeholder" {
  type        = "zip"
  output_path = "${path.module}/placeholder.zip"
  source {
    content  = "exports.handler = async (event) => { return { statusCode: 200, body: 'Placeholder' }; };"
    filename = "index.js"
  }
}

# Lambda function para generar URLs pre-firmadas (batch)
resource "aws_lambda_function" "generate_presigned_batch" {
  filename         = data.archive_file.lambda_placeholder.output_path
  function_name    = "${var.project_name}-presigned-batch-${var.environment}"
  role            = var.lambda_execution_role_arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 30

  environment {
    variables = {
      S3_BUCKET_NAME = var.s3_bucket_name
      ENVIRONMENT    = var.environment
    }
  }

  tags = var.common_tags
}

# Lambda function para generar URLs pre-firmadas (search)
resource "aws_lambda_function" "generate_presigned_search" {
  filename         = data.archive_file.lambda_placeholder.output_path
  function_name    = "${var.project_name}-presigned-search-${var.environment}"
  role            = var.lambda_execution_role_arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 30

  environment {
    variables = {
      S3_BUCKET_NAME = var.s3_bucket_name
      ENVIRONMENT    = var.environment
    }
  }

  tags = var.common_tags
}

# Lambda function para búsqueda por rostro
resource "aws_lambda_function" "search_by_face" {
  filename         = data.archive_file.lambda_placeholder.output_path
  function_name    = "${var.project_name}-search-by-face-${var.environment}"
  role            = var.lambda_execution_role_arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 30

  environment {
    variables = {
      S3_BUCKET_NAME            = var.s3_bucket_name
      DYNAMODB_TABLE_NAME       = var.dynamodb_table_name
      REKOGNITION_COLLECTION_ID = var.rekognition_collection_id
      ENVIRONMENT              = var.environment
    }
  }

  tags = var.common_tags
}

# Lambda function para obtener elementos paginados
resource "aws_lambda_function" "get_paginated_items" {
  filename         = data.archive_file.lambda_placeholder.output_path
  function_name    = "${var.project_name}-get-paginated-items-${var.environment}"
  role            = var.lambda_execution_role_arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 60

  environment {
    variables = {
      DYNAMODB_TABLE_NAME = var.dynamodb_table_name
      ENVIRONMENT        = var.environment
    }
  }

  tags = var.common_tags
}

# Lambda function para procesamiento batch (trigger SQS)
resource "aws_lambda_function" "save_analyze" {
  filename         = data.archive_file.lambda_placeholder.output_path
  function_name    = "${var.project_name}-save-analyze-${var.environment}"
  role            = var.lambda_execution_role_arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 900  # 15 minutos
  memory_size     = 512

  environment {
    variables = {
      S3_BUCKET_NAME            = var.s3_bucket_name
      DYNAMODB_TABLE_NAME       = var.dynamodb_table_name
      REKOGNITION_COLLECTION_ID = var.rekognition_collection_id
      ENVIRONMENT              = var.environment
    }
  }

  tags = var.common_tags
}

# Event source mapping para SQS
resource "aws_lambda_event_source_mapping" "sqs_trigger" {
  event_source_arn = var.sqs_queue_arn
  function_name    = aws_lambda_function.save_analyze.arn
  batch_size       = 10

  depends_on = [var.lambda_sqs_policy_attachment]
}

# Lambda function para aplicar watermarks y publicar
resource "aws_lambda_function" "brand_publish" {
  filename         = data.archive_file.lambda_placeholder.output_path
  function_name    = "${var.project_name}-brand-publish-${var.environment}"
  role            = var.lambda_execution_role_arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  timeout         = 300  # 5 minutos
  memory_size     = 1024

  environment {
    variables = {
      S3_BUCKET_NAME = var.s3_bucket_name
      ENVIRONMENT   = var.environment
    }
  }

  tags = var.common_tags
}