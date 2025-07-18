# AppSync GraphQL API

Este módulo implementa la API GraphQL de AppSync para el sistema de notificaciones de la aplicación re:Event.

## Sistema de Notificaciones

El sistema de notificaciones está completamente implementado a través de AppSync, aprovechando las siguientes ventajas:

1. **Suscripciones en tiempo real**: Permite a los clientes recibir notificaciones instantáneas cuando se crean nuevas notificaciones.
2. **Conexión directa a DynamoDB**: Sin necesidad de funciones Lambda intermedias, lo que reduce la latencia y los costos.
3. **Flexibilidad para el cliente**: Los clientes pueden solicitar exactamente los datos que necesitan.

## Operaciones disponibles

### Queries
- `getNotifications(role: String!, limit: Int)`: Obtiene notificaciones por rol
- `getUserNotifications(userId: String!, limit: Int)`: Obtiene notificaciones específicas para un usuario

### Mutations
- `createNotification(input: NotificationInput!)`: Crea una nueva notificación
- `markNotificationAsRead(notificationId: ID!, createdAt: String!)`: Marca una notificación como leída

### Subscriptions
- `onCreateNotification(targetRole: String!)`: Suscripción a nuevas notificaciones por rol
- `onCreateUserNotification(userId: String!)`: Suscripción a nuevas notificaciones para un usuario específico

## Nota importante

Este es ahora el **único punto de acceso** para el sistema de notificaciones. Los endpoints REST de API Gateway para notificaciones han sido eliminados para simplificar la arquitectura y mejorar el rendimiento.