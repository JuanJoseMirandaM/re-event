# Sistema de Notificaciones re:Event

## Arquitectura Actual

El sistema de notificaciones de re:Event está implementado exclusivamente a través de **AWS AppSync GraphQL API**. Esta decisión de arquitectura se tomó para simplificar la infraestructura, mejorar el rendimiento y aprovechar las capacidades de tiempo real de GraphQL.

## Ventajas de usar AppSync para Notificaciones

1. **Suscripciones en tiempo real**: Los clientes pueden suscribirse a notificaciones y recibirlas instantáneamente cuando se crean.
2. **Conexión directa a DynamoDB**: Sin necesidad de funciones Lambda intermedias, lo que reduce la latencia y los costos.
3. **Flexibilidad para el cliente**: Los clientes pueden solicitar exactamente los datos que necesitan.
4. **Simplicidad de mantenimiento**: Una sola implementación para todas las operaciones de notificaciones.

## Operaciones Disponibles

### Queries
- `getNotifications(role: String!, limit: Int)`: Obtiene notificaciones por rol
- `getUserNotifications(userId: String!, limit: Int)`: Obtiene notificaciones específicas para un usuario

### Mutations
- `createNotification(input: NotificationInput!)`: Crea una nueva notificación
- `markNotificationAsRead(notificationId: ID!, createdAt: String!)`: Marca una notificación como leída

### Subscriptions
- `onCreateNotification(targetRole: String!)`: Suscripción a nuevas notificaciones por rol
- `onCreateUserNotification(userId: String!)`: Suscripción a nuevas notificaciones para un usuario específico

## Modelo de Datos

```graphql
type Notification {
  notificationId: ID!
  title: String!
  description: String
  createdAt: String!
  author: String!
  link: String
  targetRole: String!
  userId: String
  read: Boolean!
}
```

## Implementación en el Frontend

Para implementar el cliente de notificaciones en el frontend, se recomienda utilizar la biblioteca Amplify de AWS, que facilita la integración con AppSync:

```typescript
import { API, graphqlOperation } from 'aws-amplify';
import { createNotification } from './graphql/mutations';
import { getNotifications, getUserNotifications } from './graphql/queries';
import { onCreateNotification, onCreateUserNotification } from './graphql/subscriptions';

// Crear una notificación
async function sendNotification(notification) {
  try {
    await API.graphql(graphqlOperation(createNotification, { input: notification }));
    console.log('Notificación enviada con éxito');
  } catch (error) {
    console.error('Error al enviar notificación:', error);
  }
}

// Obtener notificaciones por rol
async function fetchNotificationsByRole(role, limit = 20) {
  try {
    const response = await API.graphql(graphqlOperation(getNotifications, { role, limit }));
    return response.data.getNotifications;
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    return [];
  }
}

// Suscribirse a notificaciones por rol
function subscribeToRoleNotifications(role, callback) {
  const subscription = API.graphql(
    graphqlOperation(onCreateNotification, { targetRole: role })
  ).subscribe({
    next: (data) => {
      callback(data.value.data.onCreateNotification);
    },
    error: (error) => console.error('Error en la suscripción:', error)
  });
  
  return subscription;
}
```

## Notas sobre la Migración

Los endpoints REST de API Gateway para notificaciones han sido eliminados para simplificar la arquitectura. Si anteriormente estabas utilizando estos endpoints, deberás actualizar tu código para usar las operaciones GraphQL de AppSync.