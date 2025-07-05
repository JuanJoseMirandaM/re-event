terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1"
    }
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "re-event"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# Data sources
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# Local values
locals {
  project_name = "re-event"
  common_tags = {
    Project     = local.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

# Database Module
module "database" {
  source = "./modules/database"
  
  project_name = local.project_name
  environment  = var.environment
  tags         = local.common_tags
}

# Auth Module
module "auth" {
  source = "./modules/auth"
  
  project_name = local.project_name
  environment  = var.environment
  domain_name  = var.domain_name
  tags         = local.common_tags
}

# API Module
module "api" {
  source = "./modules/api"
  
  project_name       = local.project_name
  environment        = var.environment
  dynamodb_table_arn = module.database.table_arn
  dynamodb_table_name = module.database.table_name
  user_pool_arn      = module.auth.user_pool_arn
  user_pool_id       = module.auth.user_pool_id
  tags               = local.common_tags
}

# Frontend Module
module "frontend" {
  source = "./modules/frontend"
  
  project_name        = local.project_name
  environment         = var.environment
  domain_name         = var.domain_name
  api_gateway_url     = module.api.api_gateway_url
  user_pool_id        = module.auth.user_pool_id
  user_pool_client_id = module.auth.user_pool_client_id
  tags                = local.common_tags
}