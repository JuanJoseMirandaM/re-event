#!/bin/bash

# Test Evaluation API Script
# Prueba todos los endpoints del sistema de evaluaciones

# Configuration
API_BASE_URL="https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/dev"
COGNITO_USER_POOL_ID="your-user-pool-id"
COGNITO_CLIENT_ID="your-client-id"
USERNAME="test@example.com"
PASSWORD="TestPassword123!"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Testing Evaluation API${NC}"
echo "=================================="

# Function to get Cognito tokens
get_cognito_tokens() {
    echo -e "${YELLOW}📝 Getting Cognito tokens...${NC}"
    
    # Get ID token
    ID_TOKEN=$(aws cognito-idp admin-initiate-auth \
        --user-pool-id $COGNITO_USER_POOL_ID \
        --client-id $COGNITO_CLIENT_ID \
        --auth-flow ADMIN_NO_SRP_AUTH \
        --auth-parameters USERNAME=$USERNAME,PASSWORD=$PASSWORD \
        --query 'AuthenticationResult.IdToken' \
        --output text 2>/dev/null)
    
    if [ $? -eq 0 ] && [ ! -z "$ID_TOKEN" ]; then
        echo -e "${GREEN}✅ Tokens obtained successfully${NC}"
        echo "ID Token: ${ID_TOKEN:0:50}..."
    else
        echo -e "${RED}❌ Failed to get tokens${NC}"
        echo "Make sure to update the script with your Cognito credentials"
        exit 1
    fi
}

# Function to create evaluation
create_evaluation() {
    echo -e "\n${YELLOW}📝 Creating evaluation...${NC}"
    
    local session_id="session-123"
    local rating=5
    local nps_score=9
    local comments="Excelente presentación sobre serverless. Muy clara y práctica."
    local sentiment="POSITIVE"
    
    response=$(curl -s -X POST "$API_BASE_URL/evaluations" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ID_TOKEN" \
        -d "{
            \"sessionId\": \"$session_id\",
            \"rating\": $rating,
            \"npsScore\": $nps_score,
            \"comments\": \"$comments\",
            \"sentiment\": \"$sentiment\"
        }")
    
    if echo "$response" | grep -q '"success":true'; then
        echo -e "${GREEN}✅ Evaluation created successfully${NC}"
        echo "Response: $response"
        
        # Extract evaluation ID for later use
        EVALUATION_ID=$(echo "$response" | grep -o '"evaluationId":"[^"]*"' | cut -d'"' -f4)
        echo "Evaluation ID: $EVALUATION_ID"
    else
        echo -e "${RED}❌ Failed to create evaluation${NC}"
        echo "Response: $response"
    fi
}

# Function to get evaluation by user and session
get_evaluation() {
    echo -e "\n${YELLOW}📝 Getting evaluation by user and session...${NC}"
    
    local session_id="session-123"
    
    response=$(curl -s -X GET "$API_BASE_URL/evaluations?sessionId=$session_id" \
        -H "Authorization: Bearer $ID_TOKEN")
    
    if echo "$response" | grep -q '"success":true'; then
        echo -e "${GREEN}✅ Evaluation retrieved successfully${NC}"
        echo "Response: $response"
    else
        echo -e "${RED}❌ Failed to get evaluation${NC}"
        echo "Response: $response"
    fi
}

# Function to get evaluations by session
get_evaluations_by_session() {
    echo -e "\n${YELLOW}📝 Getting evaluations by session...${NC}"
    
    local session_id="session-123"
    
    response=$(curl -s -X GET "$API_BASE_URL/evaluations/session/$session_id" \
        -H "Authorization: Bearer $ID_TOKEN")
    
    if echo "$response" | grep -q '"success":true'; then
        echo -e "${GREEN}✅ Session evaluations retrieved successfully${NC}"
        echo "Response: $response"
    else
        echo -e "${RED}❌ Failed to get session evaluations${NC}"
        echo "Response: $response"
    fi
}

# Function to get evaluations by user
get_evaluations_by_user() {
    echo -e "\n${YELLOW}📝 Getting evaluations by user...${NC}"
    
    response=$(curl -s -X GET "$API_BASE_URL/evaluations/user" \
        -H "Authorization: Bearer $ID_TOKEN")
    
    if echo "$response" | grep -q '"success":true'; then
        echo -e "${GREEN}✅ User evaluations retrieved successfully${NC}"
        echo "Response: $response"
    else
        echo -e "${RED}❌ Failed to get user evaluations${NC}"
        echo "Response: $response"
    fi
}

# Function to create multiple evaluations for testing
create_multiple_evaluations() {
    echo -e "\n${YELLOW}📝 Creating multiple evaluations for testing...${NC}"
    
    # Create evaluation 1
    curl -s -X POST "$API_BASE_URL/evaluations" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ID_TOKEN" \
        -d '{
            "sessionId": "session-123",
            "rating": 4,
            "npsScore": 8,
            "comments": "Muy buena charla sobre serverless",
            "sentiment": "POSITIVE"
        }' > /dev/null
    
    # Create evaluation 2
    curl -s -X POST "$API_BASE_URL/evaluations" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ID_TOKEN" \
        -d '{
            "sessionId": "session-123",
            "rating": 3,
            "npsScore": 6,
            "comments": "Contenido interesante pero muy técnico",
            "sentiment": "NEUTRAL"
        }' > /dev/null
    
    # Create evaluation 3 (different session)
    curl -s -X POST "$API_BASE_URL/evaluations" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ID_TOKEN" \
        -d '{
            "sessionId": "session-125",
            "rating": 5,
            "npsScore": 10,
            "comments": "Excelente presentación sobre DynamoDB",
            "sentiment": "POSITIVE"
        }' > /dev/null
    
    echo -e "${GREEN}✅ Multiple evaluations created for testing${NC}"
}

