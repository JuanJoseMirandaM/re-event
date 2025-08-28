# Firebase Setup para FCM (Firebase Cloud Messaging)

## 🎯 **Objetivo**
Configurar Firebase para enviar notificaciones push desde el lambda de notificaciones.

## 📋 **Pasos para Configurar Firebase**

### **1. Crear Proyecto en Firebase Console**
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Anota el **Project ID**

### **2. Habilitar Cloud Messaging**
1. En el menú lateral, ve a **Engage** → **Messaging**
2. Haz clic en **Get started**
3. Sigue los pasos para configurar FCM

### **3. Crear Service Account**
1. Ve a **Project Settings** (⚙️ icono)
2. Pestaña **Service accounts**
3. Haz clic en **Generate new private key**
4. Descarga el archivo JSON

### **4. Extraer Credenciales del JSON**
Del archivo JSON descargado, necesitas:

```json
{
  "project_id": "tu-proyecto-id",
  "client_email": "firebase-adminsdk-xxxxx@tu-proyecto.iam.gserviceaccount.com",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
}
```

## 🔧 **Configuración en Terraform**

### **1. Variables de Entorno**
Agrega estas variables a tu archivo `terraform.tfvars`:

```hcl
# Firebase Configuration
firebase_project_id   = "tu-proyecto-id"
firebase_client_email = "firebase-adminsdk-xxxxx@tu-proyecto.iam.gserviceaccount.com"
firebase_private_key  = "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### **2. Variables Sensibles**
La `private_key` es sensible, considera usar:
- **AWS Secrets Manager**
- **Environment variables**
- **Terraform Cloud variables**

## 🚀 **Flujo de Notificaciones**

### **1. Crear Notificación**
```
POST /notifications
{
  "title": "🚀 Inscripciones abiertas",
  "body": "Regístrate ahora para el AWS Community Day Bolivia.",
  "type": "anuncio",
  "audience": "all"
}
```

### **2. Proceso del Lambda**
1. **Validar** datos de entrada
2. **Guardar** en DynamoDB
3. **Obtener** tokens FCM según audiencia
4. **Enviar** notificación a FCM
5. **Retornar** resultado con estadísticas

### **3. Tipos de Audiencia**
- **`all`**: Envía a todos los dispositivos registrados
- **`user`**: Envía solo al usuario específico
- **`segment`**: Envía a un segmento (implementación futura)

## 📱 **Formato de Notificación FCM**

### **Estructura del Mensaje**
```javascript
{
  notification: {
    title: "Título de la notificación",
    body: "Cuerpo del mensaje",
    imageUrl: "https://example.com/image.jpg"
  },
  data: {
    notificationId: "n-abc123",
    type: "anuncio",
    actionType: "link",
    actionValue: "https://example.com",
    audience: "all"
  },
  android: {
    notification: {
      clickAction: 'FLUTTER_NOTIFICATION_CLICK'
    }
  },
  apns: {
    payload: {
      aps: {
        'mutable-content': 1
      }
    }
  }
}
```

### **Datos Personalizados**
- **`notificationId`**: ID único de la notificación
- **`type`**: Tipo (evento, anuncio, recompensa)
- **`actionType`**: Tipo de acción (link, screen)
- **`actionValue`**: Valor de la acción (URL o ruta)

## 🔍 **Logs y Debugging**

### **Logs del Lambda**
```javascript
// Creación exitosa
'Notification created: {...}'

// Resultado FCM
'FCM Response: { successCount: 5, failureCount: 1 }'

// Tokens fallidos
'Token failed: token123, Error: InvalidRegistration'
```

### **Métricas FCM**
- **`successCount`**: Notificaciones enviadas exitosamente
- **`failureCount`**: Notificaciones que fallaron
- **`sentTo`**: Total de tokens procesados

## 🚨 **Manejo de Errores**

### **Errores Comunes**
1. **Credenciales inválidas**: Verificar service account
2. **Tokens expirados**: Limpiar tokens inválidos
3. **Rate limiting**: FCM tiene límites de envío
4. **Timeout**: Aumentar timeout del lambda si es necesario

### **Estrategia de Fallback**
- **FCM falla**: La notificación se crea en DynamoDB
- **Tokens inválidos**: Se registran en logs para limpieza
- **Rate limiting**: Implementar retry con backoff exponencial

## 📊 **Monitoreo y Métricas**

### **CloudWatch Metrics**
- **Invocations**: Número de ejecuciones del lambda
- **Duration**: Tiempo de ejecución
- **Errors**: Errores del lambda
- **Throttles**: Limitaciones de FCM

### **Logs Personalizados**
- **FCM Success Rate**: Porcentaje de envíos exitosos
- **Token Count**: Número de tokens por audiencia
- **Notification Types**: Distribución por tipo

## 🔐 **Seguridad**

### **Credenciales**
- **Service Account**: Solo permisos necesarios para FCM
- **Private Key**: Nunca commitear en código
- **IAM Roles**: Lambda solo accede a recursos necesarios

### **Validaciones**
- **Input Validation**: Validar todos los campos de entrada
- **Authorization**: Verificar JWT token de Cognito
- **Rate Limiting**: Implementar límites por usuario

## 🧪 **Testing**

### **Notificaciones de Prueba**
```bash
# Notificación global
curl -X POST /notifications \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "🧪 Test Notification",
    "body": "Esta es una notificación de prueba",
    "type": "anuncio",
    "audience": "all"
  }'

# Notificación para usuario específico
curl -X POST /notifications \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "👋 Hola Usuario",
    "body": "Notificación personalizada",
    "type": "anuncio",
    "audience": "user",
    "userId": "u-123"
  }'
```

### **Verificar FCM**
1. **Frontend**: Verificar que se reciba la notificación
2. **Logs**: Revisar logs del lambda en CloudWatch
3. **DynamoDB**: Confirmar que se guardó la notificación
4. **FCM Console**: Verificar estadísticas de envío

## 📈 **Próximos Pasos**

### **Mejoras Futuras**
1. **Segmentación**: Implementar lógica de segmentos
2. **Scheduling**: Notificaciones programadas
3. **Templates**: Plantillas de notificaciones
4. **Analytics**: Tracking de engagement
5. **A/B Testing**: Variantes de notificaciones

### **Escalabilidad**
1. **SNS**: Migrar a arquitectura desacoplada
2. **Batch Processing**: Procesar notificaciones en lotes
3. **Caching**: Cachear tokens FCM frecuentes
4. **Async Processing**: Procesar FCM de forma asíncrona
