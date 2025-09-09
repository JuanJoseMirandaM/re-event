# =============================================================================
# AI MODULE OUTPUTS - FaceFinder Integration
# =============================================================================

output "collection_id" {
  description = "Rekognition Collection ID"
  value       = aws_rekognition_collection.faces_collection.collection_id
}

output "collection_arn" {
  description = "Rekognition Collection ARN"
  value       = aws_rekognition_collection.faces_collection.arn
}