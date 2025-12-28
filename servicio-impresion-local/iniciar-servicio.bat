@echo off
echo ============================================
echo  INICIAR SERVICIO DE IMPRESION
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

cd /d "%~dp0"

REM Verificar si el servicio ya está corriendo
echo Verificando si el servicio esta corriendo...
pm2 describe impresion-restaurante >nul 2>&1
if %errorlevel% equ 0 (
    echo.
    echo El servicio ya esta corriendo. Reiniciando...
    pm2 restart impresion-restaurante --update-env -f
    if %errorlevel% equ 0 (
        pm2 save
        echo.
        echo ✅ Servicio reiniciado correctamente!
        echo.
        echo Para ver el estado:
        echo   ver-estado.bat
        echo.
        echo Para ver logs:
        echo   ver-logs.bat
    ) else (
        echo.
        echo ❌ Error al reiniciar el servicio
    )
) else (
    echo Iniciando servicio...
    powershell -Command "Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force; pm2 start server.js --name impresion-restaurante --update-env"
    if %errorlevel% equ 0 (
        pm2 save
        echo.
        echo ✅ Servicio iniciado correctamente!
        echo.
        echo Para ver el estado:
        echo   ver-estado.bat
        echo.
        echo Para ver logs:
        echo   ver-logs.bat
    ) else (
        echo.
        echo ❌ Error al iniciar el servicio
        echo Verifica que:
        echo   - Node.js este instalado
        echo   - Las dependencias esten instaladas (npm install)
        echo   - El archivo .env este configurado
    )
)
echo.
pause



