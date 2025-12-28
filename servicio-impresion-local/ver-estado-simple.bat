@echo off
echo ============================================
echo  ESTADO DEL SERVICIO
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

echo Estado de PM2:
pm2 status
echo.
echo.
echo Presiona cualquier tecla para salir...
pause >nul


