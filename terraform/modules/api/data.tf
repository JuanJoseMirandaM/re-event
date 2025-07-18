data "aws_region" "current" {}

# User Lambda ZIPs
data "archive_file" "get_user_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/lambdas/user"
  output_path = "${path.module}/../../../backend/lambdas/user/get-user.zip"
  excludes    = ["update-user.js", "auth-post-confirmation.js", "*.zip"]
}

data "archive_file" "update_user_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/lambdas/user"
  output_path = "${path.module}/../../../backend/lambdas/user/update-user.zip"
  excludes    = ["get-user.js", "auth-post-confirmation.js", "*.zip"]
}

# Agenda Lambda ZIPs
data "archive_file" "create_event_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/lambdas/agenda"
  output_path = "${path.module}/../../../backend/lambdas/agenda/create-event.zip"
  excludes    = ["get-event.js", "update-event.js", "list-events.js", "delete-event.js", "*.zip"]
}

data "archive_file" "get_event_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/lambdas/agenda"
  output_path = "${path.module}/../../../backend/lambdas/agenda/get-event.zip"
  excludes    = ["create-event.js", "update-event.js", "list-events.js", "delete-event.js", "*.zip"]
}

data "archive_file" "update_event_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/lambdas/agenda"
  output_path = "${path.module}/../../../backend/lambdas/agenda/update-event.zip"
  excludes    = ["create-event.js", "get-event.js", "list-events.js", "delete-event.js", "*.zip"]
}

data "archive_file" "list_events_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/lambdas/agenda"
  output_path = "${path.module}/../../../backend/lambdas/agenda/list-events.zip"
  excludes    = ["create-event.js", "get-event.js", "update-event.js", "delete-event.js", "*.zip"]
}

data "archive_file" "delete_event_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/lambdas/agenda"
  output_path = "${path.module}/../../../backend/lambdas/agenda/delete-event.zip"
  excludes    = ["create-event.js", "get-event.js", "update-event.js", "list-events.js", "*.zip"]
}
