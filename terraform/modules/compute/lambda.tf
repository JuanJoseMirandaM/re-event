# =============================================================================
# COMPUTE MODULE - FaceFinder Integration
# Lambda functions para procesamiento de imágenes y reconocimiento facial
# =============================================================================

# Placeholder ZIP file para Lambda functions de FaceFinder (Python)
data "archive_file" "lambda_placeholder" {
  type        = "zip"
  output_path = "${path.module}/placeholder.zip"
  source {
    content  = "def lambda_handler(event, context): return {'statusCode': 200, 'body': 'Placeholder'}"
    filename = "index.py"
  }
}

# Lambda function para generar URLs pre-firmadas (batch)
resource "aws_lambda_function" "generate_presigned_batch" {
  filename         = data.archive_file.lambda_placeholder.output_path
  function_name    = "${var.project_name}-presigned-batch-${var.environment}"
  role            = var.lambda_execution_role_arn
  handler         = "index.lambda_handler"
  runtime         = "python3.11"
  timeout         = 30

  environment {
    variables = {
      BUCKET_NAME = var.s3_bucket_name
      EVENT_NAME  = var.event_name
      FLOW_TYPE   = "BATCH"
    }
  }

  tags = var.common_tags
}

# Lambda function para generar URLs pre-firmadas (search)
resource "aws_lambda_function" "generate_presigned_search" {
  filename         = data.archive_file.lambda_placeholder.output_path
  function_name    = "${var.project_name}-presigned-search-${var.environment}"
  role            = var.lambda_execution_role_arn
  handler         = "index.lambda_handler"
  runtime         = "python3.11"
  timeout         = 30

  environment {
    variables = {
      BUCKET_NAME = var.s3_bucket_name
      EVENT_NAME  = var.event_name
      FLOW_TYPE   = "SEARCH"
    }
  }

  tags = var.common_tags
}

# Lambda function para búsqueda por rostro
resource "aws_lambda_function" "search_by_face" {
  filename         = data.archive_file.lambda_placeholder.output_path
  function_name    = "${var.project_name}-search-by-face-${var.environment}"
  role            = var.lambda_execution_role_arn
  handler         = "index.lambda_handler"
  runtime         = "python3.11"
  timeout         = 30

  environment {
    variables = {
      DYNAMODB_TABLE = var.facefinder_table_name
      REKOGNITION_COLLECTION = var.rekognition_collection_id
      EVENT_NAME = var.event_name
    }
  }

  tags = var.common_tags
}

# Lambda function para obtener elementos paginados
resource "aws_lambda_function" "get_paginated_items" {
  filename         = data.archive_file.lambda_placeholder.output_path
  function_name    = "${var.project_name}-get-paginated-items-${var.environment}"
  role            = var.lambda_execution_role_arn
  handler         = "index.lambda_handler"
  runtime         = "python3.11"
  timeout         = 60

  environment {
    variables = {
      DYNAMODB_TABLE = var.facefinder_table_name
    }
  }

  tags = var.common_tags
}

# Lambda function para procesamiento batch (trigger SQS)
resource "aws_lambda_function" "save_analyze" {
  filename         = data.archive_file.lambda_placeholder.output_path
  function_name    = "${var.project_name}-save-analyze-${var.environment}"
  role            = var.lambda_execution_role_arn
  handler         = "index.lambda_handler"
  runtime         = "python3.11"
  timeout         = 900  # 15 minutos
  memory_size     = 512

  environment {
    variables = {
      DYNAMODB_TABLE = var.facefinder_table_name
      REKOGNITION_COLLECTION = var.rekognition_collection_id
      DESTINATION_LAMBDA = "${var.project_name}-brand-publish-${var.environment}"
      EVENT_NAME = var.event_name
      SQS_QUEUE_URL = var.sqs_queue_url
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

# Permisos para S3 invoke Lambda
resource "aws_lambda_permission" "allow_s3_invoke" {
  statement_id  = "AllowExecutionFromS3Bucket"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.save_analyze.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = var.s3_bucket_arn
}

# Permisos para SQS invoke Lambda
resource "aws_lambda_permission" "allow_sqs_invoke" {
  statement_id  = "AllowExecutionFromSQS"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.save_analyze.function_name
  principal     = "sqs.amazonaws.com"
  source_arn    = var.sqs_queue_arn
}

# Lambda function para aplicar watermarks y publicar
resource "aws_lambda_function" "brand_publish" {
  filename         = data.archive_file.lambda_placeholder.output_path
  function_name    = "${var.project_name}-brand-publish-${var.environment}"
  role            = var.lambda_execution_role_arn
  handler         = "index.lambda_handler"
  runtime         = "python3.11"
  timeout         = 300  # 5 minutos
  memory_size     = 1024

  environment {
    variables = {
      BUCKET_NAME = var.s3_bucket_name
      DYNAMODB_TABLE = var.facefinder_table_name
      EVENT_NAME = var.event_name
      BRAND_LOGO_KEY = "watermarks/brand.png"
      PARTNER_LOGO_KEY = "watermarks/partner.png"
    }
  }

  tags = var.common_tags
}