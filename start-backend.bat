@echo off
REM Script para iniciar el backend con Maven

set MAVEN_HOME=C:\Users\juame\.maven\maven-3.9.15(1)
set PATH=%MAVEN_HOME%\bin;%PATH%

echo [INFO] Iniciando backend con Maven...
cd backend
mvn spring-boot:run -DskipTests

pause
