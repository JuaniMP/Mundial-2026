# Feature Specification: API REST Mundial 2026 Hub

**Feature Branch**: `002-mundial-api`
**Created**: 2026-04-30
**Status**: Draft
**Input**: "API REST para gestionar mundial 2026 con entidades de usuarios, roles, selecciones, jugadores, partidos, entradas, pollas, album digital, paquetes, intercambios, soporte, logs, notificaciones, aliados comerciales y reportes compliance. Paquete base: co.edu.unbosque. Java 17 con Spring Boot."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Gestión de Usuarios y Roles (Priority: P1)

Como sistema necesito gestionar usuarios con diferentes roles para controlar el acceso a las funcionalidades de la aplicación.

**Why this priority**: Fundamental para todo el sistema - sin gestión de usuarios no hay autenticación ni control de acceso.

**Independent Test**: Se puede probar creando usuarios con diferentes roles y verificando que cada rol tenga los permisos correctos.

**Acceptance Scenarios**:

1. **Given** el sistema sin usuarios, **When** se crea un nuevo usuario con rol AFICIONADO, **Then** el usuario se registra correctamente en la base de datos.
2. **Given** un usuario registrado, **When** inicia sesión, **Then** se actualiza su campo ultimo_login.
3. **Given** un usuario con rol ADMIN, **When** intenta modificar otro usuario, **Then** tiene permiso para hacerlo.

---

### User Story 2 - Gestión de Selecciones y Jugadores (Priority: P1)

Como aficionado quiero ver las selecciones participantes y sus jugadores para conocer los equipos del mundial.

**Why this priority**: Centro de la aplicación - todo gira alrededor de las selecciones y jugadores.

**Independent Test**: Se puede probar consultando la lista de selecciones y verificando que incluya todos los equipos con su información.

**Acceptance Scenarios**:

1. **Given** las selecciones cargadas en el sistema, **When** se consulta una selección específica, **Then** retorna sus datos incluyendo bandera y grupo.
2. **Given** una selección con jugadores, **When** se consultan los jugadores, **Then** retorna la lista completa con posición y estadísticas.

---

### User Story 3 - Gestión de Partidos y Resultados (Priority: P1)

Como usuario quiero ver los partidos programados y sus resultados para seguir el mundial.

**Why this priority**: Funcionalidad core del mundial - usuarios necesitan ver horarios y marcadores.

**Acceptance Scenarios**:

1. **Given** un partido programado, **When** se consulta antes de jugarse, **Then** muestra estado PROGRAMADO con marcador 0-0.
2. **Given** un partido terminado, **When** se actualiza el marcador, **Then** el estado cambia a TERMINADO.

---

### User Story 4 - Gestión de Entradas (Priority: P2)

Como aficionado quiero comprar entradas para los partidos del mundial.

**Why this priority**: Genera ingresos y permite controlar acceso a estadios.

**Acceptance Scenarios**:

1. **Given** entradas disponibles para un partido, **When** un usuario compra una entrada, **Then** se genera un código QR único.
2. **Given** una entrada comprada, **When** el usuario intenta venderla, **Then** puede transferirla a otro usuario.

---

### User Story 5 - Pollas Futboleras (Priority: P2)

Como usuario quiero participar en pollas para predecir resultados y ganar puntos.

**Why this priority**: Funcionalidad social que aumenta engagement de usuarios.

**Acceptance Scenarios**:

1. **Given** una polla creada, **When** un usuario se une con el código de acceso, **Then** aparece en la lista de participantes.
2. **Given** un partido terminado, **When** se evalúa una predicción, **Then** se asignan puntos según exactitud del resultado.

---

### User Story 6 - Álbum Digital y Intercambios (Priority: P3)

Como coleccionista quiero obtener láminas y exchambiar con otros usuarios para completar mi álbum.

**Why this priority**: Gamificación - mantiene usuarios activos mediante coleccionismo.

**Acceptance Scenarios**:

1. **Given** un usuario abre un paquete, **When** contiene láminas aleatorias, **Then** se agregan a su álbum.
2. **Given** dos usuarios con láminas repetidas, **When** realizan un intercambio, **Then** ambas láminas se transfieren correctamente.

---

### User Story 7 - Sistema de Soporte (Priority: P2)

Como usuario reporto incidentes y como agente los atiendo.

**Why this priority**: Atención al cliente esencial para operación.

**Acceptance Scenarios**:

1. **Given** un usuario reporta un incidente, **When** se crea el ticket, **Then** queda en estado ABIERTO con prioridad asignada.
2. **Given** un agente atende un incidente, **When** lo marca como RESUELTO, **Then** el estado cambia y se registra la resolución.

---

### User Story 8 - Compliance y Reporting (Priority: P3)

Como administrador de compliance necesito generar reportes de auditoría y monitorear aliados comerciales.

**Why this priority**: Requisito legal y de seguridad para operación formal.

**Acceptance Scenarios**:

