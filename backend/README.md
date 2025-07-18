# re:Event Backend APIs

## Authentication
Todas las APIs requieren autenticación con token JWT de Cognito en el header:
```
Authorization: Bearer {jwt_token}
```

> **NOTA IMPORTANTE**: El sistema de notificaciones ahora se implementa exclusivamente a través de AppSync GraphQL API. Ver la sección "Notification GraphQL API" al final de este documento.

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

## Events APIs

### POST /events
Crea un nuevo evento.

**Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Body:**
```json
{
  "titulo": "string",
  "descripcion": "string",
  "fecha": "YYYY-MM-DD",
  "hora": "HH:MM" | null,
  "lugar": "string",
  "link_lugar": "url" | null,
  "expositores": [
    {
      "nombre": "string",
      "avatar": "url" | null
    }
  ]
}
```

### GET /events
Lista eventos con paginación y filtros.

**Query Parameters:**
- `limit`: Número de eventos (default: 20)
- `lastKey`: Clave para paginación
- `fecha`: Filtrar por fecha específica (YYYY-MM-DD)
- `upcoming`: Solo eventos futuros (true/false)
- `past`: Solo eventos pasados (true/false)

**Examples:**
```bash
# Todos los eventos
GET /events

# Eventos futuros
GET /events?upcoming=true

# Eventos pasados
GET /events?past=true

# Eventos de una fecha específica
GET /events?fecha=2025-03-15

# Paginación
GET /events?limit=10&lastKey=eyJldmVudElkIjoiZXZ0LTAwMSJ9
```

### GET /events/{eventId}
Obtiene un evento específico.

### PUT /events/{eventId}
Actualiza un evento existente.

**Body:** Mismo formato que POST /events

### DELETE /events/{eventId}
Elimina un evento.

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

# Create Event
curl --location --request POST 'https://xd8pegmhrk.execute-api.us-east-1.amazonaws.com/dev/events' \
--header 'Authorization: Bearer YOUR_JWT_TOKEN' \
--header 'Content-Type: application/json' \
--data '{
  "titulo": "Serverless en AWS",
  "descripcion": "Aprende a construir aplicaciones serverless",
  "fecha": "2025-03-15",
  "hora": "10:00",
  "lugar": "Auditorio Principal",
  "expositores": [
    {
      "nombre": "Juan Pérez",
      "avatar": "https://example.com/avatar.jpg"
    }
  ]
}'

# List Events
curl --location 'https://xd8pegmhrk.execute-api.us-east-1.amazonaws.com/dev/events?upcoming=true&limit=10' \
--header 'Authorization: Bearer YOUR_JWT_TOKEN'
```

## Notification GraphQL API

El sistema de notificaciones se implementa exclusivamente a través de AppSync GraphQL API.

### Endpoint
```
https://[appsync-id].appsync-api.us-east-1.amazonaws.com/graphql
```

### Autenticación
Utiliza el mismo token JWT de Cognito:
```
Authorization: Bearer {jwt_token}
```

### Operaciones Disponibles

#### Queries
```graphql
# Obtener notificaciones por rol
query GetNotifications {
  getNotifications(role: "asistente", limit: 10) {
    notificationId
    title
    description
    createdAt
    author
    link
    read
  }
}

# Obtener notificaciones de un usuario específico
query GetUserNotifications {
  getUserNotifications(userId: "usr-001", limit: 10) {
    notificationId
    title
    description
    createdAt
    author
    link
    read
  }
}
```

#### Mutations
```graphql
# Crear una notificación
mutation CreateNotification {
  createNotification(input: {
    title: "Nuevo anuncio",
    description: "Detalles del anuncio",
    author: "Organizador",
    link: "/anuncios/123",
    targetRole: "ALL"
  }) {
    notificationId
    createdAt
  }
}

# Marcar notificación como leída
mutation MarkAsRead {
  markNotificationAsRead(
    notificationId: "notif-001",
    createdAt: "2025-03-01T08:00:00Z"
  ) {
    notificationId
    read
  }
}
```

#### Subscriptions
```graphql
# Suscribirse a notificaciones por rol
subscription OnCreateNotification {
  onCreateNotification(targetRole: "asistente") {
    notificationId
    title
    description
    createdAt
    author
    link
  }
}

# Suscribirse a notificaciones personales
subscription OnCreateUserNotification {
  onCreateUserNotification(userId: "usr-001") {
    notificationId
    title
    description
    createdAt
    author
    link
  }
}
```
