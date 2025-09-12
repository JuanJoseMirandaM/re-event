# Kinua - Plataforma para AWS Community Days

> **El Poder de las Comunidades: Gamificando la Experiencia del Evento**

Kinua es una plataforma serverless especializada para AWS Community Days, creada para conectar speakers, participantes, sponsors y organizadores en una experiencia digital sin papel. Nacida de la necesidad de dar feedback a las charlas, implementar un sistema de puntos y reemplazar la "huella de carbón" de papeles por una experiencia digital moderna y sostenible.

## 🌟 ¿Qué es Kinua?

Kinua (de la palabra quechua que significa "conectar" o "reunir") es una plataforma de conexión integral para AWS Community Days que conecta speakers, participantes, sponsors y organizadores en una experiencia digital sin papel.

### El Problema que Resolvemos en AWS Community Days

Los AWS Community Days tradicionales enfrentan:
- **Desconexión entre actores** - Speakers, participantes, sponsors y organizadores no se conectan efectivamente
- **Montañas de papel** - Agendas impresas, formularios de feedback, badges escritos a mano
- **Sin feedback real** - No hay forma de evaluar las charlas y mejorar la experiencia
- **Falta de engagement** - Los asistentes no tienen incentivos para participar activamente
- **Procesos manuales** - Check-in lento, registro manual, gestión de puntos inexistente
- **Huella de carbono** - Toneladas de papel desperdiciado en cada evento

### Nuestra Solución de Conexión

Kinua conecta todos los actores del evento a través de:
- **Conexión integral** - Speakers, participantes, sponsors y organizadores en una sola plataforma
- **Eliminación total del papel** - Todo digital, desde agendas hasta feedback
- **Sistema de feedback en tiempo real** - Evaluación instantánea de charlas y speakers
- **Sistema de puntos gamificado** - Incentivos para participación y networking
- **Agenda digital dinámica** - Actualizaciones en tiempo real sin desperdiciar papel
- **Experiencia 100% móvil** - Todo accesible desde el teléfono del asistente

## 🚀 Características Principales

### 🔗 Conexión Integral de Actores
- **Perfiles para Speakers** - Gestión completa de charlas y feedback
- **Perfiles para Participantes** - Networking, favoritos y puntos
- **Perfiles para Sponsors** - Lead capture y engagement tracking
- **Perfiles para Organizadores** - Dashboard completo de gestión
- **Conexiones cruzadas** - Todos los actores pueden interactuar

### 📱 Agenda Digital Sin Papel
- **Actualizaciones en tiempo real** desde integración con Notion
- **Diseño responsivo** para móviles - sin necesidad de imprimir
- **Seguimiento de sesiones** con analytics en vivo
- **Gestión de speakers** completamente digital
- **Notificaciones push** para cambios de última hora

### 🤝 Plataforma de Networking Gamificada
- **Perfiles basados en QR** para compartir información fácilmente
- **Sistema de intercambio de PIN** que fomenta conversaciones reales
- **Seguimiento de conexiones** con recompensas y tablas de clasificación
- **Insights demográficos** para mejor planificación de eventos
- **Recolección de datos** enfocada en privacidad

### 🎫 Check-in Digital Sin Papel
- **Check-in automatizado** con escaneo de códigos QR
- **Badges digitales** generados automáticamente - sin escritura manual
- **Seguimiento de asistencia en tiempo real**
- **Gestión de lista de espera** completamente digital
- **Integración con Eventbrite** para importar registros

### 💼 Gestión de Sponsors
- **Perfiles de sponsors** con información completa
- **Pasaporte digital** para interacciones - sin stickers físicos
- **Captura de leads** completamente digital
- **Seguimiento de engagement** en tiempo real
- **ROI medible** para patrocinadores
- **Conexión directa** con participantes interesados

### 📊 Feedback y Analytics en Tiempo Real
- **Evaluación instantánea de charlas** - sin formularios de papel
- **Rating de speakers** en tiempo real
- **Métricas de engagement** por sesión
- **Análisis de satisfacción** del evento
- **Reportes automáticos** post-evento
- **Dashboard para organizadores** con métricas completas

### 🎮 Sistema de Puntos y Gamificación
- **Puntos por feedback** de charlas - incentiva evaluación
- **Puntos por networking** - fomenta conexiones reales
- **Puntos por participación** - asistencias, preguntas, interacciones
- **Leaderboards en tiempo real** - competencia sana entre asistentes
- **Recompensas digitales** - badges, certificados, reconocimientos