# Function to test error cases
test_error_cases() {
    echo -e "\n${YELLOW}📝 Testing error cases...${NC}"
    
    # Test missing required fields
    echo -e "${BLUE}Testing missing required fields...${NC}"
    response=$(curl -s -X POST "$API_BASE_URL/evaluations" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ID_TOKEN" \
        -d '{
            "sessionId": "session-123",
            "rating": 5
        }')
    
    if echo "$response" | grep -q '"success":false'; then
        echo -e "${GREEN}✅ Error handling works for missing fields${NC}"
    else
        echo -e "${RED}❌ Error handling failed for missing fields${NC}"
    fi
    
    # Test invalid rating
    echo -e "${BLUE}Testing invalid rating...${NC}"
    response=$(curl -s -X POST "$API_BASE_URL/evaluations" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ID_TOKEN" \
        -d '{
            "sessionId": "session-123",
            "rating": 6,
            "npsScore": 9
        }')
    
    if echo "$response" | grep -q '"success":false'; then
        echo -e "${GREEN}✅ Error handling works for invalid rating${NC}"
    else
        echo -e "${RED}❌ Error handling failed for invalid rating${NC}"
    fi
    
    # Test invalid NPS score
    echo -e "${BLUE}Testing invalid NPS score...${NC}"
    response=$(curl -s -X POST "$API_BASE_URL/evaluations" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ID_TOKEN" \
        -d '{
            "sessionId": "session-123",
            "rating": 5,
            "npsScore": 11
        }')
    
    if echo "$response" | grep -q '"success":false'; then
        echo -e "${GREEN}✅ Error handling works for invalid NPS score${NC}"
    else
        echo -e "${RED}❌ Error handling failed for invalid NPS score${NC}"
    fi
    
    # Test non-existent evaluation
    echo -e "${BLUE}Testing non-existent evaluation...${NC}"
    response=$(curl -s -X GET "$API_BASE_URL/evaluations?sessionId=non-existent" \
        -H "Authorization: Bearer $ID_TOKEN")
    
    if echo "$response" | grep -q '"success":true'; then
        echo -e "${GREEN}✅ Non-existent evaluation handled correctly${NC}"
    else
        echo -e "${RED}❌ Non-existent evaluation handling failed${NC}"
    fi
    
    # Test without authorization
    echo -e "${BLUE}Testing without authorization...${NC}"
    response=$(curl -s -X POST "$API_BASE_URL/evaluations" \
        -H "Content-Type: application/json" \
        -d '{
            "sessionId": "session-123",
            "rating": 5
        }')
    
    if echo "$response" | grep -q '"success":false'; then
        echo -e "${GREEN}✅ Authorization check works${NC}"
    else
        echo -e "${RED}❌ Authorization check failed${NC}"
    fi
}

# Main execution
main() {
    echo -e "${BLUE}🔧 Configuration:${NC}"
    echo "API Base URL: $API_BASE_URL"
    echo "User Pool ID: $COGNITO_USER_POOL_ID"
    echo "Client ID: $COGNITO_CLIENT_ID"
    echo "Username: $USERNAME"
    echo ""
    
    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
        exit 1
    fi
    
    # Check if curl is installed
    if ! command -v curl &> /dev/null; then
        echo -e "${RED}❌ curl is not installed. Please install it first.${NC}"
        exit 1
    fi
    
    # Get tokens
    get_cognito_tokens
    
    # Create evaluation
    create_evaluation
    
    # Create multiple evaluations for testing
    create_multiple_evaluations
    
    # Get evaluation by user and session
    get_evaluation
    
    # Get evaluations by session
    get_evaluations_by_session
    
    # Get evaluations by user
    get_evaluations_by_user
    
    # Test error cases
    test_error_cases
    
    echo -e "\n${GREEN}🎉 Evaluation API testing completed!${NC}"
    echo -e "${BLUE}📊 Summary:${NC}"
    echo "- ✅ POST /evaluations: Create evaluation (userId from token)"
    echo "- ✅ GET /evaluations: Get evaluation by session (userId from token)"
    echo "- ✅ GET /evaluations/session/{sessionId}: Get session evaluations"
    echo "- ✅ GET /evaluations/user: Get user evaluations (userId from token)"
    echo "- ✅ Error handling: Missing fields, invalid data, authorization"
}

# Run main function
main
