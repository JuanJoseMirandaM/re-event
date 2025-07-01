# API Documentation - re:Event

## 🔗 Base URL
```
Development: https://api-dev.reevent.awscommunity.com
Production: https://api.reevent.awscommunity.com
```

## 🔐 Autenticación

Todas las APIs (excepto registro y login) requieren JWT token en el header:
```
Authorization: Bearer <jwt_token>
```

## 📋 Endpoints

### 🔑 Authentication

#### POST /auth/register
Registra un nuevo usuario

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "Juan Pérez",
  "company": "Tech Corp",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "userId": "user-uuid",
    "email": "user@example.com",
    "verified": false
  }
}
```

#### POST /auth/login
Inicia sesión de usuario

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJSUzI1NiIs...",
    "expiresIn": 3600,
    "user": {
      "email": "user@example.com",
      "name": "Juan Pérez",
      "role": "ATTENDEE",
      "verified": true,
      "points": 150
    }
  }
}
```

#### POST /auth/verify-code
Verifica código de 6 caracteres

**Request Body:**
```json
{
  "code": "ABC123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Código verificado exitosamente",
  "data": {
    "role": "ATTENDEE",
    "verified": true,
    "pointsAwarded": 50
  }
}
```

### 👤 User Management

#### GET /users/profile
Obtiene perfil del usuario actual

**Response:**
```json
{
  "success": true,
  "data": {
    "email": "user@example.com",
    "name": "Juan Pérez",
    "company": "Tech Corp",
    "phone": "+1234567890",
    "role": "ATTENDEE",
    "verified": true,
    "points": 275,
    "createdAt": "2025-01-15T10:30:00Z",
    "deliveries": {
      "lunch": false,
      "snacks": true,
      "merch": false
    }
  }
}
```

#### PUT /users/profile
Actualiza perfil del usuario

**Request Body:**
```json
{
  "name": "Juan Carlos Pérez",
  "company": "New Tech Corp",
  "phone": "+1234567891"
}
```

#### GET /users/points
Obtiene balance de puntos actual

**Response:**
```json
{
  "success": true,
  "data": {
    "currentPoints": 275,
    "totalEarned": 350,
    "totalSpent": 75,
    "rank": 15,
    "totalUsers": 150
  }
}
```

#### GET /users/points/history
Obtiene historial de transacciones de puntos

**Query Parameters:**
- `limit` (optional): Número de registros (default: 20)
- `offset` (optional): Offset para paginación (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "txn-123",
        "amount": 15,
        "type": "EARNED",
        "description": "Evaluación de sesión completada",
        "sessionId": "session-456",
        "timestamp": "2025-01-15T14:30:00Z"
      },
      {
        "id": "txn-124",
        "amount": -50,
        "type": "SPENT",
        "description": "Canje por camiseta AWS",
        "prizeId": "prize-789",
        "timestamp": "2025-01-15T16:45:00Z"
      }
    ],
    "pagination": {
      "total": 25,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

#### GET /users/leaderboard
Obtiene top 10 de usuarios con más puntos

**Response:**
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "name": "María González",
        "company": "AWS",
        "points": 850,
        "isCurrentUser": false
      },
      {
        "rank": 2,
        "name": "Carlos Ruiz",
        "company": "Microsoft",
        "points": 720,
        "isCurrentUser": false
      }
    ],
    "currentUser": {
      "rank": 15,
      "points": 275
    }
  }
}
```

### 📅 Sessions

#### GET /sessions
Obtiene lista de sesiones del evento

**Query Parameters:**
- `date` (optional): Filtrar por fecha (YYYY-MM-DD)
- `speaker` (optional): Filtrar por speaker

**Response:**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "session-123",
        "title": "Introducción a Serverless",
        "description": "Conceptos básicos de arquitectura serverless",
        "speaker": {
          "name": "Ana Martínez",
          "company": "AWS",
          "bio": "Solutions Architect con 5 años de experiencia"
        },
        "startTime": "2025-03-15T09:00:00Z",
        "endTime": "2025-03-15T10:00:00Z",
        "location": "Auditorio Principal",
        "attendeeCount": 45,
        "maxCapacity": 100,
        "userAttended": false,
        "userEvaluated": false
      }
    ]
  }
}
```