### 🔔 Sistema de Notificaciones Inteligente
- **Notificaciones push** para cambios de agenda
- **Recordatorios automáticos** de sesiones favoritas
- **Alertas de networking** cuando alguien con intereses similares está cerca
- **Notificaciones de patrocinadores** con ofertas personalizadas
- **Sistema de notificaciones por email** con templates personalizables

### 🎯 Sistema de Evaluaciones y Feedback
- **Evaluaciones de sesiones** en tiempo real
- **Sistema de rating** para speakers y contenido
- **Feedback anónimo** para mejoras continuas
- **Encuestas post-evento** automatizadas
- **Análisis de sentimientos** en comentarios

### 🏆 Gestión de Favoritos y Personalización
- **Sistema de favoritos** para sesiones y speakers
- **Agenda personalizada** basada en intereses
- **Recomendaciones inteligentes** de sesiones
- **Perfil personalizable** con preferencias
- **Historial de eventos** asistidos

### 🔐 Seguridad y Privacidad Avanzada
- **Autenticación multi-factor** (MFA)
- **Cifrado end-to-end** para datos sensibles
- **GDPR compliance** completo
- **Control granular de privacidad** por usuario
- **Auditoría de accesos** y actividad

### 🌐 Internacionalización y Accesibilidad
- **Soporte multi-idioma** (ES, EN, PT, FR)
- **Accesibilidad WCAG 2.1** completa
- **Modo oscuro/claro** automático
- **Soporte para lectores de pantalla**
- **Interfaz adaptable** para diferentes capacidades

### 📱 Funcionalidades Móviles Avanzadas
- **Modo offline** completo con sincronización
- **Notificaciones push nativas**
- **Integración con calendario** del dispositivo
- **Compartir en redes sociales** con templates
- **Widgets de agenda** para pantalla de inicio

## 🏗️ Arquitectura

Kinua está construida en una arquitectura AWS 100% serverless, asegurando escalabilidad, rentabilidad y confiabilidad:

### Frontend
- Aplicación **Angular** con capacidades PWA
- **Amplify** para hosting y CI/CD
- **Diseño responsivo** para todos los dispositivos
- **Funcionalidad offline** para escenarios de conectividad deficiente

### Backend
- Funciones **AWS Lambda** para lógica de negocio
- **API Gateway** para APIs RESTful
- **DynamoDB** para almacenamiento de datos
- **S3** para almacenamiento de archivos y assets estáticos
- **Cognito** para autenticación y gestión de usuarios

### Servicios Adicionales
- **SNS** para notificaciones
- **SES** para comunicaciones por email
- **CloudFront** para entrega global de contenido
- **CloudWatch** para monitoreo y logging
- **Terraform** para infraestructura como código

## 🛠️ Stack Tecnológico

### Frontend
- Angular 17+
- TypeScript
- SCSS
- Angular Material
- Capacidades PWA
- Soporte i18n (Inglés/Español)

### Backend
- Node.js
- AWS Lambda
- DynamoDB
- API Gateway
- AWS SAM para deployment

### Infraestructura
- Terraform
- AWS Amplify
- CloudFront
- Route 53
- AWS Certificate Manager

