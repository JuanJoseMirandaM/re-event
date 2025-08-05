# Sistema de Verificación - API Documentation

## 🎯 Descripción

El sistema de verificación permite a los organizadores generar códigos únicos por rol y a los usuarios verificar su cuenta para cambiar de `GUEST` a roles específicos del evento.

## 🔐 Autenticación

Todas las APIs requieren autenticación con token JWT de Cognito en el header:
```
Authorization: Bearer {jwt_token}
```

## 📡 Endpoints

### 1. Generar Códigos de Verificación

**POST** `/users/generate-codes`

Genera códigos únicos de verificación para cada rol especificado y crea un documento HTML para imprimir.

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Body:**
```json
{
  "roleQuantities": {
    "ATTENDEE": 600,
    "VOLUNTEER": 100,
    "SPEAKER": 40,
    "SPONSOR": 30,
    "ORGANIZER": 20
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Generated 790 verification codes",
    "totalCodes": 790,
    "codesByRole": {
      "ATTENDEE": 600,
      "VOLUNTEER": 100,
      "SPEAKER": 40,
      "SPONSOR": 30,
      "ORGANIZER": 20
    },
    "pdfUrl": "https://reevent-verification-codes-dev.s3.amazonaws.com/verification-codes/verification-codes-1703123456789.html"
  }
}
```

**Response (400):**
```json
{
  "success": false,
  "error": "roleQuantities and eventId are required"
}
```

**Response (401):**
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

### 2. Verificar Código de Usuario

**POST** `/users/verify-code`

Verifica un usuario con un código de verificación y actualiza su rol, **suma** puntos iniciales a los existentes y registra la verificación.

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Body:**
```json
{
  "verificationCode": "ABC123",
  "userId": "usr-001"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "userId": "usr-001",
      "email": "juan.perez@example.com",
      "name": "Juan Pérez",
      "role": "ATTENDEE",
      "points": 50,
      "verified": true,
      "verificationCode": "ABC123",
      "verifiedAt": "2025-01-15T09:15:00Z",
      "verifiedBy": "ABC123",
      "updatedAt": "2025-01-15T09:15:00Z"
    },
    "message": "Successfully verified as ATTENDEE",
    "pointsAdded": 50,
    "totalPoints": 75,
    "verificationCode": "ABC123",
    "verifiedAt": "2025-01-15T09:15:00Z"
  }
}
```

**Response (400):**
```json
{
  "success": false,
  "error": "verificationCode and userId are required"
}
```

**Response (404):**
```json
{
  "success": false,
  "error": "Invalid verification code"
}
```

**Response (409):**
```json
{
  "success": false,
  "error": "Verification code already used"
}
```

**Response (410):**
```json
{
  "success": false,
  "error": "Verification code has expired"
}
```

## 🏷️ Roles y Puntos por Verificación

| Rol | Puntos Agregados | Descripción |
|-----|------------------|-------------|
| GUEST | 0 | Usuario registrado pero no verificado |
| ATTENDEE | +50 | Puntos adicionales al verificar como asistente |
| SPEAKER | +200 | Puntos adicionales al verificar como expositor |
| SPONSOR | +300 | Puntos adicionales al verificar como patrocinador |
| VOLUNTEER | +150 | Puntos adicionales al verificar como voluntario |
| ORGANIZER | +500 | Puntos adicionales al verificar como organizador |

## 🔄 Flujo Completo

### 1. Generación de Códigos (Organizador)
```bash
# Organizador genera códigos
curl -X POST https://api.example.com/users/generate-codes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roleQuantities": {
      "ATTENDEE": 600,
      "VOLUNTEER": 100,
      "SPEAKER": 40,
      "SPONSOR": 30,
      "ORGANIZER": 20
    }
  }'

# Respuesta incluye URL del documento HTML para imprimir
```

### 2. Verificación de Usuario
```bash
# Usuario verifica su código
curl -X POST https://api.example.com/users/verify-code \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "verificationCode": "ABC123",
    "userId": "usr-001"
  }'

# Usuario actualizado con nuevo rol y puntos sumados
```

## 📋 Validaciones

### Generación de Códigos
- Solo organizadores pueden generar códigos
- Cantidades deben ser números positivos
- Máximo 1000 códigos por evento
- Códigos únicos de 6 caracteres alfanuméricos

