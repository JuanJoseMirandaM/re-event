# re:Event - AWS Community Day App

Aplicación web progresiva (PWA) para el AWS Community Day 2025, diseñada para mejorar la experiencia de los asistentes mediante gamificación, networking y gestión integral del evento.

## 🎯 Objetivo

Crear una plataforma integral que permita a los participantes del AWS Community Day interactuar, ganar puntos, evaluar sesiones y acceder a funcionalidades exclusivas según su rol en el evento.

## 🚀 Funcionalidades Principales

### Autenticación y Perfiles
- Registro/Login con email/password, Google o LinkedIn (AWS Cognito)
- Perfil básico: nombre, empresa, email, teléfono
- Edición de datos personales
- Sistema de verificación por código de 6 caracteres

### Sistema de Roles
- **Asistente**: Funcionalidades básicas
- **Speaker**: Gestión de sesiones y feedback
- **Patrocinador**: Otorgamiento de puntos y asistencia
- **Voluntario**: Sistema de asistencia y notificaciones
- **Organizador**: Control total y notificaciones

### Gamificación
- Sistema de puntos con reglas dinámicas
- Top 10 de usuarios con más puntos
- Historial de transacciones
- Canje de puntos por premios
- Billetera digital para sponsors/organizadores

### Gestión del Evento
- Agenda completa con sesiones, horarios y speakers
- Sistema de asistencia y control de entregas
- Galería de fotos con procesamiento automático
- **Reconocimiento facial con AWS Rekognition**
- Detección automática de caras en fotos
- Indexación de rostros para búsqueda
- Galería personalizada por asistente
- QR codes únicos por sesión

### Evaluación y Feedback
- Formularios dinámicos por tipo de sesión
- Evaluación en tiempo real
- Sistema NPS y escalas de satisfacción
- Análisis de sentimiento en comentarios
- Gamificación del feedback (15 puntos por evaluación)

### Notificaciones y Asistencia
- Notificaciones in-app con SQS
- Sistema de solicitud de asistencia
- Categorización de tipos de asistencia
- Notificaciones automáticas a voluntarios

## 📱 Tecnologías

- **Frontend**: PWA (Progressive Web App)
- **Backend**: AWS Serverless
- **Autenticación**: AWS Cognito
- **Base de Datos**: DynamoDB
- **Notificaciones**: Amazon SQS
- **Procesamiento de Imágenes**: AWS Lambda
- **Reconocimiento Facial**: AWS Rekognition
- **Storage**: Amazon S3

## 📋 Estructura del Proyecto

```
re:Event/
├── docs/                    # Documentación
├── frontend/               # Aplicación PWA
├── backend/               # APIs y Lambda functions
├── infrastructure/        # IaC con CDK/CloudFormation
└── assets/               # Recursos estáticos
```

## 🔗 Enlaces Rápidos

- [Arquitectura del Sistema](./docs/architecture.md)
- [Especificaciones Técnicas](./docs/technical-specs.md)
- [Casos de Uso](./docs/use-cases.md)
- [API Documentation](./docs/api-docs.md)
- [Guía de Despliegue](./docs/deployment.md)
- [Configuración Angular](./docs/angular-setup.md)

## 🏗️ Estado del Proyecto

🚧 **En Desarrollo** - Documentación y planificación inicial