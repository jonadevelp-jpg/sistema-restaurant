@echo off
echo ============================================
echo  VER LOGS DEL SERVICIO (MEJORADO)
echo ============================================
echo.

cd /d "%~dp0"

REM Verificar si PM2 está instalado
where pm2 >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PM2 no esta instalado
    echo.
    echo El servicio no puede correr sin PM2
    echo Ejecuta: instalar-pm2.bat
    pause
    exit /b 1
)

REM Verificar si el servicio existe
pm2 describe impresion-restaurante >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ El servicio NO esta corriendo en PM2
    echo.
    echo Para iniciar el servicio:
    echo   iniciar-servicio.bat
    echo   O: reiniciar-servicio-forzado.bat
    echo.
    pause
    exit /b 1
)

echo ✅ Servicio encontrado en PM2
echo.
echo Mostrando estado del servicio:
pm2 describe impresion-restaurante | findstr /C:"status" /C:"restarts" /C:"uptime" /C:"pm2 id"
echo.
echo ============================================
echo  ULTIMOS 50 LOGS (OUTPUT):
echo ============================================
pm2 logs impresion-restaurante --lines 50 --nostream --out
echo.
echo ============================================
echo  ULTIMOS 50 LOGS (ERRORES):
echo ============================================
pm2 logs impresion-restaurante --lines 50 --nostream --err
echo.
echo ============================================
echo  LOGS EN TIEMPO REAL (Ctrl+C para salir):
echo ============================================
echo.
powershell -Command "Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force; pm2 logs impresion-restaurante"
echo.
echo Presiona cualquier tecla para salir...
pause >nul