#### GET /sessions/{sessionId}
Obtiene detalles de una sesión específica

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "session-123",
    "title": "Introducción a Serverless",
    "description": "Conceptos básicos de arquitectura serverless en AWS...",
    "speaker": {
      "name": "Ana Martínez",
      "company": "AWS",
      "bio": "Solutions Architect con 5 años de experiencia",
      "photo": "https://photos.reevent.com/speakers/ana-martinez.jpg"
    },
    "startTime": "2025-03-15T09:00:00Z",
    "endTime": "2025-03-15T10:00:00Z",
    "location": "Auditorio Principal",
    "attendeeCount": 45,
    "maxCapacity": 100,
    "userAttended": true,
    "userEvaluated": false,
    "qrCode": "https://api.reevent.com/sessions/session-123/qr",
    "evaluationStats": {
      "averageRating": 4.2,
      "totalEvaluations": 38,
      "npsScore": 8.5
    }
  }
}
```

#### POST /sessions/{sessionId}/attend
Registra asistencia a una sesión (vía QR)

**Response:**
```json
{
  "success": true,
  "message": "Asistencia registrada exitosamente",
  "data": {
    "pointsAwarded": 25,
    "attendanceTime": "2025-03-15T09:05:00Z"
  }
}
```

#### GET /sessions/{sessionId}/qr
Genera QR code para la sesión

**Response:**
```json
{
  "success": true,
  "data": {
    "qrCodeUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "expiresAt": "2025-03-15T10:00:00Z"
  }
}
```

### ⭐ Evaluations

#### POST /evaluations
Envía evaluación de una sesión

**Request Body:**
```json
{
  "sessionId": "session-123",
  "rating": 5,
  "npsScore": 9,
  "comments": "Excelente presentación, muy clara y práctica",
  "specificQuestions": {
    "contentQuality": 5,
    "speakerKnowledge": 5,
    "practicalValue": 4
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Evaluación enviada exitosamente",
  "data": {
    "evaluationId": "eval-456",
    "pointsAwarded": 15,
    "sentiment": "POSITIVE"
  }
}
```

#### GET /evaluations/session/{sessionId}
Obtiene evaluaciones de una sesión (solo speakers/organizadores)

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "session-123",
    "totalEvaluations": 42,
    "averageRating": 4.3,
    "npsScore": 8.2,
    "sentimentAnalysis": {
      "positive": 85,
      "neutral": 12,
      "negative": 3
    },
    "evaluations": [
      {
        "id": "eval-456",
        "rating": 5,
        "npsScore": 9,
        "comments": "Excelente presentación",
        "sentiment": "POSITIVE",
        "submittedAt": "2025-03-15T10:15:00Z",
        "anonymous": true
      }
    ]
  }
}
```

### 🎁 Points & Prizes

#### POST /points/grant
Otorga puntos a un usuario (solo sponsors/organizadores)

**Request Body:**
```json
{
  "userEmail": "user@example.com",
  "amount": 100,
  "description": "Visita al stand de AWS"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Puntos otorgados exitosamente",
  "data": {
    "transactionId": "txn-789",
    "userNewBalance": 375
  }
}
```

#### GET /prizes
Obtiene catálogo de premios disponibles

**Response:**
```json
{
  "success": true,
  "data": {
    "prizes": [
      {
        "id": "prize-123",
        "name": "Camiseta AWS",
        "description": "Camiseta oficial de AWS Community Day",
        "cost": 100,
        "stock": 25,
        "image": "https://photos.reevent.com/prizes/aws-tshirt.jpg",
        "category": "APPAREL"
      },
      {
        "id": "prize-456",
        "name": "Voucher Almuerzo",
        "description": "Voucher para almuerzo en restaurante local",
        "cost": 250,
        "stock": 10,
        "image": "https://photos.reevent.com/prizes/lunch-voucher.jpg",
        "category": "FOOD"
      }
    ]
  }
}
```

#### POST /prizes/{prizeId}/redeem
Canjea un premio por puntos

**Response:**
```json
{
  "success": true,
  "message": "Premio canjeado exitosamente",
  "data": {
    "redemptionId": "redeem-789",
    "prize": {
      "name": "Camiseta AWS",
      "cost": 100
    },
    "userNewBalance": 175,
    "pickupCode": "PICKUP-ABC123"
  }
}
```

### 📸 Photos

#### POST /photos/upload
Sube una foto del evento

**Request Body:** (multipart/form-data)
```
photo: [file]
caption: "Gran momento en la charla de Serverless"
tags: ["serverless", "aws", "community"]
```

**Response:**
```json
{
  "success": true,
  "message": "Foto subida exitosamente",
  "data": {
    "photoId": "photo-123",
    "url": "https://photos.reevent.com/processed/photo-123.jpg",
    "pointsAwarded": 10,
    "processingStatus": "PROCESSING"
  }
}
```

#### GET /photos
Obtiene galería de fotos del evento

**Query Parameters:**
- `limit` (optional): Número de fotos (default: 20)
- `offset` (optional): Offset para paginación
- `tags` (optional): Filtrar por tags

**Response:**
```json
{
  "success": true,
  "data": {
    "photos": [
      {
        "id": "photo-123",
        "url": "https://photos.reevent.com/processed/photo-123.jpg",
        "thumbnailUrl": "https://photos.reevent.com/thumbnails/photo-123.jpg",
        "caption": "Gran momento en la charla de Serverless",
        "tags": ["serverless", "aws", "community"],
        "uploadedBy": "Juan Pérez",
        "uploadedAt": "2025-03-15T14:30:00Z",
        "likes": 15
      }
    ],
    "pagination": {
      "total": 150,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

### 🔔 Notifications

#### POST /notifications/send
Envía notificación (solo organizadores)

**Request Body:**
```json
{
  "target": {
    "type": "ROLE",
    "value": "ATTENDEE"
  },
  "title": "¡Sesión por comenzar!",
  "body": "La charla de Serverless inicia en 5 minutos",
  "data": {
    "sessionId": "session-123",
    "action": "VIEW_SESSION"
  },
  "scheduled": false
}
```

#### GET /notifications/user
Obtiene notificaciones del usuario

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif-123",
        "title": "¡Sesión por comenzar!",
        "body": "La charla de Serverless inicia en 5 minutos",
        "read": false,
        "createdAt": "2025-03-15T08:55:00Z",
        "data": {
          "sessionId": "session-123",
          "action": "VIEW_SESSION"
        }
      }
    ],
    "unreadCount": 3
  }
}
```

### 🆘 Assistance

#### POST /assistance/request
Solicita asistencia (sponsors/speakers)

**Request Body:**
```json
{
  "type": "TECHNICAL",
  "description": "Problemas con el proyector en el stand",
  "location": "Stand AWS - Área A",
  "priority": "HIGH"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Solicitud de asistencia enviada",
  "data": {
    "requestId": "assist-123",
    "estimatedResponse": "5-10 minutos"
  }
}
```

#### GET /assistance/requests
Obtiene solicitudes de asistencia (voluntarios/organizadores)

**Response:**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": "assist-123",
        "type": "TECHNICAL",
        "description": "Problemas con el proyector en el stand",
        "location": "Stand AWS - Área A",
        "priority": "HIGH",
        "status": "PENDING",
        "requestedBy": "sponsor@aws.com",
        "createdAt": "2025-03-15T10:30:00Z"
      }
    ]
  }
}
```

### 🍽️ Deliveries

#### POST /deliveries/register
Registra entrega de lunch/merch/snacks (organizadores)

**Request Body:**
```json
{
  "userEmail": "user@example.com",
  "type": "LUNCH",
  "delivered": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Entrega registrada exitosamente",
  "data": {
    "deliveryId": "delivery-123",
    "timestamp": "2025-03-15T12:30:00Z"
  }
}
```

## 🚨 Error Responses

Todas las APIs devuelven errores en el siguiente formato:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": {
      "field": "email",
      "value": null
    }
  }
}
```

### Códigos de Error Comunes
- `VALIDATION_ERROR` (400): Datos de entrada inválidos
- `UNAUTHORIZED` (401): Token inválido o expirado
- `FORBIDDEN` (403): Sin permisos para la acción
- `NOT_FOUND` (404): Recurso no encontrado
- `CONFLICT` (409): Conflicto (ej: código ya usado)
- `RATE_LIMIT_EXCEEDED` (429): Demasiadas solicitudes
- `INTERNAL_ERROR` (500): Error interno del servidor