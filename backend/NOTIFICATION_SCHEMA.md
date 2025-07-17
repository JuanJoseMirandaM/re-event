# Notifications Table Schema

## Table: `reevent-notifications-dev`

### Primary Key
- **notificationId** (String) - UUID único de la notificación
- **createdAt** (String) - Timestamp ISO-8601 de creación (Sort Key)

### Attributes
```json
{
  "notificationId": "uuid-string",
  "title": "string",
  "description": "string" | null,
  "createdAt": "ISO-8601-timestamp",
  "author": "string",
  "link": "url" | null,
  "targetRole": "ALL" | "asistente" | "speaker" | "patrocinador" | "voluntario" | "organizador",
  "userId": "uuid-string" | null,
  "read": false
}
```

### Global Secondary Indexes

#### RoleIndex
- **Hash Key**: targetRole
- **Range Key**: createdAt
- **Purpose**: Consultar notificaciones por rol específico

#### UserIndex
- **Hash Key**: userId
- **Range Key**: createdAt
- **Purpose**: Consultar notificaciones específicas para un usuario

### Notas
- Cuando `targetRole` es "ALL", la notificación es para todos los usuarios
- Cuando `userId` tiene un valor, la notificación es específica para ese usuario
- El campo `read` indica si el usuario ha leído la notificación

### Example Records

#### Notificación para todos los usuarios
```json
{
  "notificationId": "notif-001",
  "title": "¡Bienvenidos al AWS Community Day 2025!",
  "description": "Estamos emocionados de darles la bienvenida al evento más importante de AWS en Bolivia.",
  "createdAt": "2025-03-01T08:00:00Z",
  "author": "Equipo Organizador",
  "link": "/agenda",
  "targetRole": "ALL",
  "userId": null,
  "read": false
}
```

#### Notificación para speakers
```json
{
  "notificationId": "notif-002",
  "title": "Recordatorio: Prueba de equipos",
  "description": "Recordamos a todos los speakers que la prueba de equipos será hoy a las 15:00.",
  "createdAt": "2025-03-01T10:30:00Z",
  "author": "Equipo Técnico",
  "link": null,
  "targetRole": "speaker",
  "userId": null,
  "read": false
}
```

#### Notificación personal para un usuario
```json
{
  "notificationId": "notif-003",
  "title": "¡Felicidades! Has ganado 100 puntos",
  "description": "Gracias por completar la evaluación de la sesión.",
  "createdAt": "2025-03-01T14:45:00Z",
  "author": "Sistema de Puntos",
  "link": "/perfil/puntos",
  "targetRole": "asistente",
  "userId": "usr-001",
  "read": false
}
```