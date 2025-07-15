# Users Table Schema

## Table: `reevent-users-dev`

### Primary Key
- **userId** (String) - UUID único del usuario

### Attributes
```json
{
  "userId": "uuid-string",
  "email": "string",
  "name": "string",
  "company": "string" | null,
  "phone": "string" | null,
  "avatar": "url" | null,
  "role": "asistente" | "speaker" | "patrocinador" | "voluntario" | "organizador",
  "points": 0,
  "verified": true | false,
  "createdAt": "ISO-8601-timestamp",
  "updatedAt": "ISO-8601-timestamp"
}
```

### Global Secondary Indexes

#### EmailIndex
- **Hash Key**: email
- **Purpose**: Consultar usuario por email específico

### User Roles
- **asistente**: Funcionalidades básicas
- **speaker**: Gestión de sesiones y feedback
- **patrocinador**: Otorgamiento de puntos y asistencia
- **voluntario**: Sistema de asistencia y notificaciones
- **organizador**: Control total y notificaciones

### Example Records

#### Asistente Regular
```json
{
  "userId": "usr-001",
  "email": "juan.perez@example.com",
  "name": "Juan Pérez",
  "company": "Tech Solutions",
  "phone": "+591 12345678",
  "avatar": "https://s3.amazonaws.com/avatars/juan-perez.jpg",
  "role": "asistente",
  "points": 150,
  "verified": true,
  "createdAt": "2025-01-14T10:30:00Z",
  "updatedAt": "2025-01-14T15:45:00Z"
}
```

#### Speaker
```json
{
  "userId": "usr-002",
  "email": "maria.gonzalez@aws.com",
  "name": "María González",
  "company": "Amazon Web Services",
  "phone": null,
  "avatar": "https://s3.amazonaws.com/avatars/maria-gonzalez.jpg",
  "role": "speaker",
  "points": 500,
  "verified": true,
  "createdAt": "2025-01-10T08:00:00Z",
  "updatedAt": "2025-01-14T12:30:00Z"
}
```

#### Organizador
```json
{
  "userId": "usr-003",
  "email": "admin@awscommunity.org.bo",
  "name": "Carlos Admin",
  "company": "AWS Community Bolivia",
  "phone": "+591 87654321",
  "avatar": null,
  "role": "organizador",
  "points": 1000,
  "verified": true,
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-14T16:00:00Z"
}
```