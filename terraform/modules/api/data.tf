data "aws_region" "current" {}

# User Lambda ZIPs
data "archive_file" "get_user_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/lambdas/user"
  output_path = "${path.module}/../../../backend/lambdas/user/get-user.zip"
  excludes    = ["update-user.js", "create-user.js", "verify-code.js", "*.zip"]
}

data "archive_file" "update_user_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/lambdas/user"
  output_path = "${path.module}/../../../backend/lambdas/user/update-user.zip"
  excludes    = ["get-user.js", "create-user.js", "verify-code.js", "*.zip"]
}

data "archive_file" "verify_code_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/lambdas/user"
  output_path = "${path.module}/../../../backend/lambdas/user/verify-code.zip"
  excludes    = ["get-user.js", "create-user.js", "generate-codes.js", "*.zip"]
}

data "archive_file" "generate_codes_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/lambdas/verification"
  output_path = "${path.module}/../../../backend/lambdas/verification/generate-codes.zip"
  excludes    = ["*.zip"]
}

# Event Lambda ZIPs
data "archive_file" "create_event_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/lambdas/event"
  output_path = "${path.module}/../../../backend/lambdas/event/create-event.zip"
  excludes    = ["get-event.js", "update-event.js", "get-events.js", "delete-event.js", "*.zip"]
}

data "archive_file" "get_event_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/lambdas/event"
  output_path = "${path.module}/../../../backend/lambdas/event/get-event.zip"
  excludes    = ["create-event.js", "update-event.js", "get-events.js", "delete-event.js", "*.zip"]
}

data "archive_file" "update_event_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/lambdas/event"
  output_path = "${path.module}/../../../backend/lambdas/event/update-event.zip"
  excludes    = ["create-event.js", "get-event.js", "get-events.js", "delete-event.js", "*.zip"]
}

data "archive_file" "get_events_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/lambdas/event"
  output_path = "${path.module}/../../../backend/lambdas/event/get-events.zip"
  excludes    = ["create-event.js", "get-event.js", "update-event.js", "delete-event.js", "*.zip"]
}

data "archive_file" "delete_event_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/lambdas/event"
  output_path = "${path.module}/../../../backend/lambdas/event/delete-event.zip"
  excludes    = ["create-event.js", "get-event.js", "update-event.js", "get-events.js", "*.zip"]
}

# Evaluation Lambda ZIPs
data "archive_file" "create_evaluation_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/lambdas/evaluation"
  output_path = "${path.module}/../../../backend/lambdas/evaluation/create-evaluation.zip"
  excludes    = ["get-evaluation.js", "get-evaluations-by-session.js", "get-evaluations-by-user.js", "*.zip"]
}

data "archive_file" "get_evaluation_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/lambdas/evaluation"
  output_path = "${path.module}/../../../backend/lambdas/evaluation/get-evaluation.zip"
  excludes    = ["create-evaluation.js", "get-evaluations-by-session.js", "get-evaluations-by-user.js", "*.zip"]
}

data "archive_file" "get_evaluations_by_session_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/lambdas/evaluation"
  output_path = "${path.module}/../../../backend/lambdas/evaluation/get-evaluations-by-session.zip"
  excludes    = ["get-evaluation.js", "create-evaluation.js", "get-evaluations-by-user.js", "*.zip"]
}

data "archive_file" "get_evaluations_by_user_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/lambdas/evaluation"
  output_path = "${path.module}/../../../backend/lambdas/evaluation/get-evaluations-by-user.zip"
  excludes    = ["get-evaluation.js", "create-evaluation.js", "get-evaluations-by-session.js", "*.zip"]
}

# Points Lambda ZIPs
data "archive_file" "claim_points_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/lambdas/points"
  output_path = "${path.module}/../../../backend/lambdas/points/claim-points.zip"
  excludes    = ["deduct-points.js", "get-points-history.js", "get-total-points.js", "generate-code.js", "*.zip"]
}

data "archive_file" "deduct_points_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/lambdas/points"
  output_path = "${path.module}/../../../backend/lambdas/points/deduct-points.zip"
  excludes    = ["claim-points.js", "get-points-history.js", "get-total-points.js", "generate-code.js", "*.zip"]
}

data "archive_file" "generate_code_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/lambdas/points"
  output_path = "${path.module}/../../../backend/lambdas/points/generate-code.zip"
  excludes    = ["claim-points.js", "deduct-points.js", "get-points-history.js", "get-total-points.js", "*.zip"]
}

data "archive_file" "get_points_history_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/lambdas/points"
  output_path = "${path.module}/../../../backend/lambdas/points/get-points-history.zip"
  excludes    = ["claim-points.js", "deduct-points.js", "generate-code.js", "get-total-points.js", "*.zip"]
}

data "archive_file" "get_total_points_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/lambdas/points"
  output_path = "${path.module}/../../../backend/lambdas/points/get-total-points.zip"
  excludes    = ["claim-points.js", "deduct-points.js", "generate-code.js", "get-points-history.js", "*.zip"]
}

# Favorites Lambda ZIPs
data "archive_file" "add_favorite_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/lambdas/favorites"
  output_path = "${path.module}/../../../backend/lambdas/favorites/add-favorite.zip"
  excludes    = ["remove-favorite.js", "get-favorites.js", "*.zip"]
}

data "archive_file" "remove_favorite_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/lambdas/favorites"
  output_path = "${path.module}/../../../backend/lambdas/favorites/remove-favorite.zip"
  excludes    = ["add-favorite.js", "get-favorites.js", "*.zip"]
}

data "archive_file" "get_favorites_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../backend/lambdas/favorites"
  output_path = "${path.module}/../../../backend/lambdas/favorites/get-favorites.zip"
  excludes    = ["add-favorite.js", "remove-favorite.js", "*.zip"]
}
