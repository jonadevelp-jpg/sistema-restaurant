@echo off
echo ============================================
echo  VER LOGS DEL SERVICIO
echo ============================================
echo.

cd /d "%~dp0"

where pm2 >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ PM2 no esta instalado
    echo.
    pause
    exit /b 1
)

pm2 describe impresion-restaurante >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ El servicio NO esta corriendo
    echo.
    echo Para iniciar: iniciar-servicio.bat
    echo.
    pause
    exit /b 1
)

echo ✅ Servicio encontrado
echo.
echo Mostrando ultimos 50 logs...
echo Presiona Ctrl+C para salir
echo.
pm2 logs impresion-restaurante --lines 50


