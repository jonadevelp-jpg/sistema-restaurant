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

REM Verificar si PM2 está instalado
where pm2 >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: PM2 no esta instalado
    echo Ejecuta: instalar-pm2.bat
    pause
    exit /b 1
)

echo Verificando si el servicio esta corriendo...
powershell -Command "Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force; $status = pm2 jlist | ConvertFrom-Json; $process = $status | Where-Object { $_.name -eq 'impresion-restaurante' }; if ($process) { Write-Host 'OK: Servicio encontrado' } else { Write-Host 'NO: Servicio no encontrado' }" > temp_status.txt 2>&1
findstr /C:"OK:" temp_status.txt >nul
set "service_exists=%errorlevel%"
del temp_status.txt >nul 2>&1

if %service_exists% equ 0 (
    echo.
    echo Servicio encontrado, reiniciando...
    powershell -Command "Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force; pm2 restart impresion-restaurante --update-env"
    if %errorlevel% equ 0 (
        echo.
        echo ✅ Servicio reiniciado correctamente!
    ) else (
        echo.
        echo ❌ Error al reiniciar el servicio
    )
) else (
    echo.
    echo Servicio no encontrado, iniciando...
    cd /d "%~dp0"
    powershell -Command "Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force; pm2 start server.js --name impresion-restaurante"
    if %errorlevel% equ 0 (
        pm2 save
        echo.
        echo ✅ Servicio iniciado correctamente!
    ) else (
        echo.
        echo ❌ Error al iniciar el servicio
    )
)

echo.
echo Para ver el estado:
echo   ver-estado.bat
echo.
echo Para ver logs:
echo   ver-logs.bat
echo.
pause



