# Tasks: API REST Mundial 2026 Hub

**Branch**: `002-mundial-api` | **Generated**: 2026-04-30

## Task Summary

- **Total Tasks**: 24
- **Phases**: 5 (Setup, Entities, Repositories, Services, Controllers)

---

## Phase 1: Setup (Tasks 1-4)

### [X] Task 1: Create Maven Project Structure
**ID**: T001 | **Files**: pom.xml, application.yml
- Create pom.xml with Spring Boot 3.x, JPA, Security, MySQL, Lombok, MapStruct
- Configure application.yml with DB connection and JWT settings
- Create base package structure co.edu.unbosque

### [X] Task 2: Configure Security and JWT
**ID**: T002 | **Files**: SecurityConfig.java, JwtUtil.java, JwtAuthFilter.java
- Implement JWT token generation and validation
- Configure Spring Security with JWT filter
- Set up authentication entry point

### [X] Task 3: Create Base DTOs and Exceptions
**ID**: T003 | **Files**: DTOs in dto/, Exception classes
- Create generic APIResponse wrapper
- Create custom exceptions (ResourceNotFoundException, BadRequestException)
- Create base DTOs for CRUD operations

### [X] Task 4: Create Database Schema
**ID**: T004 | **Files**: schema.sql
- Generate schema.sql from entity definitions
- Add foreign key constraints
- Add indexes for performance

---

## Phase 2: Entities (Tasks 5-8)

### [X] Task 5: Create User and Role Entities
**ID**: T005 | **Files**: Rol.java, Usuario.java
- Create Rol entity with enum for role names
- Create Usuario entity with all fields
- Add @OneToMany relationships

### [X] Task 6: Create Infrastructure Entities
**ID**: T006 | **Files**: Sede.java, Estadio.java
- Create Sede entity (ciudad, pais)
- Create Estadio entity with @ManyToOne to Sede

### [X] Task 7: Create Core Entities
**ID**: T007 | **Files**: Seleccion.java, Jugador.java, Partido.java
- Create Seleccion with FIFA code, confederacion, grupo
- Create Jugador with stats and @ManyToOne to Seleccion
- Create Partido with score tracking and relationships

### [X] Task 8: Create Transactional Entities
**ID**: T008 | **Files**: Entrada.java, Polla.java, Prediccion.java, Album.java
- Create Entrada with QR code generation
- Create Polla with access code
- Create Prediccion with points calculation
- Create Album with completion tracking

---

## Phase 3: Repositories (Tasks 9-12)

### [X] Task 9: Create User and Role Repositories
**ID**: T009 | **Files**: RolRepository.java, UsuarioRepository.java
- Create RolRepository with findByNombre
- Create UsuarioRepository with findByEmail, findByRol

### [X] Task 10: Create Infrastructure Repositories
**ID**: T010 | **Files**: SedeRepository.java, EstadioRepository.java
- Create repositories with custom queries for filtered searches

### [X] Task 11: Create Core Repositories
**ID**: T011 | **Files**: SeleccionRepository.java, JugadorRepository.java, PartidoRepository.java
- Create repositories with @Query for filtered searches
- Add pagination support

### [X] Task 12: Create Transactional Repositories
**ID**: T012 | **Files**: EntradaRepository.java, PollaRepository.java, PrediccionRepository.java, AlbumRepository.java
- Create repositories with complex queries

---

## Phase 4: Services (Tasks 13-18)

### [X] Task 13: Create Auth and User Services
**ID**: T013 | **Files**: AuthService.java, UsuarioService.java
- Implement JWT-based authentication
- Implement user CRUD operations

### [X] Task 14: Create Selection and Player Services
**ID**: T014 | **Files**: SeleccionService.java, JugadorService.java
- Implement selection listing with filters
- Implement player CRUD with statistics

### [X] Task 15: Create Match and Ticket Services
**ID**: T015 | **Files**: PartidoService.java, EntradaService.java
- Implement match scheduling and scoring
- Implement ticket purchase and validation

### [ ] Task 16: Create Poll Services
**ID**: T016 | **Files**: PollaService.java, PrediccionService.java
- Implement poll creation and joining
- Implement prediction evaluation

### [ ] Task 17: Create Album Services
**ID**: T017 | **Files**: AlbumService.java, LaminaService.java, PaqueteService.java, IntercambioService.java
- Implement album management
- Implement pack opening with random generation
- Implement exchange workflow

### [ ] Task 18: Create Support and Compliance Services
**ID**: T018 | **Files**: SoporteService.java, LogService.java, NotificacionService.java, AliadosService.java, ReporteService.java
- Implement ticket management
- Implement audit logging with SHA-256
- Implement notification dispatch
- Implement partner management
- Implement compliance reports

---

## Phase 5: Controllers (Tasks 19-24)

### [X] Task 19: Create Auth and User Controllers
**ID**: T019 | **Files**: AuthController.java, UsuarioController.java
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- GET/POST/PUT/DELETE /api/v1/usuarios

### [ ] Task 20: Create Infrastructure Controllers
**ID**: T020 | **Files**: SedeController.java, EstadioController.java
- CRUD endpoints for venues

### [X] Task 21: Create Core Controllers
**ID**: T021 | **Files**: SeleccionController.java, JugadorController.java, PartidoController.java
- CRUD endpoints for teams, players, matches

### [ ] Task 22: Create Poll Controllers
**ID**: T022 | **Files**: PollaController.java, PrediccionController.java
- CRUD for polls and predictions

### [ ] Task 23: Create Album Controllers
**ID**: T023 | **Files**: AlbumController.java, PaqueteController.java, IntercambioController.java
- Album management endpoints
- Pack opening endpoint
- Exchange request endpoints

### [ ] Task 24: Create Support Controllers
**ID**: T024 | **Files**: SoporteController.java, LogController.java, NotificacionController.java, AliadosController.java, ReporteController.java
- Ticket management endpoints
- Audit log endpoints
- Notification endpoints
- Partner management endpoints
- Compliance report endpoints

---

## Execution Order

1. **Setup first** (T001-T004): Configure project, security, base classes
2. **Entities next** (T005-T008): Define all data models
3. **Repositories** (T009-T012): Create data access layer
4. **Services** (T013-T018): Implement business logic
5. **Controllers** (T019-T024): Expose REST APIs

## Parallel Opportunities

- T005, T006 can run in parallel (both entity creation)
- T009, T010 can run in parallel (repository creation)
- T019, T020 can run in parallel (controller creation)
- T021, T022, T023 can run in parallel (after respective services)

## Notes

- All code follows Java 17 conventions
- Package structure: co.edu.unbosque.{module}
- Each entity has corresponding Repository, Service, Controller
- DTOs separate API contracts from entities
- JWT authentication on all endpoints except /auth/**