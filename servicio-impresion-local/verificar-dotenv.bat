@echo off
echo ============================================
echo  VERIFICAR DOTENV
echo ============================================
echo.

cd /d "%~dp0"

echo Verificando si dotenv esta instalado...
echo.

if exist "node_modules\dotenv" (
    echo ✅ dotenv esta instalado
) else (
    echo ❌ dotenv NO esta instalado
    echo.
    echo Instalando dotenv...
    call npm install dotenv
    echo.
    echo ✅ dotenv instalado
)

echo.
echo Verificando que el .env existe...
if exist ".env" (
    echo ✅ Archivo .env existe
) else (
    echo ❌ Archivo .env NO existe
    echo Ejecuta: crear-env.bat
    pause
    exit /b 1
)

echo.
echo Contenido del .env (PRINT_SERVICE_TOKEN):
findstr "PRINT_SERVICE_TOKEN" .env

echo.
echo Ahora reinicia el servicio:
echo reiniciar-servicio.bat
echo.
pause







