# Base de datos

El esquema de `mundial_2026_hub` lo crea y actualiza el backend al arrancar
(Hibernate `ddl-auto=update`), a partir de las entidades de
`backend/src/main/java/co/edu/unbosque/entity/`.

| Qué | Dónde |
|---|---|
| Catálogo (roles y 320 láminas) | se carga siempre al arrancar (`DataSeeder`, `DataSeederService`) |
| Datos de demostración (~80 usuarios, pollas, entradas…) | solo con `SEED_DEMO_DATA=true` (activo en el perfil `dev`) |
| Esquema SQL de referencia | `backend/src/main/resources/schema.sql` (no se ejecuta automáticamente) |
| Reparación manual de tablas | `backend/src/main/resources/pre-init.sql` — **borra datos**; solo con `SQL_INIT_MODE=always` |

## Levantar MySQL

Con Docker:

```bash
npm run db:start          # MySQL 8 en localhost:3307 (usuario mundial_user)
```

y arranca el backend con
`DB_URL=jdbc:mysql://localhost:3307/mundial_2026_hub?useSSL=false&allowPublicKeyRetrieval=true DB_USER=mundial_user DB_PASSWORD=mundial_password`.

Sin Docker basta un MySQL 8 local en el puerto 3306 con el usuario `root`
sin contraseña: es la configuración por defecto del backend.
