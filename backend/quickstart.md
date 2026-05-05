# Quickstart: API REST Mundial 2026 Hub

## Prerequisites

- JDK 17+
- Maven 3.x
- MySQL 8.0+

## Setup

1. **Clone and configure**:

   ```bash
   git clone <repo-url>
   cd mundial-2026-hub
   ```

2. **Database setup**:

   ```sql
   CREATE DATABASE mundial_2026_hub;
   # schema.sql will create all tables
   ```

3. **Configure application**:
   Edit `src/main/resources/application.yml`:

   ```yaml
   spring:
     datasource:
       url: jdbc:mysql://localhost:3306/mundial_2026_hub
       username: your_user
       password: your_password
   ```

4. **Build**:

   ```bash
   mvn clean install
   ```

5. **Run**:
   ```bash
   mvn spring-boot:run
   ```

## API Base URL

```
http://localhost:8080/api/v1
```

## Authentication

All endpoints (except /auth/\*\*) require JWT token:

```bash
# Get token
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password"}'

# Use token
curl -X GET http://localhost:8080/api/v1/usuarios \
  -H "Authorization: Bearer <token>"
```

## Core Endpoints

| Módulo         | Endpoint                 | Descripción           |
| -------------- | ------------------------ | --------------------- |
| Auth           | POST /auth/register      | Registrar usuario     |
| Auth           | POST /auth/login         | Iniciar sesión        |
| Usuarios       | GET /usuarios            | Listar usuarios       |
| Roles          | GET /roles               | Listar roles          |
| Selecciones    | GET /selecciones         | Listar selecciones    |
| Jugadores      | GET /jugadores           | Listar jugadores      |
| Partidos       | GET /partidos            | Listar partidos       |
| Entradas       | GET /entradas            | Listar entradas       |
| Pollas         | GET /pollas              | Listar pollas         |
| Album          | GET /albumes             | Ver álbum usuario     |
| Paquetes       | POST /paquetes/abrir     | Abrir paquete         |
| Intercambios   | POST /intercambios       | Solicitar intercambio |
| Soporte        | POST /soporte/incidentes | Crear ticket          |
| Notificaciones | GET /notificaciones      | Ver notificaciones    |
| Aliados        | GET /aliados             | Listar aliados        |

## Health Check

```bash
curl http://localhost:8080/actuator/health
```
