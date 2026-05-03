# Startup Guide — Mundial 2026

## ✅ Requisitos instalados

- ✅ Node.js 20+
- ✅ npm 10+
- ✅ Java 17
- ✅ Maven 3.9.15 (instalado en `~/.maven/`)

---

## 🚀 Opción 1: Comando npm (desde raíz)

```bash
# Frontend solamente
npm run dev

# Backend solamente  
npm run backend:dev

# Backend compilado
npm run backend:build

# Compilar backend sin ejecutar
npm run backend:compile
```

---

## 🚀 Opción 2: Scripts batch (Windows)

### Start interactivo
```bash
# Desde el raíz del proyecto
start-dev.bat
# → Menú para elegir Frontend / Backend / Ambos
```

### Start Backend directo
```bash
start-backend.bat
```

---

## 📍 URLs de desarrollo

| Servicio | URL | Puerto |
|----------|-----|--------|
| **Frontend** | http://localhost:5173 | 5173 |
| **Backend API** | http://localhost:8080 | 8080 |
| **Base de datos** | localhost:3306 | 3306 |

---

## 🗄️ Base de datos

### Opción A: Docker (si está instalado)
```bash
npm run db:start      # Levantar MySQL
npm run db:logs       # Ver logs
npm run db:stop       # Parar MySQL
```

### Opción B: MySQL instalado localmente
Asegúrate de que MySQL esté corriendo en `localhost:3306` con:
- Usuario: `mundial_user`
- Contraseña: `mundial_password`
- Base de datos: `mundial_2026_hub`

---

## 🔧 Troubleshooting

### ❌ Error "mvn: command not found"
```bash
# Verifica que Maven está en PATH
mvn -version

# Si no funciona, usa la ruta completa
C:\Users\juame\.maven\maven-3.9.15(1)\bin\mvn -version
```

### ❌ Backend no se conecta a la BD
1. Verifica que MySQL está corriendo (`npm run db:start`)
2. Revisa credenciales en `backend/src/main/resources/application.yml`
3. Revisa logs: `npm run db:logs`

### ❌ Frontend no abre en navegador
- Verifica que el puerto 5173 está libre
- Recarga el navegador manualmente: `http://localhost:5173`

---

## 📦 Estructura actualizada

```
Mundial-2026/
├── frontend/FrontIng/world-cup-2026/  # Frontend Vite + React 19
├── backend/                            # Spring Boot 3 + Java 17
├── packages/shared-types/              # Tipos compartidos
├── start-dev.bat                       # Script interactivo
├── start-backend.bat                   # Script solo backend
├── package.json                        # npm scripts
└── ...
```

---

## 📝 npm scripts disponibles

```bash
npm run dev              # Frontend dev
npm run build            # Build frontend
npm run lint             # Lint (frontend)
npm run typecheck        # TypeScript check
npm run test             # Tests (frontend)
npm run format           # Prettier (frontend)

npm run backend:build    # Backend: mvn clean package
npm run backend:dev      # Backend: mvn spring-boot:run
npm run backend:compile  # Backend: mvn compile

npm run db:start         # Docker: levantar MySQL
npm run db:stop          # Docker: parar MySQL
npm run db:logs          # Docker: ver logs
```

---

## 🎯 Próximos pasos

1. **Levanta el backend:** `npm run backend:dev` (o `start-backend.bat`)
2. **Levanta el frontend:** `npm run dev` 
3. **Abre:** http://localhost:5173
4. **Desarrolla:** Los cambios se refrescan automáticamente con HMR

---

**Última actualización:** 3 de mayo de 2026
