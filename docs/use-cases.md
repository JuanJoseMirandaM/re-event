# Casos de Uso - re:Event

## 👥 Actores del Sistema

- **Asistente**: Usuario básico del evento
- **Speaker**: Ponente de sesiones
- **Patrocinador**: Empresa patrocinadora
- **Voluntario**: Personal de apoyo
- **Organizador**: Administrador del evento

## 📋 Casos de Uso por Actor

### 🎯 Asistente

#### UC-001: Registro en la Aplicación
**Actor**: Asistente  
**Descripción**: El usuario se registra usando email/password, Google o LinkedIn  
**Flujo Principal**:
1. Usuario accede a la app
2. Selecciona método de registro
3. Completa información básica (nombre, empresa, email, teléfono)
4. Confirma registro
5. Sistema crea perfil básico

**Postcondición**: Usuario registrado con perfil básico

#### UC-002: Verificación con Código
**Actor**: Asistente  
**Descripción**: Usuario ingresa código de 6 caracteres para acceder a funcionalidades completas  
**Flujo Principal**:
1. Usuario ingresa código de credencial
2. Sistema valida código único
3. Sistema asigna rol correspondiente
4. Activa funcionalidades según rol

**Postcondición**: Usuario verificado con rol asignado

#### UC-003: Ver Agenda del Evento
**Actor**: Asistente  
**Descripción**: Consultar sesiones, horarios y speakers  
**Flujo Principal**:
1. Usuario accede a sección agenda
2. Sistema muestra lista de sesiones
3. Usuario puede filtrar por horario/tema
4. Selecciona sesión para ver detalles

**Postcondición**: Usuario informado sobre agenda

#### UC-004: Evaluar Sesión
**Actor**: Asistente  
**Descripción**: Proporcionar feedback de sesión mediante QR  
**Flujo Principal**:
1. Usuario escanea QR de sesión
2. Sistema abre formulario específico
3. Usuario completa evaluación (rating, NPS, comentarios)
4. Sistema procesa sentiment analysis
5. Otorga 15 puntos por completar

**Postcondición**: Evaluación registrada, puntos otorgados

#### UC-005: Consultar Puntos
**Actor**: Asistente  
**Descripción**: Ver balance y historial de puntos  
**Flujo Principal**:
1. Usuario accede a sección puntos
2. Sistema muestra balance actual
3. Usuario puede ver historial de transacciones
4. Consulta top 10 de usuarios

**Postcondición**: Usuario informado sobre puntos

#### UC-006: Canjear Premios
**Actor**: Asistente  
**Descripción**: Intercambiar puntos por premios disponibles  
**Flujo Principal**:
1. Usuario accede a catálogo de premios
2. Selecciona premio deseado
3. Confirma canje (verifica puntos suficientes)
4. Sistema deduce puntos y registra canje

**Postcondición**: Premio canjeado, puntos deducidos

### 🎤 Speaker

#### UC-007: Gestionar Sesión
**Actor**: Speaker  
**Descripción**: Ver información de sus sesiones y evaluaciones  
**Flujo Principal**:
1. Speaker accede a sus sesiones
2. Ve detalles, horarios y ubicación
3. Consulta evaluaciones recibidas
4. Puede responder a comentarios

**Postcondición**: Speaker informado sobre sus sesiones

### 💼 Patrocinador

#### UC-008: Otorgar Puntos
**Actor**: Patrocinador  
**Descripción**: Conceder puntos a asistentes como billetera digital  
**Flujo Principal**:
1. Patrocinador accede a sistema de puntos
2. Busca usuario por email/nombre
3. Especifica cantidad y motivo
4. Confirma transacción
5. Sistema actualiza balance del usuario

**Postcondición**: Puntos otorgados y registrados

#### UC-009: Solicitar Asistencia
**Actor**: Patrocinador  
**Descripción**: Pedir ayuda de voluntarios  
**Flujo Principal**:
1. Patrocinador presiona botón "Solicitar Asistencia"
2. Selecciona tipo (técnica, logística, emergencia)
3. Describe la necesidad
4. Sistema notifica a voluntarios disponibles

**Postcondición**: Solicitud enviada a voluntarios

### 🤝 Voluntario

#### UC-010: Responder Asistencia
**Actor**: Voluntario  
**Descripción**: Atender solicitudes de ayuda  
**Flujo Principal**:
1. Voluntario recibe notificación de asistencia
2. Ve detalles de la solicitud
3. Acepta o rechaza la solicitud
4. Si acepta, se dirige al lugar indicado

**Postcondición**: Asistencia proporcionada

### 👨‍💼 Organizador

#### UC-011: Enviar Notificaciones
**Actor**: Organizador  
**Descripción**: Comunicar mensajes a usuarios  
**Flujo Principal**:
1. Organizador accede a panel de notificaciones
2. Selecciona audiencia (todos, por rol, individual)
3. Redacta mensaje
4. Programa envío (inmediato o programado)
5. Sistema envía vía SQS

**Postcondición**: Notificación enviada

#### UC-012: Gestionar Entregas
**Actor**: Organizador  
**Descripción**: Controlar entrega de lunch, refrigerios y merch  
**Flujo Principal**:
1. Organizador accede a control de entregas
2. Busca usuario por código/email
3. Marca entrega correspondiente
4. Sistema actualiza registro del usuario

**Postcondición**: Entrega registrada

## 🔄 Casos de Uso Transversales

### UC-013: Subir Fotos del Evento
**Actor**: Cualquier usuario verificado  
**Descripción**: Compartir fotos que se procesan automáticamente  
**Flujo Principal**:
1. Usuario selecciona foto desde galería/cámara
2. Sistema sube a S3
3. Lambda procesa imagen agregando logo
4. Foto aparece en galería del evento

**Postcondición**: Foto procesada y publicada

### UC-014: Registrar Asistencia a Sesión
**Actor**: Asistente  
**Descripción**: Confirmar presencia en sesión para ganar puntos  
**Flujo Principal**:
1. Usuario escanea QR de asistencia
2. Sistema valida horario de sesión
3. Registra asistencia
4. Otorga puntos por asistir

**Postcondición**: Asistencia registrada, puntos otorgados

### UC-015: Ver Galería de Fotos
**Actor**: Cualquier usuario  
**Descripción**: Explorar fotos del evento  
**Flujo Principal**:
1. Usuario accede a galería
2. Ve fotos organizadas por fecha/sesión
3. Puede filtrar por tags
4. Opción de descargar fotos

**Postcondición**: Usuario ve contenido visual del evento

## 🎮 Reglas de Gamificación

### Puntos por Actividad
- **Registro y verificación**: 50 puntos
- **Asistencia a sesión**: 25 puntos
- **Evaluación completada**: 15 puntos
- **Subir foto**: 10 puntos
- **Completar perfil**: 20 puntos
- **Primer login del día**: 5 puntos

### Multiplicadores
- **Speaker**: 2x puntos por evaluaciones recibidas
- **Voluntario**: 1.5x puntos por asistencias completadas
- **Patrocinador**: Puntos ilimitados para otorgar

### Premios Sugeridos
- **250 puntos**: Sticker del evento
- **500 puntos**: Boligrafo AWSCDBO
- **1000 puntos**: Tasa AWSCDBO
- **2000 puntos**: Camiseta AWSCDBO