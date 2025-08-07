# 🎯 Sistema de Puntos - API Documentation

## 📋 **Resumen del Sistema**

El sistema de puntos permite a los usuarios ganar puntos mediante códigos únicos que pueden ser escaneados o ingresados manualmente. Los códigos pueden ser de diferentes tipos y tienen diferentes valores de puntos.

### **Tipos de Cards Soportados**
- **`common`**: Cards comunes (5 puntos) - Llama Backendera
- **`rare`**: Cards raras (10 puntos) - Cloud Walker  
- **`epic`**: Cards épicas (20 puntos) - Token Dorado
- **`dinamic`**: Cards dinámicas (personalizable) - Código Dinámico

### **Características de las Cards**
- **Códigos**: 6 caracteres alfanuméricos sin prefijos
- **QR Codes**: Contienen solo el código (no JSON)
- **Uso**: Una vez por usuario por código (configurable para dinamic)
- **Expiración**: 31/12/2025 para cards predefinidas (configurable para dinamic)
- **Diseño**: Cards visuales con colores y estilos únicos

## 🔗 **Endpoints**

### **POST /points/claim**
Reclama puntos usando un código.

**Request:**
```json
{
  "userId": "abc123",
  "code": "A1B2C3"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "abc123",
    "code": "A1B2C3",
    "points": 10,
    "cardType": "rare",
    "description": "Reclamá tus puntos en la nube",
    "claimedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### **GET /points/history/{userId}**
Obtiene el historial de puntos de un usuario específico.

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "abc123",
    "history": [
      {
        "timestamp": "2024-01-15T10:30:00.000Z",
        "code": "A1B2C3",
        "points": 10,
        "sourceType": "card",
        "description": "Reclamá tus puntos en la nube"
      }
    ],
    "totalClaims": 1
  }
}
```

### **GET /points/history**
Obtiene el historial de puntos del usuario autenticado.

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "abc123",
    "history": [
      {
        "timestamp": "2024-01-15T10:30:00.000Z",
        "code": "A1B2C3",
        "points": 10,
        "sourceType": "card",
        "description": "Reclamá tus puntos en la nube"
      }
    ],
    "totalClaims": 1
  }
}
```

### **GET /points/total**
Obtiene el total de puntos del usuario autenticado.

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "abc123",
    "totalPoints": 10
  }
}
```

### **POST /points/generate-code**
Genera cards de puntos (solo organizadores).

**Request para cards predefinidas:**
```json
{
  "cardType": "rare",
  "quantity": 10,
  "customName": "Mi Card Personalizada",
  "customDescription": "Descripción personalizada"
}
```

**Request para card dinámica:**
```json
{
  "cardType": "dinamic",
  "quantity": 1,
  "points": 50,
  "maxUses": 100,
  "expiresAt": "2024-12-31T23:59:59.000Z",
  "customName": "Charla Especial",
  "customDescription": "Puntos por asistir a la charla"
}
```

**Tipos de card válidos:**
- `common` (5 puntos, expira 31/12/2025)
- `rare` (10 puntos, expira 31/12/2025) 
- `epic` (20 puntos, expira 31/12/2025)
- `dinamic` (personalizable, solo 1 código)

**Response:**
```json
{
  "success": true,
  "data": {
    "cards": [
      {
        "code": "A1B2C3",
        "type": "card",
        "points": 10,
        "cardType": "rare",
        "description": "Reclamá tus puntos en la nube",
        "maxUses": 1,
        "expiresAt": "2025-12-31T23:59:59.000Z"
      }
    ],
    "totalCards": 10,
    "cardType": "rare",
    "points": 10,
    "htmlUrl": "https://bucket.s3.amazonaws.com/points-codes/cards-rare-1234567890.html",
    "generatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

## 🎨 **Diseño de Cards**

### **Common Card (Llama Backendera)**
- **Color**: Azul (#4A90E2)
- **Puntos**: 5
- **Expiración**: 31/12/2025
- **Descripción**: "Escaneá para acumular rewrites y puntos"

### **Rare Card (Cloud Walker)**
- **Color**: Naranja (#F39C12)
- **Puntos**: 10
- **Expiración**: 31/12/2025
- **Descripción**: "Reclamá tus puntos en la nube"

### **Epic Card (Token Dorado)**
- **Color**: Púrpura (#9B59B6)
- **Puntos**: 20
- **Expiración**: 31/12/2025
- **Descripción**: "¡Escaneá este tesoro dorado!"

### **Dinamic Card (Código Dinámico)**
- **Color**: Rojo (#E74C3C)
- **Puntos**: Personalizable
- **Expiración**: Personalizable
- **Máximo usos**: Personalizable
- **Descripción**: Personalizable
- **Cantidad**: Solo 1 código por request

## 🔐 **Seguridad**

- **Autenticación**: JWT tokens requeridos para todos los endpoints
- **Autorización**: Solo organizadores pueden generar códigos
- **Validación**: Códigos únicos, una vez por usuario (configurable para dinamic)
- **Rate Limiting**: Implementado en API Gateway

## 📊 **Monitoreo**

- **Logs**: CloudWatch Logs para todas las operaciones
- **Métricas**: DynamoDB CloudWatch metrics
- **Alertas**: Configuradas para errores y latencia alta

## 🚀 **Variables de Despliegue**

```bash
# DynamoDB Tables
POINTS_CODES_TABLE=reevent-points-codes-dev
POINTS_CLAIMS_TABLE=reevent-points-claims-dev
USERS_TABLE=reevent-users-dev

# S3 Bucket
S3_BUCKET=reevent-storage-dev

# API Gateway
API_URL=https://api.reevent.com/dev
```

## 🔧 **Permisos IAM**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query",
        "dynamodb:BatchWriteItem",
        "dynamodb:BatchGetItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/reevent-points-codes-*",
        "arn:aws:dynamodb:*:*:table/reevent-points-claims-*",
        "arn:aws:dynamodb:*:*:table/reevent-users-*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::reevent-storage-*/*"
    }
  ]
}
```

## 🐛 **Troubleshooting**

### **Error: Código ya usado**
```json
{
  "success": false,
  "error": "El código ya ha sido usado por este usuario"
}
```

### **Error: Código no encontrado**
```json
{
  "success": false,
  "error": "Código no válido o expirado"
}
```

### **Error: No autorizado**
```json
{
  "success": false,
  "error": "No autorizado para generar códigos"
}
```

### **Error: Card dinámica inválida**
```json
{
  "success": false,
  "error": "Para cards dinámicas, los puntos deben ser mayores a 0"
}
```

## 📝 **Ejemplos de Uso**

### **Generar 5 cards épicas**
```bash
curl -X POST https://api.reevent.com/dev/points/generate-code \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cardType": "epic",
    "quantity": 5
  }'
```

### **Generar card dinámica**
```bash
curl -X POST https://api.reevent.com/dev/points/generate-code \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cardType": "dinamic",
    "quantity": 1,
    "points": 100,
    "maxUses": 50,
    "expiresAt": "2024-12-31T23:59:59.000Z",
    "customName": "Charla AWS Lambda",
    "customDescription": "Puntos por asistir a la charla sobre AWS Lambda"
  }'
```

### **Reclamar puntos**
```bash
curl -X POST https://api.reevent.com/dev/points/claim \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "code": "A1B2C3"
  }'
```

### **Ver historial**
```bash
curl -X GET https://api.reevent.com/dev/points/history/user123 \
  -H "Authorization: Bearer $JWT_TOKEN"
``` 