@echo off
echo ============================================
echo  VER TOKEN CONFIGURADO
echo ============================================
echo.

if not exist .env (
    echo ERROR: Archivo .env no existe
    pause
    exit /b 1
)

echo Contenido del archivo .env:
echo.
type .env
echo.
echo.
echo IMPORTANTE: Copia el valor de PRINT_SERVICE_TOKEN
echo y verifica que sea EXACTAMENTE igual en Vercel
echo.
pause







