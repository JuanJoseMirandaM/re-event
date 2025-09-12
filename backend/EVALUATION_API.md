# Evaluation API Documentation

## 📋 Overview

El sistema de evaluaciones permite a los usuarios calificar sesiones, speakers y eventos. Cada evaluación incluye una calificación numérica, score NPS, comentarios opcionales y análisis de sentimiento.

## 🗄️ Database Schema

### Table: `reevent-evaluations-dev`

#### Primary Key
- **evaluationId** (String) - UUID único de la evaluación

#### Attributes
```json
{
  "evaluationId": "uuid-string",
  "sessionId": "string",
  "userId": "string", 
  "rating": "number (1-5)",
  "npsScore": "number (0-10)" | null,
  "comments": "string" | null,
  "sentiment": "POSITIVE|NEUTRAL|NEGATIVE" | null,
  "createdAt": "ISO-8601-timestamp"
}
```

#### Global Secondary Indexes

##### SessionIndex
- **Hash Key**: sessionId
- **Purpose**: Consultar todas las evaluaciones de una sesión específica

##### UserIndex  
- **Hash Key**: userId
- **Purpose**: Consultar todas las evaluaciones de un usuario específico

### Example Records

#### Evaluación Positiva
```json
{
  "evaluationId": "eval-001",
  "sessionId": "session-123",
  "userId": "usr-001",
  "rating": 5,
  "npsScore": 9,
  "comments": "Excelente presentación sobre serverless. Muy clara y práctica.",
  "sentiment": "POSITIVE",
  "createdAt": "2025-03-15T10:30:00Z"
}
```

#### Evaluación Neutral
```json
{
  "evaluationId": "eval-002", 
  "sessionId": "session-124",
  "userId": "usr-002",
  "rating": 3,
  "npsScore": 6,
  "comments": "Contenido interesante pero muy técnico para principiantes",
  "sentiment": "NEUTRAL",
  "createdAt": "2025-03-15T14:15:00Z"
}
```

## 🚀 API Endpoints

### POST /evaluations
Crea una nueva evaluación para una sesión

**Authorization**: Requiere autenticación (cualquier usuario)

**Request Body:**
```json
{
  "sessionId": "session-123",
  "rating": 5,
  "npsScore": 9,
  "comments": "Excelente presentación sobre serverless",
  "sentiment": "POSITIVE"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "event": {
    "evaluationId": "eval-001",
    "sessionId": "session-123",
    "userId": "usr-001",
    "rating": 5,
    "npsScore": 9,
    "comments": "Excelente presentación sobre serverless",
    "sentiment": "POSITIVE",
    "createdAt": "2025-03-15T10:30:00Z"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Missing required fields: sessionId, userId, rating"
}
```

### GET /evaluations
Obtiene una evaluación específica por usuario y sesión

**Authorization**: Requiere autenticación (cualquier usuario)

**Query Parameters:**
- `sessionId` (required): ID de la sesión

**Example Request:**
```
GET /evaluations?sessionId=session-123
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "evaluationId": "eval-001",
    "sessionId": "session-123", 
    "userId": "usr-001",
    "rating": 5,
    "npsScore": 9,
    "comments": "Excelente presentación sobre serverless",
    "sentiment": "POSITIVE",
    "createdAt": "2025-03-15T10:30:00Z"
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": true,
  "data": {}
}
```

### GET /evaluations/session/{sessionId}
Obtiene todas las evaluaciones de una sesión específica

**Authorization**: Requiere autenticación (cualquier usuario)

**Path Parameters:**
- `sessionId` (required): ID de la sesión

**Example Request:**
```
GET /evaluations/session/session-123
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "evaluationId": "eval-001",
        "sessionId": "session-123",
        "userId": "usr-001", 
        "rating": 5,
        "npsScore": 9,
        "comments": "Excelente presentación",
        "sentiment": "POSITIVE",
        "createdAt": "2025-03-15T10:30:00Z"
      },
      {
        "evaluationId": "eval-002",
        "sessionId": "session-123",
        "userId": "usr-002",
        "rating": 4,
        "npsScore": 8,
        "comments": "Muy buena charla",
        "sentiment": "POSITIVE", 
        "createdAt": "2025-03-15T10:35:00Z"
      }
    ],
    "lastKey": null,
    "count": 2
  }
}
```

### GET /evaluations/user
Obtiene todas las evaluaciones del usuario autenticado

**Authorization**: Requiere autenticación (cualquier usuario)

**Example Request:**
```
GET /evaluations/user
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "evaluationId": "eval-001",
        "sessionId": "session-123",
        "userId": "usr-001",
        "rating": 5,
        "npsScore": 9,
        "comments": "Excelente presentación sobre serverless",
        "sentiment": "POSITIVE",
        "createdAt": "2025-03-15T10:30:00Z"
      },
      {
        "evaluationId": "eval-003", 
        "sessionId": "session-125",
        "userId": "usr-001",
        "rating": 4,
        "npsScore": 7,
        "comments": "Buen contenido sobre DynamoDB",
        "sentiment": "POSITIVE",
        "createdAt": "2025-03-15T16:20:00Z"
      }
    ],
    "lastKey": null,
    "count": 2
  }
}
```

## 📊 Rating System

### Rating Scale
- **1**: Muy malo
- **2**: Malo  
- **3**: Regular
- **4**: Bueno
- **5**: Excelente

### NPS Score
- **0-6**: Detractores
- **7-8**: Pasivos  
- **9-10**: Promotores

### Sentiment Analysis
- **POSITIVE**: Comentarios positivos
- **NEUTRAL**: Comentarios neutrales
- **NEGATIVE**: Comentarios negativos

## 🔐 Authorization Rules

### Endpoint Permissions
- **POST /evaluations**: Cualquier usuario autenticado
- **GET /evaluations**: Cualquier usuario autenticado (obtiene su propia evaluación)
- **GET /evaluations/session/{sessionId}**: Cualquier usuario autenticado
- **GET /evaluations/user**: Cualquier usuario autenticado (obtiene sus propias evaluaciones)

### Business Rules
- Un usuario solo puede evaluar una sesión una vez
- Las evaluaciones no se pueden modificar una vez creadas
- Los comentarios son opcionales pero recomendados
- El análisis de sentimiento se puede hacer automáticamente o manualmente

## 📈 Analytics & Insights

### Métricas por Sesión
- Promedio de rating
- Distribución de ratings (1-5)
- Score NPS promedio
- Total de evaluaciones
- Análisis de sentimiento (% positivo, neutral, negativo)

### Métricas por Usuario
- Total de evaluaciones realizadas
- Promedio de ratings otorgados
- Tendencia de participación

## 🚨 Error Handling

### Common Error Codes
- **400**: Datos faltantes o inválidos
- **401**: No autenticado
- **403**: No autorizado
- **404**: Recurso no encontrado
- **500**: Error interno del servidor

### Error Response Format
```json
{
  "success": false,
  "error": "Error description"
}
```

## 🔄 Integration Points

### Points System
- Las evaluaciones otorgan puntos automáticamente
- Puntos por completar evaluación: 10 puntos
- Los puntos se otorgan inmediatamente al crear la evaluación
- Se registra en el historial de puntos del usuario con sourceType: 'evaluation'

### Notifications
- Notificación al speaker cuando recibe nueva evaluación
- Notificación al organizador sobre evaluaciones con rating bajo
- Resumen diario de métricas de evaluación

### Analytics
- Dashboard para speakers con métricas de sus sesiones
- Reportes para organizadores sobre satisfacción general
- Insights para mejorar futuros eventos
