@echo off
REM Script para iniciar todo el proyecto

echo.
echo ==========================================
echo  Mundial 2026 - Full Stack Startup
echo ==========================================
echo.

REM Configurar Maven
set MAVEN_HOME=C:\Users\juame\.maven\maven-3.9.15(1)
set PATH=%MAVEN_HOME%\bin;%PATH%

REM Dar opciones al usuario
echo Selecciona qué levantar:
echo 1) Frontend (npm run dev)
echo 2) Backend (mvn spring-boot:run)
echo 3) Ambos (en terminales separadas)
echo 4) Salir
echo.
set /p choice="Opción: "

if "%choice%"=="1" (
    echo [INFO] Iniciando frontend...
    cd frontend/FrontIng/world-cup-2026
    npm run dev
) else if "%choice%"=="2" (
    echo [INFO] Iniciando backend...
    cd backend
    mvn spring-boot:run -DskipTests
) else if "%choice%"=="3" (
    echo [INFO] Abriendo ventanas de terminal...
    start "Frontend" cmd /c "cd frontend\FrontIng\world-cup-2026 && npm run dev"
    start "Backend" cmd /c "set MAVEN_HOME=C:\Users\juame\.maven\maven-3.9.15(1) && set PATH=%MAVEN_HOME%\bin;%PATH% && cd backend && mvn spring-boot:run -DskipTests"
    echo [OK] Frontend: http://localhost:5173
    echo [OK] Backend: http://localhost:8080
) else (
    echo [INFO] Saliendo...
    exit /b 0
)

pause
