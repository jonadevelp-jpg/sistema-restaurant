@echo off
setlocal enabledelayedexpansion
echo ============================================
echo  DEBUG: VERIFICAR TOKEN
echo ============================================
echo.

echo 1. Leyendo token del archivo .env...
echo.

if not exist .env (
    echo ERROR: Archivo .env no existe
    pause
    exit /b 1
)

for /f "usebackq tokens=2 delims==" %%a in (`findstr /C:"PRINT_SERVICE_TOKEN=" .env`) do (
    set "token_env=%%a"
    set "token_env=!token_env: =!"
)

if not defined token_env (
    echo ERROR: No se encontro PRINT_SERVICE_TOKEN en .env
    pause
    exit /b 1
)

echo Token del .env (primeros 30 chars): !token_env:~0,30!...
echo Token del .env (longitud): !token_env:~0,100! | find /c /v ""
echo.

echo 2. Verificando que el servicio este corriendo...
echo.

pm2 list | findstr "impresion-restaurante"

if errorlevel 1 (
    echo ERROR: El servicio NO esta corriendo
    echo Ejecuta: iniciar-servicio.bat
    pause
    exit /b 1
)

echo.
echo 3. Mostrando ultimos logs del servicio...
echo.
echo Buscando mensajes sobre el token...
echo.

pm2 logs impresion-restaurante --lines 20 --nostream | findstr /i "token Token TOKEN"

echo.
echo 4. Si no ves el token en los logs, el servicio no lo esta cargando
echo.
echo 5. Prueba manual:
echo    - Token del .env: !token_env:~0,20!...
echo    - Verifica que este token sea igual al de Vercel
echo.
pause







