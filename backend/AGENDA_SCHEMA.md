# Agenda/Events Table Schema

## Table: `reevent-events-dev`

### Primary Key
- **eventId** (String) - UUID único del evento

### Attributes
```json
{
  "eventId": "uuid-string",
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
  ],
  "createdAt": "ISO-8601-timestamp",
  "updatedAt": "ISO-8601-timestamp"
}
```

### Global Secondary Indexes

#### FechaIndex
- **Hash Key**: fecha
- **Purpose**: Consultar eventos por fecha específica

### Example Records

#### Charla Principal
```json
{
  "eventId": "evt-001",
  "titulo": "Serverless en AWS: Del Código a la Nube",
  "descripcion": "Aprende a construir aplicaciones serverless escalables usando AWS Lambda, API Gateway y DynamoDB",
  "fecha": "2025-03-15",
  "hora": "10:00",
  "lugar": "Auditorio Principal - Hotel Presidente",
  "link_lugar": "https://maps.google.com/hotel-presidente",
  "expositores": [
    {
      "nombre": "Juan Pérez",
      "avatar": "https://s3.amazonaws.com/avatars/juan-perez.jpg"
    },
    {
      "nombre": "María González", 
      "avatar": null
    }
  ],
  "createdAt": "2025-01-14T10:30:00Z",
  "updatedAt": "2025-01-14T10:30:00Z"
}
```

#### Networking Event
```json
{
  "eventId": "evt-002", 
  "titulo": "Networking AWS Community",
  "descripcion": "Conoce a otros desarrolladores y profesionales de AWS",
  "fecha": "2025-03-14",
  "hora": null,
  "lugar": "Café Central",
  "link_lugar": "https://maps.google.com/cafe-central",
  "expositores": [],
  "createdAt": "2025-01-14T10:30:00Z",
  "updatedAt": "2025-01-14T10:30:00Z"
}
```