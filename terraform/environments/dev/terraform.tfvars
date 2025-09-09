environment = "dev"
aws_region  = "us-east-1"

# Domain configuration (optional for dev)
domain_name     = ""
certificate_arn = ""

# Admin configuration
admin_email = "admin@awscommunity.com"

# OAuth configuration (optional)
# google_client_id     = "your-google-client-id"
# google_client_secret = "your-google-client-secret"
# linkedin_client_id     = "your-linkedin-client-id"
# linkedin_client_secret = "your-linkedin-client-secret"

# Firebase Configuration for FCM
# firebase_project_id   = "your-firebase-project-id"
# firebase_client_email = "your-firebase-client-email@your-project.iam.gserviceaccount.com"
# firebase_private_key  = "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# =============================================================================
# FACEFINDER CONFIGURATION - Integración del proyecto FaceFinder
# =============================================================================

# Event name for FaceFinder resources
event_name = "amazon-community-bolivia-2025"

# AWS profile for FaceFinder (should match your AWS CLI profile)
aws_profile = "terraform"