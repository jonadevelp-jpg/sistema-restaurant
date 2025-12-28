@echo off
chcp 65001 >nul
echo ========================================
echo   INICIAR SERVIDOR DE IMPRESION
echo ========================================
echo.

cd /d "%~dp0"

REM Verificar que Node.js esté instalado
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Node.js no esta instalado
    echo    Descarga e instala Node.js desde: https://nodejs.org
    pause
    exit /b 1
)

REM Verificar que el archivo .env exista
if not exist .env (
    echo ❌ ERROR: Archivo .env no encontrado
    echo    Copia env.example a .env y configura los valores
    echo    Ejecuta: copy env.example .env
    pause
    exit /b 1
)

REM Verificar que node_modules exista
if not exist node_modules (
    echo ⚠️  node_modules no encontrado. Instalando dependencias...
    call npm install --legacy-peer-deps
    if %errorlevel% neq 0 (
        echo ❌ Error instalando dependencias
        pause
        exit /b 1
    )
)

echo ✅ Iniciando servidor de impresión...
echo.
echo El servicio se ejecutará en segundo plano.
echo Para detenerlo, presiona Ctrl+C
echo.

REM Iniciar el servidor
node server.js

pause

