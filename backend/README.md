# re:Event Backend APIs

## Authentication
Todas las APIs requieren autenticación con token JWT de Cognito en el header:
```
Authorization: Bearer {jwt_token}
```

## User APIs

### GET /users/{userId}
Obtiene información de un usuario específico.

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Response:**
```json
{
  "userId": "string",
  "email": "string",
  "name": "string",
  "company": "string",
  "phone": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

### PUT /users/{userId}
Actualiza información de un usuario.

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Body:**
```json
{
  "name": "string",
  "company": "string",
  "phone": "string"
}
```

**Response:**
```json
{
  "message": "User updated successfully",
  "user": {
    "userId": "string",
    "email": "string",
    "name": "string",
    "company": "string",
    "phone": "string",
    "updatedAt": "string"
  }
}
```

## Auth Flow (Cognito)

### 1. Get Authorization Code
Redirect user to Cognito Hosted UI:
```
https://reevent-auth-dev.auth.us-east-1.amazoncognito.com/login?client_id=4ukhdv7k81pvtgtoccss3nvjdt&response_type=code&scope=email+openid+profile&redirect_uri=http://localhost:4200/auth/callback
```

### 2. Exchange Code for Token
```bash
curl --location 'https://reevent-auth-dev.auth.us-east-1.amazoncognito.com/oauth2/token' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'grant_type=authorization_code' \
--data-urlencode 'client_id=4ukhdv7k81pvtgtoccss3nvjdt' \
--data-urlencode 'code=YOUR_AUTHORIZATION_CODE' \
--data-urlencode 'redirect_uri=http://localhost:4200/auth/callback'
```

### 3. Use JWT Token in API Calls
```bash
# GET User
curl --location 'https://xd8pegmhrk.execute-api.us-east-1.amazonaws.com/dev/users/Google_103603576539873905090' \
--header 'Authorization: Bearer YOUR_JWT_TOKEN'

# PUT User
curl --location --request PUT 'https://xd8pegmhrk.execute-api.us-east-1.amazonaws.com/dev/users/Google_103603576539873905090' \
--header 'Authorization: Bearer YOUR_JWT_TOKEN' \
--header 'Content-Type: application/json' \
--data '{
  "name": "Juan Jose Miranda",
  "company": "AWS Community",
  "phone": "+591 12345678"
}'
```
