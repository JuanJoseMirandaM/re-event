# =============================================================================
# COMPUTE MODULE OUTPUTS - FaceFinder Integration
# =============================================================================

output "lambda_functions" {
  description = "Map of Lambda function details"
  value = {
    generate_presigned_batch = {
      name       = aws_lambda_function.generate_presigned_batch.function_name
      arn        = aws_lambda_function.generate_presigned_batch.arn
      invoke_arn = aws_lambda_function.generate_presigned_batch.invoke_arn
    }
    generate_presigned_search = {
      name       = aws_lambda_function.generate_presigned_search.function_name
      arn        = aws_lambda_function.generate_presigned_search.arn
      invoke_arn = aws_lambda_function.generate_presigned_search.invoke_arn
    }
    search_by_face = {
      name       = aws_lambda_function.search_by_face.function_name
      arn        = aws_lambda_function.search_by_face.arn
      invoke_arn = aws_lambda_function.search_by_face.invoke_arn
    }
    get_paginated_items = {
      name       = aws_lambda_function.get_paginated_items.function_name
      arn        = aws_lambda_function.get_paginated_items.arn
      invoke_arn = aws_lambda_function.get_paginated_items.invoke_arn
    }
    save_analyze = {
      name       = aws_lambda_function.save_analyze.function_name
      arn        = aws_lambda_function.save_analyze.arn
      invoke_arn = aws_lambda_function.save_analyze.invoke_arn
    }
    brand_publish = {
      name       = aws_lambda_function.brand_publish.function_name
      arn        = aws_lambda_function.brand_publish.arn
      invoke_arn = aws_lambda_function.brand_publish.invoke_arn
    }
  }
}