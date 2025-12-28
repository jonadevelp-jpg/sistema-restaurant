@echo off
setlocal enabledelayedexpansion
echo ============================================
echo  COMPARAR TOKENS
echo ============================================
echo.

echo 1. Token del archivo .env:
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

echo Token del .env: !token_env!
echo Longitud: !token_env:~0,100! | find /c /v ""
echo.

echo 2. Token que muestra el servicio (de los logs):
echo.

for /f "tokens=*" %%a in ('pm2 logs impresion-restaurante --lines 100 --nostream ^| findstr /i "Token.*completo"') do (
    set "log_line=%%a"
    echo !log_line!
)

echo.
echo 3. Comparacion:
echo.
echo Si los tokens son diferentes, el .env NO se esta cargando
echo Si son iguales pero sigue dando 401, el problema es otro
echo.
pause







