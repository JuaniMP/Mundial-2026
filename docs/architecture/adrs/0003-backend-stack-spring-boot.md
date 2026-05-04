# ADR-0003: Backend stack — Spring Boot 3 + Java 21

**Status:** Accepted
**Date:** 2026-05-02
**Deciders:** Tech Lead, Backend Lead

## Context

Necesitamos un backend REST que sirva al SPA, ingiera el feed de FIFA, gestione predicciones y leaderboard. El equipo tiene fuerte experiencia en Spring Boot. Volumen estimado del primer año: cientos de miles de usuarios concurrentes durante partidos clave.

## Decision

- **Framework:** Spring Boot 3 (Spring 6, Jakarta EE 10)
- **Lenguaje:** Java 21 LTS (virtual threads disponibles)
- **Build:** Maven
- **Persistencia:** Spring Data JPA + Hibernate 6 contra MySQL 8
- **Migraciones:** Flyway
- **Validación:** Jakarta Bean Validation + JSON Schema (para payload del transactions)
- **Auth:** Spring Security + OAuth2 Resource Server (validación de JWT emitidos por Keycloak/Auth0)
- **API:** REST/JSON; OpenAPI 3 con springdoc
- **Mappers:** MapStruct (entidad ↔ DTO)
- **Lombok:** Permitido para POJOs/DTOs
- **Tests:** JUnit 5 + Mockito + Testcontainers (MySQL real para tests de integración)

## Options Considered

### Option A — Spring Boot 3 + Java 21 _(Decisión)_

**Pros:** Equipo experto, ecosistema maduro, virtual threads (Project Loom) → mejor throughput sin reactive complexity, soporte LTS hasta 2031.
**Cons:** Footprint de memoria mayor que Quarkus/Micronaut; startup más lento (mitigable con CDS o GraalVM Native Image si fuera crítico).

### Option B — Quarkus / Micronaut

**Pros:** Startup rápido, footprint pequeño, build nativo con GraalVM, ideal para serverless.
**Cons:** Equipo no domina; ecosistema menor que Spring; lock-in distinto.

### Option C — Node.js (NestJS)

**Pros:** Mismo lenguaje que web; un solo runtime.
**Cons:** Equipo más fuerte en Java; rendimiento de cómputo (ranking, agregados de leaderboard) es más predecible en JVM con virtual threads que en Node single-thread.

### Option D — Go (Gin / Echo)

**Pros:** Performance, footprint pequeño.
**Cons:** Equipo no domina; ecosistema de auth/JPA-equivalent menos maduro.

## Trade-off Analysis

Spring Boot es la opción de menor riesgo: el equipo lo domina, el ecosistema cubre todo lo que necesitamos (auth, JPA, Flyway, observabilidad), y Java 21 con virtual threads cierra la brecha de throughput contra Node/Go en el contexto de I/O-bound REST APIs.

Si en el futuro un servicio necesita escalar a serverless con cold starts agresivos, ese servicio puntual puede ir en Quarkus o Go — no es necesario hoy.

## Consequences

**Más fácil:**

- Velocidad de desarrollo.
- Debugging y observabilidad (Spring Actuator, Micrometer).
- Migrar y testear (Flyway + Testcontainers).
- Onboarding de devs Java.

**Más difícil:**

- Footprint de memoria → containers más grandes (~512Mi mínimo). OK para Cloud Run / EKS.
- Startup ~5-10s; mitigable con CDS / GraalVM si necesitamos serverless.

**Revisitar:**

- Si necesitamos serverless con cold start <1s, evaluar Quarkus + GraalVM Native.
- Si nos topamos con cuellos en el feed FIFA (ingesta masiva), evaluar reactive (WebFlux) en ese servicio.

## Action Items

1. [ ] Crear `apps/api` con Spring Initializr (Java 21, Spring Boot 3.3.x, JPA, Web, Security, Validation, Flyway).
2. [ ] Configurar `pom.xml` con MapStruct, Lombok, Testcontainers.
3. [ ] Configurar perfiles `dev` (H2 in-memory), `local` (Docker MySQL), `prod` (managed MySQL).
4. [ ] Wire OpenAPI con springdoc.
5. [ ] Setup Spring Security + OAuth2 Resource Server.