1. **Given** un usuario realiza una acción crítica, **When** se registra en logs transaccionales, **Then** queda registrado con hash de integridad.
2. **Given** se genera un reporte de compliance, **When** se guarda, **Then** queda enlazado al usuario que lo generó.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema debe permitir CRUD completo de usuarios con diferentes roles (AFICIONADO, OPERADOR, SOPORTE, COMPLIANCE, ADMIN, ALIADO)
- **FR-002**: El sistema debe gestionar selecciones con código FIFA, confederación, grupo y estadísticas históricas
- **FR-003**: El sistema debe registrar jugadores con datos personales, posición, estadísticas (goles, minutos jugados) y asociación a selección
- **FR-004**: El sistema debe gestionar partidos con horario, ronda (Fase de Grupos, Octavos, etc.), estadio y resultado
- **FR-005**: El sistema debe emitir entradas con código QR único, categoría, precio y estado
- **FR-006**: El sistema debe permitir crear y unir pollas con código de acceso único
- **FR-007**: El sistema debe evaluar predicciones y calcular puntos según exactitud
- **FR-008**: El sistema debe gestionar álbum digital del usuario con progreso de completado
- **FR-009**: El sistema debe generar paquetes de láminas aleatorias con diferentes rarezas
- **FR-010**: El sistema debe permitir intercambio de láminas entre usuarios
- **FR-011**: El sistema debe crear y gestionar tickets de soporte con prioridades
- **FR-012**: El sistema debe registrar logs transaccionales con hash de integridad
- **FR-013**: El sistema debe enviar notificaciones a usuarios por diferentes canales
- **FR-014**: El sistema debe gestionar aliados comerciales con tokens de acceso
- **FR-015**: El sistema debe generar reportes de interacción con APIs de aliados
- **FR-016**: El sistema debe generar reportes de compliance con auditoría

### Key Entities *(include if feature involves data)*

- **Rol**: id, nombre (AFICIONADO, OPERADOR, SOPORTE, COMPLIANCE, ADMIN, ALIADO)
- **Usuario**: id, nombre, email, password_hash, zona_horaria, seleccion_favorita, id_rol, fecha_registro, ultimo_login
- **Sede**: id, ciudad, pais
- **Estadio**: id, nombre, direccion, capacidad, id_sede
- **Seleccion**: id, pais, codigo_fifa, confederacion, grupo, historial, bandera_url
- **Jugador**: id, nombre_completo, posicion, dorsal, fecha_nacimiento, nacionalidad, minutos_jugados, goles, foto_url, id_seleccion
- **Partido**: id, fecha_hora, ronda, estado, marcador_local, marcador_visitante, id_estadio, id_seleccion_local, id_seleccion_visitante
- **Entrada**: id, codigo_qr, categoria, precio, estado, id_partido, id_usuario_comprador
- **Polla**: id, nombre, codigo_acceso, pozo_puntos, id_creador
- **ParticipantePolla**: id_usuario, id_polla, puntos_acumulados
- **Prediccion**: id, goles_local, goles_visitante, puntos_obtenidos, id_usuario, id_polla, id_partido, fecha_prediccion
- **Album**: id, id_usuario, porcentaje_completado, laminas_pegadas
- **Lamina**: id, rareza, id_jugador
- **LaminaAlbum**: id_album, id_lamina, esta_pegada, cantidad_repetidas
- **Paquete**: id, id_usuario, estado, fecha_obtencion
- **IntercambioLamina**: id, id_solicitante, id_receptor, id_lamina_ofrecida, id_lamina_solicitada, estado, fecha_solicitud, fecha_resolucion
- **IncidenteSoporte**: id, descripcion, estado, prioridad, id_reportador, id_agente_soporte, fecha_creacion
- **LogsTransaccional**: id, accion, timestamp, detalle, hash_integridad, nivel_riesgo, verificado_compliance, id_usuario
- **Notificacion**: id, mensaje, canal, id_destinatario, id_emisor, fecha_envio
- **AliadoComercial**: id, nombre, tipo_servicio, token_acceso, estado
- **ReporteInteraccionAPI**: id, id_aliado, endpoint, peticiones_exitosas, peticiones_fallidas, fecha_corte
- **ReporteCompliance**: id, tipo_reporte, descripcion, ruta_archivo, id_generador, fecha_generacion

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Los usuarios pueden registrar y autenticarse en menos de 30 segundos
- **SC-002**: El sistema gestiona al menos 1000 usuarios concurrentes sin degradación
- **SC-003**: Las consultas de selecciones y jugadores retornan en menos de 2 segundos
- **SC-004**: El sistema procesa al menos 500 predicciones por partido
- **SC-005**: Los intercambios de láminas se completan en menos de 5 segundos
- **SC-006**: Los logs transaccionales se registran con hash SHA-256 para integridad

## Assumptions

- La autenticación usará JWT estándar con tokens de acceso
- Los paquetes de láminas siguen distribución de rarezas: Común (60%), Raro (30%), Épico (8%), Legendario (2%)
- Las pollas calculan puntos: resultado exacto = 10 puntos, ganador correcto = 5 puntos, solo goleador correcto = 3 puntos
- El dominio base es co.edu.unbosque para todos los paquetes Java
- Base de datos MySQL 8.0 con el esquema definido en el input