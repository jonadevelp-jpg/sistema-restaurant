@echo off
setlocal enabledelayedexpansion
echo ============================================
echo  VERIFICACION COMPLETA DEL SERVICIO
echo ============================================
echo.

echo [1] Estado del servicio...
powershell -Command "Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force; pm2 status"
echo.

echo [2] Obteniendo IP local...
set "ip="
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    if not defined ip (
        set "temp=%%a"
        set "temp=!temp:~1!"
        set "temp=!temp: =!"
        if "!temp!" neq "" (
            set "ip=!temp!"
        )
    )
)

if not defined ip (
    for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
        if not defined ip (
            set "temp=%%a"
            set "temp=!temp: =!"
            if "!temp!" neq "" (
                set "ip=!temp!"
            )
        )
    )
)

if defined ip (
    echo Tu IP es: !ip!
    echo.
    echo [3] Verificando puerto 3001...
    netstat -an | findstr ":3001"
    echo.
    echo [4] Verificando archivo .env...
    if exist .env (
        echo OK: Archivo .env existe
        echo.
        echo Token configurado:
        findstr "PRINT_SERVICE_TOKEN" .env
    ) else (
        echo ERROR: Archivo .env no existe
    )
    echo.
    echo ============================================
    echo  RESUMEN
    echo ============================================
    echo.
    echo Servicio: ONLINE (si aparece en verde arriba)
    echo IP Local: !ip!
    echo Puerto: 3001 (escuchando)
    echo.
    echo IMPORTANTE: Configura en Vercel:
    echo   PRINT_SERVICE_URL=http://!ip!:3001
    echo   PRINT_SERVICE_TOKEN=(copia del token de arriba)
    echo.
    echo El error 405 es NORMAL - significa que el servidor
    echo esta respondiendo pero solo acepta POST, no GET.
    echo.
) else (
    echo ERROR: No se pudo obtener la IP
    echo Ejecuta: obtener-ip.bat
)

echo.
pause







