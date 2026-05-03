# Implementation Plan: API REST Mundial 2026 Hub

**Branch**: `002-mundial-api` | **Date**: 2026-04-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-mundial-api/spec.md`

## Summary

API REST completa para gestionar el Mundial 2026 incluyendo gestión de usuarios y roles, selecciones y jugadores, partidos y resultados, entradas, pollas futboleras, álbum digital con intercambios, sistema de soporte, logs transaccionales, notificaciones, aliados comerciales y reportes de compliance.

## Technical Context

**Language/Version**: Java 17
**Primary Dependencies**: Spring Boot 3.x, Spring Data JPA, Spring Security, MySQL Connector, Lombok, MapStruct
**Storage**: MySQL 8.0 (mundial_2026_hub)
**Testing**: JUnit 5, Mockito, Spring Security Test
**Target Platform**: Linux Server (REST API)
**Project Type**: Web Service / REST API
**Performance Goals**: 1000 usuarios concurrentes, <200ms p95, 500+ predicciones/partido
**Constraints**: JWT Authentication, SHA-256 para hash de integridad en logs
**Scale**: 20+ entidades, 16 módulos funcionales

## Constitution Check

| Principio | Estado | Notas |
|-----------|--------|-------|
| Orden | ✓ CUMPLE | Estructura clara por dominio (entities, repositories, services, controllers) |
| Simplicidad | ✓ CUMPLE | No sobreingeniería - uso de annotations de Spring Boot |
| YAGNI | ✓ CUMPLE | Solo lo requerido en spec |

## Project Structure

### Documentation (this feature)

```text
specs/002-mundial-api/
├── plan.md              # This file
├── research.md          # Phase 0 output (if needed)
├── data-model.md        # Entity relationships
├── quickstart.md        # Integration guide
├── contracts/           # API specifications
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/main/java/co/edu/unbosque/
├── config/              # Configuration classes
├── controller/          # REST Controllers
├── dto/                 # Data Transfer Objects
├── entity/              # JPA Entities
├── exception/           # Custom exceptions
├── repository/          # Spring Data Repositories
├── security/            # JWT, Security config
├── service/             # Business logic
└── util/                # Utilities

src/main/resources/
├── application.yml      # Spring configuration
└── data.sql            # Initial data

src/test/java/co/edu/unbosque/
├── controller/          # Controller tests
├── service/             # Service tests
└── integration/         # Integration tests

pom.xml                  # Maven configuration
```

**Structure Decision**: Estructura estándar Spring Boot con paquetes por responsabilidad (controller, service, repository, entity, dto, security). El paquete base `co.edu.unbosque` según requerido.

## Technical Stack

| Componente | Tecnología | Versión |
|------------|------------|---------|
| Framework | Spring Boot | 3.x |
| Persistencia | Spring Data JPA | - |
| Seguridad | Spring Security + JWT | - |
| Base de datos | MySQL | 8.0 |
| Build | Maven | 3.x |
| Java | JDK | 17 |

## Entities Mapping

| Tabla SQL | Entity JPA | Paquete |
|-----------|------------|---------|
| roles | Rol | entity |
| usuarios | Usuario | entity |
| sedes | Sede | entity |
| estadios | Estadio | entity |
| selecciones | Seleccion | entity |
| jugadores | Jugador | entity |
| partidos | Partido | entity |
| entradas | Entrada | entity |
| pollas | Polla | entity |
| participantes_pollas | ParticipantePolla | entity |
| predicciones | Prediccion | entity |
| albumes | Album | entity |
| laminas | Lamina | entity |
| laminas_album | LaminaAlbum | entity |
| paquetes | Paquete | entity |
| intercambios_laminas | IntercambioLamina | entity |
| incidentes_soporte | IncidenteSoporte | entity |
| logs_transaccionales | LogsTransaccional | entity |
| notificaciones | Notificacion | entity |
| aliados_comerciales | AliadoComercial | entity |
| reportes_interaccion_api | ReporteInteraccionAPI | entity |
| reportes_compliance | ReporteCompliance | entity |

## Complexity Tracking

| Decisión | Justificación | Alternativa Simple Rechazada Porque |
|----------|---------------|-------------------------------------|
| Repository pattern con JPA | Necesitamos abstracción de BD y testing | Acceso directo JDBC insuficiente |
| DTOs separados de Entities | Transformación de datos para API | Exponer entities directo no es limpio |
| Spring Security con JWT | Autenticación moderna stateless | Basic auth menos seguro |
| MapStruct | Evitar boilerplate manual | Lombok solo no suficiente |

## Risk Assessment

| Riesgo | Mitigación |
|--------|------------|
| Mucho código repetitivo | Uso de generic services donde aplique |
| Migraciones de DB | Flyway o Liquibase para versionar schema |
| Testing de entidades | Factory builders para test data |
| Performance con 20+ entidades | N+1 queries con fetch joins |