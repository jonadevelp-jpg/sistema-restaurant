@echo off
setlocal enabledelayedexpansion
echo ============================================
echo  REINICIAR SERVICIO DE IMPRESION (FORZADO)
echo ============================================
echo.

REM Verificar que estamos en la carpeta correcta
if not exist server.js (
    echo ERROR: server.js no encontrado
    echo Ejecuta este script desde la carpeta servicio-impresion-local
    pause
    exit /b 1
)

cd /d "%~dp0"

echo [1/5] Deteniendo servicio con PM2...
where pm2 >nul 2>&1
if %errorlevel% equ 0 (
    REM Intentar detener con PM2
    pm2 stop impresion-restaurante >nul 2>&1
    timeout /t 2 /nobreak >nul
    
    REM Eliminar del PM2
    pm2 delete impresion-restaurante >nul 2>&1
    timeout /t 1 /nobreak >nul
    
    echo    ✅ PM2: Proceso detenido
) else (
    echo    ⚠️  PM2 no encontrado, continuando...
)

echo.
echo [2/5] Matando procesos Node.js relacionados con server.js...
REM Matar todos los procesos node.exe que ejecuten server.js
for /f "tokens=2" %%a in ('tasklist /FI "IMAGENAME eq node.exe" /FO LIST ^| findstr /C:"PID:"') do (
    set "pid=%%a"
    REM Verificar si el proceso está ejecutando server.js
    wmic process where "ProcessId=!pid!" get CommandLine 2>nul | findstr /i "server.js" >nul
    if !errorlevel! equ 0 (
        echo    Matando proceso Node.js PID: !pid!
        taskkill /F /PID !pid! >nul 2>&1
    )
)
echo    ✅ Procesos Node.js relacionados eliminados

echo.
echo [3/5] Liberando puerto 3001...
REM Matar procesos que usen el puerto 3001
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :3001') do (
    set "port_pid=%%a"
    if not "!port_pid!"=="" (
        echo    Matando proceso en puerto 3001: PID !port_pid!
        taskkill /F /PID !port_pid! >nul 2>&1
    )
)
timeout /t 1 /nobreak >nul
echo    ✅ Puerto 3001 liberado

echo.
echo [4/5] Limpiando procesos Node.js huérfanos...
REM Matar todos los procesos node.exe (último recurso)
taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 /nobreak >nul
echo    ✅ Limpieza completada

echo.
echo [5/5] Iniciando servicio...
REM Verificar si PM2 está instalado
where pm2 >nul 2>&1
if %errorlevel% equ 0 (
    echo    Iniciando con PM2...
    powershell -Command "Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force; pm2 start server.js --name impresion-restaurante --update-env"
    if %errorlevel% equ 0 (
        pm2 save >nul 2>&1
        echo.
        echo ✅ Servicio iniciado correctamente con PM2!
    ) else (
        echo.
        echo ❌ Error al iniciar con PM2, intentando sin PM2...
        start /B node server.js
        timeout /t 2 /nobreak >nul
        echo ✅ Servicio iniciado sin PM2 (en segundo plano)
    )
) else (
    echo    PM2 no encontrado, iniciando directamente...
    start /B node server.js
    timeout /t 2 /nobreak >nul
    echo.
    echo ✅ Servicio iniciado directamente!
)

echo.
echo ============================================
echo  REINICIO COMPLETADO
echo ============================================
echo.
echo Para ver el estado:
echo   ver-estado.bat
echo.
echo Para ver logs:
echo   ver-logs.bat
echo.
pause


