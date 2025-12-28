@echo off
setlocal enabledelayedexpansion
echo ============================================
echo  REINICIAR/INICIAR SERVICIO DE IMPRESION
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

REM Verificar si PM2 está instalado
where pm2 >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: PM2 no esta instalado
    echo Ejecuta: instalar-pm2.bat
    pause
    exit /b 1
)

echo [1/3] Verificando si el servicio esta corriendo...
pm2 describe impresion-restaurante >nul 2>&1
set "service_exists=%errorlevel%"

if %service_exists% equ 0 (
    echo    ✅ Servicio encontrado en PM2
    echo.
    echo [2/3] Deteniendo servicio...
    pm2 stop impresion-restaurante >nul 2>&1
    timeout /t 2 /nobreak >nul
    
    REM Eliminar del PM2 para forzar reinicio limpio
    pm2 delete impresion-restaurante >nul 2>&1
    timeout /t 1 /nobreak >nul
    
    REM Matar procesos Node.js relacionados por si acaso
    echo    Limpiando procesos relacionados...
    for /f "tokens=2" %%a in ('tasklist /FI "IMAGENAME eq node.exe" /FO LIST 2^>nul ^| findstr /C:"PID:"') do (
        set "pid=%%a"
        wmic process where "ProcessId=!pid!" get CommandLine 2>nul | findstr /i "server.js" >nul
        if !errorlevel! equ 0 (
            taskkill /F /PID !pid! >nul 2>&1
        )
    )
    
    REM Liberar puerto 3001
    for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :3001') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 1 /nobreak >nul
    
    echo    ✅ Servicio detenido y limpiado
    echo.
    echo [3/3] Reiniciando servicio...
    powershell -Command "Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force; pm2 start server.js --name impresion-restaurante --update-env"
    if %errorlevel% equ 0 (
        pm2 save >nul 2>&1
        echo.
        echo ✅ Servicio reiniciado correctamente!
    ) else (
        echo.
        echo ❌ Error al reiniciar el servicio
        echo.
        echo 💡 Si el problema persiste, usa: reiniciar-servicio-forzado.bat
    )
) else (
    echo    ⚠️  Servicio no encontrado en PM2
    echo.
    echo [2/3] Limpiando procesos relacionados...
    REM Matar procesos Node.js que puedan estar ejecutando server.js
    for /f "tokens=2" %%a in ('tasklist /FI "IMAGENAME eq node.exe" /FO LIST 2^>nul ^| findstr /C:"PID:"') do (
        set "pid=%%a"
        wmic process where "ProcessId=!pid!" get CommandLine 2>nul | findstr /i "server.js" >nul
        if !errorlevel! equ 0 (
            taskkill /F /PID !pid! >nul 2>&1
        )
    )
    
    REM Liberar puerto 3001
    for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :3001') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 1 /nobreak >nul
    
    echo    ✅ Limpieza completada
    echo.
    echo [3/3] Iniciando servicio...
    powershell -Command "Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force; pm2 start server.js --name impresion-restaurante --update-env"
    if %errorlevel% equ 0 (
        pm2 save >nul 2>&1
        echo.
        echo ✅ Servicio iniciado correctamente!
    ) else (
        echo.
        echo ❌ Error al iniciar el servicio
        echo.
        echo 💡 Si el problema persiste, usa: reiniciar-servicio-forzado.bat
    )
)

echo.
echo Para ver el estado:
echo   ver-estado.bat
echo.
echo Para ver logs:
echo   ver-logs.bat
echo.
echo Si el servicio no se reinicia correctamente:
echo   reiniciar-servicio-forzado.bat
echo.
pause