### Verificación de Códigos
- Código debe existir en la base de datos
- Código no debe haber sido usado
- Código no debe haber expirado (30 días)
- Usuario no debe estar ya verificado

## 💡 Ejemplo de Sistema de Puntos

### Escenario: Usuario GUEST que gana puntos antes de verificar

```json
// Usuario antes de verificar (GUEST)
{
  "userId": "usr-001",
  "email": "juan.perez@example.com",
  "name": "Juan Pérez",
  "role": "GUEST",
  "points": 25,  // Puntos ganados como GUEST
  "verified": false
}

// Después de verificar con código ATTENDEE
{
  "userId": "usr-001",
  "email": "juan.perez@example.com",
  "name": "Juan Pérez",
  "role": "ATTENDEE",
  "points": 75,  // 25 + 50 = 75 puntos totales
  "verified": true,
  "verificationCode": "ABC123",
  "verifiedAt": "2025-01-15T09:15:00Z"
}

// Respuesta de la API
{
  "success": true,
  "data": {
    "user": { ... },
    "message": "Successfully verified as ATTENDEE",
    "pointsAdded": 50,    // Puntos agregados por verificación
    "totalPoints": 75,    // Total después de la verificación
    "verificationCode": "ABC123",
    "verifiedAt": "2025-01-15T09:15:00Z"
  }
}
```

## 📊 Estructura de Datos

### Verification Codes Table
```json
{
  "verificationCode": "ABC123",
  "role": "ATTENDEE",
  "initialPoints": 50,
  "used": false,
  "usedBy": null,
  "usedAt": null,
  "createdAt": "2025-01-14T10:30:00Z",
  "generatedBy": "org-001",
  "expiresAt": "2025-02-14T10:30:00Z"
}
```

### Users Table (Campos Actualizados)
```json
{
  "userId": "usr-001",
  "email": "juan.perez@example.com",
  "name": "Juan Pérez",
  "role": "ATTENDEE",
  "points": 50,
  "verified": true,
  "verificationCode": "ABC123",
  "verifiedAt": "2025-01-15T09:15:00Z",
  "verifiedBy": "ABC123",
  "updatedAt": "2025-01-15T09:15:00Z"
}
```

## 🧪 Ejemplos de Testing

### Test de Generación
```bash
# Obtener token de organizador
TOKEN=$(aws cognito-idp admin-initiate-auth \
  --user-pool-id us-east-1_koSnqucA2 \
  --client-id 162d0f9irj230mhiuhhh2t3o8m \
  --auth-flow ADMIN_NO_SRP_AUTH \
  --auth-parameters USERNAME=organizer@example.com,PASSWORD=password123 \
  --query 'AuthenticationResult.IdToken' \
  --output text)

# Generar códigos
curl -X POST https://api.example.com/users/generate-codes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roleQuantities": {
      "ATTENDEE": 10,
      "SPEAKER": 2
    }
  }'
```

### Test de Verificación
```bash
# Obtener token de usuario
TOKEN=$(aws cognito-idp admin-initiate-auth \
  --user-pool-id us-east-1_koSnqucA2 \
  --client-id 162d0f9irj230mhiuhhh2t3o8m \
  --auth-flow ADMIN_NO_SRP_AUTH \
  --auth-parameters USERNAME=user@example.com,PASSWORD=password123 \
  --query 'AuthenticationResult.IdToken' \
  --output text)

# Verificar código
curl -X POST https://api.example.com/users/verify-code \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "verificationCode": "ABC123",
    "userId": "usr-001"
  }'
```

## 🔒 Seguridad

- Autenticación requerida para todas las operaciones
- Solo organizadores pueden generar códigos
- Códigos únicos y de un solo uso
- Expiración automática de códigos
- Auditoría completa de verificaciones

## 📈 Monitoreo

### CloudWatch Logs
- `/aws/lambda/reevent-generate-codes-dev`
- `/aws/lambda/reevent-verify-code-dev`

### Métricas Importantes
- Códigos generados por rol
- Códigos usados vs disponibles
- Tiempo de respuesta de verificación
- Errores de códigos inválidos

## 🚨 Códigos de Error

| Código | Descripción |
|--------|-------------|
| 400 | Datos de entrada inválidos |
| 401 | No autorizado |
| 404 | Código o usuario no encontrado |
| 409 | Código ya usado o usuario ya verificado |
| 410 | Código expirado |
| 500 | Error interno del servidor | 