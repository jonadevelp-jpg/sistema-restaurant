@echo off
echo ========================================
echo   DETENER SERVIDOR DE IMPRESION
echo ========================================
echo.

REM Detener proceso de Node.js si está corriendo
echo Deteniendo procesos de Node.js relacionados...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq *servicio-impresion*" 2>nul
taskkill /F /IM node.exe /FI "COMMANDLINE eq *server.js*" 2>nul

REM También intentar detener por puerto (si está usando PM2 o similar)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do (
    echo Matando proceso en puerto 3001: %%a
    taskkill /F /PID %%a 2>nul
)

echo.
echo ✅ Servicio detenido
echo.
pause



