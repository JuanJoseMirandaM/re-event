#!/bin/bash

# Deploy script for re:Event Terraform infrastructure

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="dev"
ACTION="plan"
AUTO_APPROVE=false

# Function to display usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo "Options:"
    echo "  -e, --environment    Environment (dev, staging, prod) [default: dev]"
    echo "  -a, --action         Action (plan, apply, destroy) [default: plan]"
    echo "  -y, --auto-approve   Auto approve (for apply/destroy)"
    echo "  -h, --help           Show this help message"
    exit 1
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -a|--action)
            ACTION="$2"
            shift 2
            ;;
        -y|--auto-approve)
            AUTO_APPROVE=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            echo "Unknown option $1"
            usage
            ;;
    esac
done

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    echo -e "${RED}Error: Environment must be dev, staging, or prod${NC}"
    exit 1
fi

# Validate action
if [[ ! "$ACTION" =~ ^(plan|apply|destroy)$ ]]; then
    echo -e "${RED}Error: Action must be plan, apply, or destroy${NC}"
    exit 1
fi

echo -e "${GREEN}🚀 Starting Terraform $ACTION for $ENVIRONMENT environment${NC}"

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    echo -e "${RED}Error: Terraform is not installed${NC}"
    exit 1
fi

# Check if AWS CLI is installed and configured
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed${NC}"
    exit 1
fi

# Verify AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}Error: AWS credentials not configured${NC}"
    exit 1
fi

# Initialize Terraform
echo -e "${YELLOW}📦 Initializing Terraform...${NC}"
terraform init

# Select or create workspace
echo -e "${YELLOW}🏗️  Setting up workspace: $ENVIRONMENT${NC}"
terraform workspace select $ENVIRONMENT 2>/dev/null || terraform workspace new $ENVIRONMENT

# Load environment-specific variables
VAR_FILE="environments/$ENVIRONMENT/terraform.tfvars"
if [[ ! -f "$VAR_FILE" ]]; then
    echo -e "${RED}Error: Variable file $VAR_FILE not found${NC}"
    exit 1
fi

# Execute Terraform command
case $ACTION in
    plan)
        echo -e "${YELLOW}📋 Running Terraform plan...${NC}"
        terraform plan -var-file="$VAR_FILE" -out="$ENVIRONMENT.tfplan"
        ;;
    apply)
        echo -e "${YELLOW}🚀 Running Terraform apply...${NC}"
        if [[ "$AUTO_APPROVE" == true ]]; then
            terraform apply -var-file="$VAR_FILE" -auto-approve
        else
            terraform apply -var-file="$VAR_FILE"
        fi
        
        # Display outputs
        echo -e "${GREEN}✅ Deployment completed! Here are the outputs:${NC}"
        terraform output
        ;;
    destroy)
        echo -e "${YELLOW}💥 Running Terraform destroy...${NC}"
        echo -e "${RED}⚠️  WARNING: This will destroy all resources in $ENVIRONMENT environment!${NC}"
        
        if [[ "$AUTO_APPROVE" == true ]]; then
            terraform destroy -var-file="$VAR_FILE" -auto-approve
        else
            read -p "Are you sure you want to destroy all resources? (yes/no): " confirm
            if [[ "$confirm" == "yes" ]]; then
                terraform destroy -var-file="$VAR_FILE"
            else
                echo "Destroy cancelled."
                exit 0
            fi
        fi
        ;;
esac

echo -e "${GREEN}✅ Terraform $ACTION completed successfully!${NC}"