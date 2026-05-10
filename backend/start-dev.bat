@echo off
REM ─────────────────────────────────────────────────────────────────────────────
REM  Mundial 2026 — Backend dev launcher
REM
REM  USO:  Copia backend\.env.local.example como backend\.env.local
REM        Rellena los valores reales y ejecuta este script.
REM        NUNCA subas .env.local al repositorio.
REM ─────────────────────────────────────────────────────────────────────────────

REM -- Carga .env.local si existe (valores locales sin commitear) ----------------
if exist "%~dp0.env.local" (
    echo [INFO] Cargando variables desde .env.local...
    for /f "usebackq tokens=1,* delims==" %%A in ("%~dp0.env.local") do (
        if not "%%A"=="" if not "%%A:~0,1%"=="#" (
            set "%%A=%%B"
        )
    )
) else (
    echo [WARN] No se encontro .env.local — usando variables de entorno del sistema.
    echo [WARN] Copia backend\.env.local.example como backend\.env.local y rellena los valores.
)

REM -- Validar variables obligatorias -------------------------------------------
set MISSING=0

if "%DB_PASSWORD%"=="" (
    echo [ERROR] Variable DB_PASSWORD no definida.
    set MISSING=1
)
if "%JWT_SECRET%"=="" (
    echo [ERROR] Variable JWT_SECRET no definida.
    set MISSING=1
)
if "%STRIPE_SECRET_KEY%"=="" (
    echo [WARN]  STRIPE_SECRET_KEY no definida — pagos deshabilitados.
)
if "%MAIL_PASSWORD%"=="" (
    echo [WARN]  MAIL_PASSWORD no definida — emails deshabilitados.
)
if "%FOOTBALL_DATA_KEY%"=="" (
    echo [WARN]  FOOTBALL_DATA_KEY no definida — API de partidos usara datos mock.
)

if "%MISSING%"=="1" (
    echo.
    echo [ERROR] Faltan variables obligatorias. Revisa backend\.env.local.example
    pause
    exit /b 1
)

REM -- Arrancar Spring Boot ─────────────────────────────────────────────────────
echo.
echo [INFO] Iniciando backend en http://localhost:8082 ...
echo [INFO] Swagger UI: http://localhost:8082/swagger-ui.html
echo.

cd /d "%~dp0"
mvn spring-boot:run

pause
