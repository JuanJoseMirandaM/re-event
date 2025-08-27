# FCM Tokens API

Este documento describe la API para gestionar los tokens de Firebase Cloud Messaging (FCM) para notificaciones push.

## Endpoints

### POST /fcm-tokens/register

Registra o actualiza un token FCM para un usuario y dispositivo específico.

#### Headers
- `Content-Type: application/json`
- `Authorization: Bearer {cognito-jwt-token}`

#### Request Body
```json
{
  "deviceId": "string (required)", 
  "token": "string (required)",
  "platform": "string (optional, default: 'web')",
  "topics": ["array of strings (optional, default: ['all'])"]
}
```

**Nota**: El `userId` se extrae automáticamente del token JWT de Cognito, por lo que no es necesario enviarlo en el body.

#### Ejemplo de Request
```json
{
  "deviceId": "device-001",
  "token": "FCM_TOKEN_DEL_USUARIO",
  "platform": "web",
  "topics": ["all", "events"]
}
```

#### Response

**Success (201 - Created)**
```json
{
  "success": true,
  "message": "FCM token registered successfully",
  "data": {
    "userId": "u-123",
    "deviceId": "device-001",
    "token": "FCM_TOKEN_DEL_USUARIO",
    "platform": "web",
    "topics": ["all", "events"],
    "createdAt": "2025-01-27T12:00:00Z",
    "updatedAt": "2025-01-27T12:00:00Z"
  }
}
```

**Success (200 - Updated)**
```json
{
  "success": true,
  "message": "FCM token updated successfully",
  "data": {
    "userId": "u-123",
    "deviceId": "device-001",
    "token": "NUEVO_FCM_TOKEN",
    "platform": "web",
    "topics": ["all", "events"],
    "createdAt": "2025-01-27T12:00:00Z",
    "updatedAt": "2025-01-27T12:00:00Z"
  }
}
```

**Error (400 - Bad Request)**
```json
{
  "success": false,
  "error": "Missing required fields: deviceId and token are required"
}
```

**Error (401 - Unauthorized)**
```json
{
  "success": false,
  "error": "Failed to extract user ID from token: No valid authorization header"
}
```

**Error (500 - Internal Server Error)**
```json
{
  "success": false,
  "error": "Error details"
}
```

## Estructura de la Base de Datos

### Tabla: fcm_tokens

| Campo | Tipo | Descripción |
|-------|------|-------------|
| userId | String | ID del usuario (Hash Key) - Extraído del token JWT |
| deviceId | String | ID del dispositivo (Range Key) |
| token | String | Token FCM del dispositivo |
| platform | String | Plataforma del dispositivo (web, android, ios) |
| topics | Array | Lista de tópicos a los que está suscrito |
| createdAt | String | Fecha de creación (ISO 8601) |
| updatedAt | String | Fecha de última actualización (ISO 8601) |

### Índices Globales Secundarios (GSI)

1. **TokenIndex**: Hash key en `token` - Útil para búsquedas por token
2. **PlatformIndex**: Hash key en `platform` - Útil para filtrar por plataforma

## Comportamiento

- **Autenticación**: El `userId` se extrae automáticamente del token JWT de Cognito
- **Registro**: Si no existe un token para la combinación `userId` + `deviceId`, se crea uno nuevo
- **Actualización**: Si ya existe, se actualiza el token y los campos opcionales
- **Validación**: Se requieren `deviceId` y `token` en el body
- **Valores por defecto**: `platform` se establece como "web" si no se proporciona, `topics` se establece como `["all"]`

## Casos de Uso

1. **Registro inicial**: Usuario instala la app y se registra su token FCM
2. **Actualización de token**: El token FCM se renueva y se actualiza en la base de datos
3. **Múltiples dispositivos**: Un usuario puede tener tokens en varios dispositivos
4. **Cambio de tópicos**: El usuario puede cambiar sus suscripciones a tópicos

## Seguridad

- **Autenticación**: Requiere token JWT válido de Cognito
- **Autorización**: El usuario solo puede registrar/actualizar sus propios tokens (extraído del JWT)
- **Validación**: Se valida que todos los campos requeridos estén presentes
- **Seguridad**: No se permite que un usuario registre tokens para otro usuario

## Notas de Implementación

- El lambda extrae automáticamente el `userId` del token JWT de Cognito
- Se incluyen headers CORS para compatibilidad con aplicaciones web
- Los timestamps se generan automáticamente en formato ISO 8601
- El servicio es idempotente: múltiples llamadas con los mismos datos no causan efectos secundarios
- Respuestas consistentes con el formato `{ success: boolean, message: string, data: object }`
