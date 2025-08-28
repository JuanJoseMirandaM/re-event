# Notifications API

## Overview
API para gestionar notificaciones del sistema. Permite crear y listar notificaciones con diferentes tipos de audiencia y acciones.

## Base URL
```
https://{api-id}.execute-api.{region}.amazonaws.com/{stage}
```

## Authentication
Todas las endpoints requieren autenticación mediante Cognito User Pools. Incluir el token JWT en el header:
```
Authorization: Bearer {jwt-token}
```

## Endpoints

### 1. Create Notification
**POST** `/notifications`

Crea una nueva notificación en el sistema.

#### Request Headers
```
Content-Type: application/json
Authorization: Bearer {jwt-token}
```

#### Request Body
```json
{
  "title": "🚀 Inscripciones abiertas",
  "body": "Regístrate ahora para el AWS Community Day Bolivia.",
  "image": "https://cdn.communityday.com.bo/hero.png",
  "actionType": "link",
  "actionValue": "https://day.awscommunityday.com.bo/register",
  "type": "anuncio",
  "audience": "all",
  "userId": "u-123",
  "segmentId": "segment_abc"
}
```

#### Campos del Request
- **title** (string, requerido): Título de la notificación
- **body** (string, requerido): Contenido del mensaje
- **image** (string, opcional): URL de la imagen
- **actionType** (string, opcional): Tipo de acción - "link" o "screen"
- **actionValue** (string, opcional): Valor de la acción (URL o ruta)
- **type** (string, requerido): Tipo de notificación - "evento", "anuncio", "recompensa"
- **audience** (string, requerido): Audiencia objetivo - "all", "segment", "user"
- **userId** (string, opcional): ID del usuario objetivo (si audience = "user")
- **segmentId** (string, opcional): ID del segmento (si audience = "segment")

#### Response (201 Created)
```json
{
  "success": true,
  "message": "Notification created successfully",
  "data": {
    "notificationId": "n-abc123",
    "title": "🚀 Inscripciones abiertas",
    "body": "Regístrate ahora para el AWS Community Day Bolivia.",
    "image": "https://cdn.communityday.com.bo/hero.png",
    "actionType": "link",
    "actionValue": "https://day.awscommunityday.com.bo/register",
    "type": "anuncio",
    "audience": "all",
    "targetUserId": null,
    "segmentId": null,
    "authorId": "u-456",
    "createdAt": "2025-01-27T12:00:00Z",
    "updatedAt": "2025-01-27T12:00:00Z",
    "status": "active"
  }
}
```

#### Response (400 Bad Request)
```json
{
  "success": false,
  "error": "Missing required fields: title, body, type, and audience are required"
}
```

#### Response (401 Unauthorized)
```json
{
  "success": false,
  "error": "Failed to extract user ID from token: No valid authorization header"
}
```

### 2. Get Notifications
**GET** `/notifications`

Lista las notificaciones según los filtros aplicados.

#### Request Headers
```
Authorization: Bearer {jwt-token}
```

#### Query Parameters
- **limit** (number, opcional): Número máximo de resultados (default: 20)
- **lastKey** (string, opcional): Token de paginación
- **type** (string, opcional): Filtrar por tipo - "evento", "anuncio", "recompensa"
- **audience** (string, opcional): Filtrar por audiencia - "all", "segment", "user"
- **userId** (string, opcional): Filtrar por usuario objetivo (si audience = "user")
- **segmentId** (string, opcional): Filtrar por segmento (si audience = "segment")
- **status** (string, opcional): Filtrar por estado - "active", "inactive", "scheduled" (default: "active")

#### Ejemplos de URLs
```
GET /notifications?type=anuncio&limit=10
GET /notifications?audience=user&userId=u-123
GET /notifications?audience=segment&segmentId=segment_abc
GET /notifications?status=active&type=evento
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "notificationId": "n-abc123",
        "title": "🚀 Inscripciones abiertas",
        "body": "Regístrate ahora para el AWS Community Day Bolivia.",
        "image": "https://cdn.communityday.com.bo/hero.png",
        "actionType": "link",
        "actionValue": "https://day.awscommunityday.com.bo/register",
        "type": "anuncio",
        "audience": "all",
        "targetUserId": null,
        "segmentId": null,
        "authorId": "u-456",
        "createdAt": "2025-01-27T12:00:00Z",
        "updatedAt": "2025-01-27T12:00:00Z",
        "status": "active"
      }
    ],
    "lastKey": null,
    "count": 1,
    "totalCount": 1
  }
}
```

