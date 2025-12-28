@echo off
echo ============================================
echo  FORZAR CARGA DE .ENV
echo ============================================
echo.

cd /d "%~dp0"

echo 1. Verificando que el .env existe...
if not exist .env (
    echo ERROR: Archivo .env no existe
    echo Ejecuta: crear-env.bat
    pause
    exit /b 1
)

echo ✅ Archivo .env existe
echo.

echo 2. Mostrando contenido del .env:
type .env
echo.

echo 3. Deteniendo el servicio...
pm2 stop impresion-restaurante
timeout /t 2 /nobreak >nul

echo 4. Eliminando el proceso...
pm2 delete impresion-restaurante
timeout /t 2 /nobreak >nul

echo 5. Verificando que estamos en el directorio correcto...
cd
echo Directorio actual: %CD%
cd /d "%~dp0"
echo Directorio del script: %CD%
echo.

echo 6. Iniciando el servicio desde este directorio...
pm2 start server.js --name impresion-restaurante
timeout /t 2 /nobreak >nul

echo 7. Guardando configuracion de PM2...
pm2 save

echo.
echo ✅ Servicio reiniciado
echo.
echo 8. Mostrando logs para verificar que cargo el token...
echo.
timeout /t 3 /nobreak >nul
pm2 logs impresion-restaurante --lines 20 --nostream

echo.
echo.
echo Si ves "Token (completo): cambiar-este-token", el .env NO se cargo
echo Si ves tu token real, entonces se cargo correctamente
echo.
pause







