data "aws_region" "current" {}

# ZIP file for auth post-confirmation lambda
data "archive_file" "auth_post_confirmation_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/lambdas/user"
  output_path = "${path.module}/../../../backend/lambdas/user/auth-post-confirmation.zip"
  excludes    = ["get-user.js", "update-user.js", "*.zip"]
}