## Estructura de la Base de Datos

### Tabla: notifications
- **Hash Key**: notificationId (String)
- **GSI**: TypeIndex (type + createdAt)
- **GSI**: AudienceIndex (audience + createdAt)
- **GSI**: StatusIndex (status + createdAt)
- **GSI**: AuthorIndex (authorId + createdAt)
- **GSI**: UserTargetIndex (targetUserId + createdAt)
- **GSI**: SegmentIndex (segmentId + createdAt)

### Campos
- **notificationId**: Identificador único de la notificación
- **title**: Título de la notificación
- **body**: Contenido del mensaje
- **image**: URL de la imagen (opcional)
- **actionType**: Tipo de acción - "link" o "screen" (opcional)
- **actionValue**: Valor de la acción (opcional)
- **type**: Tipo de notificación - "evento", "anuncio", "recompensa"
- **audience**: Audiencia objetivo - "all", "segment", "user"
- **targetUserId**: ID del usuario objetivo (si audience = "user")
- **segmentId**: ID del segmento (si audience = "segment")
- **authorId**: ID del usuario que creó la notificación
- **createdAt**: Timestamp de creación
- **updatedAt**: Timestamp de última actualización
- **status**: Estado de la notificación - "active", "inactive", "scheduled"

## Comportamiento

### Validaciones
1. **Campos requeridos**: title, body, type, audience
2. **Validación de actionType**: Si se proporciona actionValue, actionType es requerido
3. **Validación de audience**: 
   - Si audience = "user", userId es requerido
   - Si audience = "segment", segmentId es requerido
4. **Valores permitidos**:
   - actionType: "link", "screen"
   - type: "evento", "anuncio", "recompensa"
   - audience: "all", "segment", "user"
   - status: "active", "inactive", "scheduled"

### Seguridad
- El userId del autor se extrae automáticamente del token JWT
- Todas las operaciones requieren autenticación
- Las notificaciones se crean con estado "active" por defecto

### Filtros y Búsquedas
- **Paginación**: Soporte para limit y lastKey
- **Ordenamiento**: Las notificaciones se ordenan por fecha de creación (más recientes primero)
- **Filtros múltiples**: Se pueden combinar varios filtros
- **GSIs optimizados**: Consultas eficientes por tipo, audiencia, estado, etc.

## Casos de Uso

### 1. Notificación Global
```json
{
  "title": "🚀 Inscripciones abiertas",
  "body": "Regístrate ahora para el AWS Community Day Bolivia.",
  "type": "anuncio",
  "audience": "all"
}
```

### 2. Notificación para Usuario Específico
```json
{
  "title": "🎉 ¡Felicidades!",
  "body": "Has ganado 100 puntos por completar tu perfil.",
  "type": "recompensa",
  "audience": "user",
  "userId": "u-123"
}
```

### 3. Notificación para Segmento
```json
{
  "title": "📅 Próximo Evento",
  "body": "No te pierdas nuestro próximo meetup de AWS.",
  "type": "evento",
  "audience": "segment",
  "segmentId": "segment_aws_enthusiasts"
}
```

### 4. Notificación con Acción
```json
{
  "title": "🔗 Nuevo Recurso",
  "body": "Consulta nuestra nueva documentación de API.",
  "actionType": "link",
  "actionValue": "https://docs.example.com/api",
  "type": "anuncio",
  "audience": "all"
}
```

## Implementación

### Tecnologías
- **Backend**: AWS Lambda (Node.js 18.x)
- **Base de Datos**: Amazon DynamoDB
- **API Gateway**: AWS API Gateway con autorización Cognito
- **Autenticación**: Amazon Cognito User Pools

### Archivos
- `create-notification.js`: Lambda para crear notificaciones
- `get-notifications.js`: Lambda para listar notificaciones
- `package.json`: Dependencias del proyecto
- `build.sh`: Script de construcción

### Despliegue
Los lambdas se despliegan automáticamente mediante Terraform junto con:
- Tabla DynamoDB de notificaciones
- Endpoints del API Gateway
- Permisos IAM necesarios
- Configuración de CORS
