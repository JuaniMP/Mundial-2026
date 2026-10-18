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

| Servicio          | URL                   | Puerto |
| ----------------- | --------------------- | ------ |
| **Frontend**      | http://localhost:5173 | 5173   |
| **Backend API**   | http://localhost:8080 | 8080   |
| **Base de datos** | localhost:3306        | 3306   |

---

## 🗄️ Base de datos

Por defecto el backend usa un MySQL local (`localhost:3306`, usuario `root` sin contraseña) y crea la base `mundial_2026_hub` y sus tablas al arrancar.
Para otro servidor define `DB_URL`, `DB_USER` y `DB_PASSWORD` (ver `backend/.env.local.example` y `basededatos/README.md`).

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

1. Verifica que MySQL esté encendido y accesible en la URL de `DB_URL` (por defecto `localhost:3306`)
2. Revisa `DB_USER` y `DB_PASSWORD` en tus variables de entorno
3. Revisa los logs del backend en la terminal donde lo arrancaste

### ❌ Frontend no abre en navegador

- Verifica que el puerto 5173 está libre
- Recarga el navegador manualmente: `http://localhost:5173`

---

## 📦 Estructura actualizada

```
Mundial-2026/
├── frontend/world-cup-2026/            # Frontend Vite + React 19
├── backend/                            # Spring Boot 3 + Java 17
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
```

---

## 🎯 Próximos pasos

1. **Levanta el backend:** `npm run backend:dev` (o `start-backend.bat`)
2. **Levanta el frontend:** `npm run dev`
3. **Abre:** http://localhost:5173
4. **Desarrolla:** Los cambios se refrescan automáticamente con HMR

---

**Última actualización:** 3 de mayo de 2026
