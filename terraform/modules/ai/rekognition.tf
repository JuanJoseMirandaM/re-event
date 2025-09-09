# =============================================================================
# AI MODULE - FaceFinder Integration
# AWS Rekognition para reconocimiento facial
# =============================================================================

# Rekognition Collection para almacenar características faciales
resource "aws_rekognition_collection" "faces_collection" {
  collection_id = "${var.project_name}-faces-${var.environment}"
  tags         = var.common_tags
}