### Integraciones
- Notion API
- Eventbrite API
- Firebase Cloud Messaging
- Fingerprint.com para prevención de fraude

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+
- AWS CLI configurado
- Terraform instalado
- AWS SAM CLI

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/your-org/kinua.git
cd kinua
```

2. **Desplegar Infraestructura**
```bash
cd terraform
terraform init
terraform plan
terraform apply
```

3. **Desplegar Servicios Backend**
```bash
cd backend/lambdas
sam build
sam deploy --guided
```

4. **Desplegar Frontend**
```bash
cd frontend/re-event-frontend
npm install
npm run build
amplify publish
```

### Configuración del Entorno

1. Copiar la configuración del entorno:
```bash
cp .env.example .env
```

2. Configurar tus credenciales AWS y endpoints de API
3. Configurar tu integración con Notion
4. Configurar tus claves de API de Eventbrite

## 📖 Documentación de API

### APIs Principales

#### Eventos
- `GET /events` - Listar todos los eventos
- `POST /events` - Crear nuevo evento
- `GET /events/{id}` - Obtener detalles del evento
- `PUT /events/{id}` - Actualizar evento
- `DELETE /events/{id}` - Eliminar evento

#### Sesiones
- `GET /sessions` - Listar sesiones
- `POST /sessions` - Crear sesión
- `GET /sessions/{id}` - Obtener detalles de la sesión
- `PUT /sessions/{id}` - Actualizar sesión

#### Usuarios
- `POST /users` - Crear perfil de usuario
- `GET /users/{id}` - Obtener perfil de usuario
- `PUT /users/{id}` - Actualizar perfil de usuario
- `POST /users/verify` - Verificar código de usuario

#### Networking
- `POST /connections` - Crear conexión
- `GET /connections` - Listar conexiones del usuario
- `POST /connections/scan` - Escanear código QR para conexión

#### Puntos y Recompensas
- `GET /points` - Obtener puntos del usuario
- `POST /points/claim` - Reclamar puntos
- `POST /points/deduct` - Descontar puntos
- `GET /points/history` - Obtener historial de puntos

## 🎯 Casos de Uso Específicos

### AWS Community Days
- **AWS Community Day México** - Evento principal de referencia
- **AWS Community Day Chile** - Implementación exitosa
- **AWS Student Community Day** - Versión para estudiantes
- **AWS Community Days regionales** - Escalable a cualquier región

### Eventos de Comunidad AWS
- **AWS User Groups** - Meetups locales
- **AWS Workshops** - Sesiones de capacitación
- **AWS Summits** - Eventos de gran escala
- **AWS re:Invent** - Conferencias globales

### Eventos Tecnológicos Sostenibles
- **Conferencias sin papel** - Cualquier evento tech
- **Hackathons digitales** - Competencias de programación
- **Workshops interactivos** - Capacitaciones con feedback
- **Meetups comunitarios** - Eventos de networking

## 🌍 Impacto en la Comunidad

Kinua ha sido desplegada exitosamente en:
- **AWS Community Day Mexico 2024** (700+ asistentes)
- **AWS Community Day Chile 2024** (500+ asistentes)
- **AWS Student Community Day Mexico 2024** (300+ asistentes)

### Resultados Obtenidos
- **100% eliminación de papel** - Cero impresiones, cero desperdicio
- **90% de reducción** en tiempo de registro
- **65% de aumento** en engagement de networking
- **Feedback real de charlas** - Datos valiosos para mejorar
- **Sistema de puntos funcional** - Incentiva participación activa
- **Cero errores manuales** en generación de badges
- **Experiencia 100% digital** - Todo desde el móvil

## 🤝 Contribuir

Creemos en el poder del código abierto y la colaboración comunitaria. Kinua es open source y ¡bienvenimos las contribuciones!

### Cómo Contribuir
1. Fork del repositorio
2. Crear una rama de feature
3. Hacer tus cambios
4. Agregar tests si aplica
5. Enviar un pull request

### Guías de Desarrollo
- Seguir el estilo de código existente
- Escribir mensajes de commit significativos
- Agregar documentación para nuevas features
- Probar tus cambios exhaustivamente

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🙏 Agradecimientos

- **AWS Community Builders** por inspiración y apoyo
- **AWS Community Day Bolivia** organizadores y voluntarios
- **La comunidad open source** por las increíbles herramientas que usamos
- **Todos los organizadores de eventos** que creen en el poder de las comunidades

## 📞 Soporte

- **Documentación**: [docs.kinua.app](https://docs.kinua.app)
- **Issues**: [GitHub Issues](https://github.com/your-org/kinua/issues)
- **Discusiones**: [GitHub Discussions](https://github.com/your-org/kinua/discussions)
- **Email**: support@kinua.app

## 🌟 La Visión

> *"Tu red es tu valor neto"* - Las conexiones que construimos en las comunidades tecnológicas son puentes hacia oportunidades, donde los estudiantes se conectan con líderes que abren puertas a primeros trabajos y los desarrolladores junior encuentran mentores para su crecimiento profesional.

Kinua nació de la frustración de ver montañas de papel en cada AWS Community Day y la desconexión entre speakers, participantes, sponsors y organizadores. Nuestra visión es simple: **conectar todos los actores del evento** en una plataforma digital que elimine el papel y genere conexiones reales y valiosas.

**Construyamos un futuro donde cada AWS Community Day conecte speakers con su audiencia, participantes con oportunidades, sponsors con leads calificados, y organizadores con datos reales para mejorar continuamente.**

---

*Construido con ❤️ por la Comunidad AWS para la comunidad tecnológica global*