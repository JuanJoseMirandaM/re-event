# Favorites API Documentation

## Overview
API endpoints for managing user favorites and enriched event data.

## Endpoints

### 1. Get Events with User Data
**GET** `/events?includeUserData=true`

Retrieves events with user-specific data (evaluations and favorites).

#### Query Parameters
- `includeUserData` (boolean): Include user-specific data (evaluations, favorites)
- `upcoming` (boolean): Filter upcoming events
- `past` (boolean): Filter past events
- `limit` (number): Number of events to return (default: 20)
- `lastKey` (string): Pagination token

#### Headers
- `Authorization`: Bearer token (required for user data)

#### Response
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "eventId": "event-123",
        "title": "Event Title",
        "description": "Event Description",
        "startDate": "2024-01-15",
        "endDate": "2024-01-15",
        "time": "10:00",
        "location": "Event Location",
        "locationLink": "https://maps.google.com/...",
        "speakers": ["Speaker 1", "Speaker 2"],
        "tags": ["tech", "ai"],
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "userData": {
          "isEvaluated": true,
          "isFavorite": false,
          "evaluation": {
            "evaluationId": "eval-123",
            "rating": 4,
            "npsScore": 8,
            "comments": "Great event!",
            "sentiment": "positive",
            "createdAt": "2024-01-15T12:00:00.000Z"
          }
        }
      }
    ],
    "lastKey": "eyJldmVudElkIjoiZXZlbnQtMTI0In0=",
    "count": 1
  }
}
```

### 2. Add Favorite
**POST** `/favorites`

Adds an event to user's favorites.

#### Headers
- `Authorization`: Bearer token (required)

#### Request Body
```json
{
  "eventId": "event-123"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "userId": "user-123",
    "eventId": "event-123",
    "createdAt": "2024-01-15T12:00:00.000Z"
  }
}
```

### 3. Remove Favorite
**DELETE** `/favorites/{eventId}`

Removes an event from user's favorites.

#### Headers
- `Authorization`: Bearer token (required)

#### Path Parameters
- `eventId`: ID of the event to remove from favorites

#### Response
```json
{
  "success": true,
  "data": {
    "eventId": "event-123"
  }
}
```

### 4. Get User Favorites
**GET** `/favorites`

Retrieves user's favorite events with full event details.

#### Headers
- `Authorization`: Bearer token (required)

#### Query Parameters
- `limit` (number): Number of favorites to return (default: 20)
- `lastKey` (string): Pagination token

#### Response
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "userId": "user-123",
        "eventId": "event-123",
        "createdAt": "2024-01-15T12:00:00.000Z",
        "event": {
          "eventId": "event-123",
          "title": "Event Title",
          "description": "Event Description",
          "startDate": "2024-01-15",
          "endDate": "2024-01-15",
          "time": "10:00",
          "location": "Event Location",
          "locationLink": "https://maps.google.com/...",
          "speakers": ["Speaker 1", "Speaker 2"],
          "tags": ["tech", "ai"],
          "createdAt": "2024-01-01T00:00:00.000Z",
          "updatedAt": "2024-01-01T00:00:00.000Z"
        }
      }
    ],
    "lastKey": "eyJ1c2VySWQiOiJ1c2VyLTEyMyIsImV2ZW50SWQiOiJldmVudC0xMjQifQ==",
    "count": 1
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "eventId is required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "No valid authorization header"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Event not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "error": "Event already in favorites"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

## Usage Examples

### Get Events with User Data
```bash
curl -X GET "https://api.example.com/events?includeUserData=true&upcoming=true" \
  -H "Authorization: Bearer your-jwt-token"
```

### Add Favorite
```bash
curl -X POST "https://api.example.com/favorites" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{"eventId": "event-123"}'
```

### Remove Favorite
```bash
curl -X DELETE "https://api.example.com/favorites/event-123" \
  -H "Authorization: Bearer your-jwt-token"
```

### Get User Favorites
```bash
curl -X GET "https://api.example.com/favorites" \
  -H "Authorization: Bearer your-jwt-token"
```
