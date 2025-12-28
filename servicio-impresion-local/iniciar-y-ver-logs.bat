@echo off
echo ============================================
echo  INICIAR SERVICIO Y VER LOGS
echo ============================================
echo.

cd /d "%~dp0"

REM Verificar si PM2 está instalado
where pm2 >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PM2 no esta instalado
    echo Ejecuta: instalar-pm2.bat
    pause
    exit /b 1
)

REM Detener servicio si existe
echo [1/3] Deteniendo servicio anterior (si existe)...
pm2 stop impresion-restaurante >nul 2>&1
pm2 delete impresion-restaurante >nul 2>&1
timeout /t 2 /nobreak >nul

REM Limpiar procesos Node.js relacionados
echo [2/3] Limpiando procesos relacionados...
setlocal enabledelayedexpansion
for /f "tokens=2" %%a in ('tasklist /FI "IMAGENAME eq node.exe" /FO LIST 2^>nul ^| findstr /C:"PID:"') do (
    set "pid=%%a"
    wmic process where "ProcessId=!pid!" get CommandLine 2>nul | findstr /i "server.js" >nul
    if !errorlevel! equ 0 (
        taskkill /F /PID !pid! >nul 2>&1
    )
)
endlocal

REM Liberar puerto 3001
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :3001') do (
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 1 /nobreak >nul

REM Iniciar servicio
echo [3/3] Iniciando servicio...
powershell -Command "Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force; pm2 start server.js --name impresion-restaurante --update-env"
if %errorlevel% neq 0 (
    echo ❌ Error al iniciar el servicio
    pause
    exit /b 1
)

pm2 save >nul 2>&1
echo.
echo ✅ Servicio iniciado
echo.
echo Esperando 3 segundos para que el servicio inicie...
timeout /t 3 /nobreak >nul

echo.
echo ============================================
echo  MOSTRANDO LOGS EN TIEMPO REAL
echo ============================================
echo Presiona Ctrl+C para salir
echo.
powershell -Command "Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force; pm2 logs impresion-restaurante"
echo.
echo Presiona cualquier tecla para salir...
pause >nul

