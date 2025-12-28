@echo off
setlocal enabledelayedexpansion
echo ============================================
echo  INICIAR SERVICIO DE IMPRESION CON POLLING
echo ============================================
echo.

REM Verificar que estamos en la carpeta correcta
if not exist server.js (
    echo ERROR: server.js no encontrado
    echo Ejecuta este script desde la carpeta servicio-impresion-local
    pause
    exit /b 1
)

REM Verificar archivo .env
if not exist .env (
    echo ADVERTENCIA: Archivo .env no encontrado
    echo.
    echo Creando .env desde .env.example...
    if exist .env.example (
        copy .env.example .env >nul
        echo Archivo .env creado. Por favor, editalo y completa los valores.
        echo.
        notepad .env
    ) else (
        echo ERROR: .env.example no encontrado
        echo Crea un archivo .env con las variables necesarias
        pause
        exit /b 1
    )
)

REM Verificar Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado
    echo Descarga desde: https://nodejs.org
    pause
    exit /b 1
)

echo [1] Verificando dependencias...
if not exist node_modules (
    echo Instalando dependencias...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: No se pudieron instalar las dependencias
        pause
        exit /b 1
    )
)

echo.
echo [2] Verificando configuracion...
echo.

REM Verificar variables críticas
set "missing_vars="

if not defined SUPABASE_URL (
    findstr /C:"SUPABASE_URL=" .env >nul 2>&1
    if %errorlevel% neq 0 set "missing_vars=!missing_vars! SUPABASE_URL"
)

if not defined SUPABASE_SERVICE_ROLE_KEY (
    findstr /C:"SUPABASE_SERVICE_ROLE_KEY=" .env >nul 2>&1
    if %errorlevel% neq 0 set "missing_vars=!missing_vars! SUPABASE_SERVICE_ROLE_KEY"
)

if not "!missing_vars!"=="" (
    echo ADVERTENCIA: Faltan variables en .env:
    echo !missing_vars!
    echo.
    echo El polling NO funcionara sin estas variables.
    echo El servicio HTTP seguira funcionando.
    echo.
    pause
)

echo.
echo [3] Iniciando servicio...
echo.
echo El servicio iniciara con:
echo   - Servidor HTTP en puerto 3001 (compatibilidad)
echo   - Polling automatico (si esta configurado)
echo.
echo Presiona Ctrl+C para detener el servicio
echo.

REM Iniciar el servicio
node server.js

pause



