data "aws_region" "current" {}

# ZIP file for auth post-confirmation lambda
data "archive_file" "create_user_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/lambdas/user"
  output_path = "${path.module}/../../../backend/lambdas/user/create-user.zip"
  excludes    = ["get-user.js", "update-user.js", "*.zip"]
}