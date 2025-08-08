# Evaluation System - Deployment Guide

## 📋 Overview

El sistema de evaluaciones permite a los usuarios calificar sesiones, speakers y eventos. Incluye 4 Lambda functions y una tabla DynamoDB para almacenar las evaluaciones.

## 🏗️ Architecture

### Lambda Functions
- **create-evaluation**: Crea una nueva evaluación
- **get-evaluation**: Obtiene una evaluación específica por usuario y sesión
- **get-evaluations-by-session**: Lista todas las evaluaciones de una sesión
- **get-evaluations-by-user**: Lista todas las evaluaciones de un usuario

### DynamoDB Table
- **reevent-evaluations-dev**: Almacena todas las evaluaciones con índices para consultas eficientes

### API Gateway Endpoints
- `POST /evaluations` - Crear evaluación
- `GET /evaluations?sessionId=Y` - Obtener evaluación específica del usuario autenticado
- `GET /evaluations/session/{sessionId}` - Listar evaluaciones por sesión
- `GET /evaluations/user` - Listar evaluaciones del usuario autenticado

## 🚀 Deployment

### 1. Build Lambda Functions

```bash
cd backend/lambdas/evaluation
chmod +x build.sh
./build.sh
```

Esto creará los archivos ZIP necesarios:
- `create-evaluation.zip`
- `get-evaluation.zip`
- `get-evaluations-by-session.zip`
- `get-evaluations-by-user.zip`

### 2. Deploy Infrastructure

```bash
cd terraform
terraform plan
terraform apply
```

### 3. Verify Deployment

```bash
# List Lambda functions
aws lambda list-functions --query 'Functions[?contains(FunctionName, `evaluation`)]'

# List API Gateway resources
aws apigateway get-resources --rest-api-id YOUR_API_ID
```

## 🧪 Testing

### 1. Update Test Script

Edita `backend/test-evaluation-api.sh` con tus credenciales:

```bash
API_BASE_URL="https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/dev"
COGNITO_USER_POOL_ID="your-user-pool-id"
COGNITO_CLIENT_ID="your-client-id"
USERNAME="test@example.com"
PASSWORD="TestPassword123!"
```

### 2. Run Tests

```bash
cd backend
chmod +x test-evaluation-api.sh
./test-evaluation-api.sh
```

## 📊 Example Usage

### Create Evaluation

```bash
curl -X POST "https://your-api.com/dev/evaluations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "sessionId": "session-123",
    "rating": 5,
    "npsScore": 9,
    "comments": "Excelente presentación sobre serverless",
    "sentiment": "POSITIVE"
  }'
```

### Get Evaluation by User and Session

```bash
curl -X GET "https://your-api.com/dev/evaluations?sessionId=session-123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Evaluations by Session

```bash
curl -X GET "https://your-api.com/dev/evaluations/session/session-123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Evaluations by User

```bash
curl -X GET "https://your-api.com/dev/evaluations/user" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📈 Data Model

### Evaluation Record
```json
{
  "evaluationId": "eval-001",
  "sessionId": "session-123",
  "userId": "usr-001",
  "rating": 5,
  "npsScore": 9,
  "comments": "Excelente presentación sobre serverless",
  "sentiment": "POSITIVE",
  "createdAt": "2025-03-15T10:30:00Z"
}
```

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

## 🔐 Authorization

Todos los endpoints requieren autenticación via Cognito JWT token.

### Business Rules
- Un usuario solo puede evaluar una sesión una vez
- Las evaluaciones no se pueden modificar una vez creadas
- Los comentarios son opcionales pero recomendados

## 📊 Analytics

### Métricas por Sesión
- Promedio de rating
- Distribución de ratings (1-5)
- Score NPS promedio
- Total de evaluaciones
- Análisis de sentimiento

### Métricas por Usuario
- Total de evaluaciones realizadas
- Promedio de ratings otorgados
- Tendencia de participación

## 🔄 Integration Points

### Points System
- Las evaluaciones pueden otorgar puntos automáticamente
- Puntos por completar evaluación: 10-15 puntos
- Puntos adicionales por comentarios detallados: 5 puntos

### Notifications
- Notificación al speaker cuando recibe nueva evaluación
- Notificación al organizador sobre evaluaciones con rating bajo
- Resumen diario de métricas de evaluación

## 🚨 Troubleshooting

### Common Issues

1. **Lambda timeout**: Aumentar timeout en `evaluation-lambdas.tf`
2. **Permission denied**: Verificar IAM roles y políticas
3. **Table not found**: Verificar que la tabla DynamoDB existe
4. **Invalid token**: Verificar Cognito configuration

### Debug Commands

```bash
# Check Lambda logs
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/reevent-evaluation"

# Test Lambda directly
aws lambda invoke --function-name reevent-create-evaluation-dev --payload '{"body":"{\"sessionId\":\"test\",\"userId\":\"test\",\"rating\":5}"}' response.json

# Check DynamoDB table
aws dynamodb scan --table-name reevent-evaluations-dev --limit 5
```

## 📚 Documentation

- [Evaluation API Documentation](./EVALUATION_API.md)
- [Database Schema](./AGENDA_SCHEMA.md)
- [Architecture Overview](../docs/architecture.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

Para soporte técnico o preguntas sobre el sistema de evaluaciones, contacta al equipo de desarrollo.
