@echo off
setlocal enabledelayedexpansion
echo ============================================
echo  DIAGNOSTICO COMPLETO DE IMPRESION
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
) else (
    echo ERROR: No se pudo obtener la IP
    pause
    exit /b 1
)
echo.

echo [3] Verificando archivo .env...
if exist .env (
    echo OK: Archivo .env existe
    echo.
    echo Token configurado:
    findstr "PRINT_SERVICE_TOKEN" .env
    echo.
    echo Configuracion de impresora:
    findstr "PRINTER_KITCHEN" .env
) else (
    echo ERROR: Archivo .env NO existe
    echo Ejecuta: crear-env.bat
    pause
    exit /b 1
)
echo.

echo [4] Verificando puerto 3001...
netstat -an | findstr ":3001"
echo.

echo [5] Verificando ultimos logs...
echo.
echo Ultimas 20 lineas de logs:
powershell -Command "Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force; pm2 logs impresion-restaurante --lines 20 --nostream"
echo.

echo ============================================
echo  RESUMEN Y VERIFICACIONES
echo ============================================
echo.
echo 1. Servicio debe estar ONLINE (ver arriba)
echo 2. IP Local: !ip!
echo 3. Puerto 3001 debe estar LISTENING
echo 4. Token debe estar configurado en .env
echo.
echo IMPORTANTE: Verifica en Vercel:
echo   PRINT_SERVICE_URL=http://!ip!:3001
echo   PRINT_SERVICE_TOKEN=(debe ser igual al de .env)
echo.
echo Para ver logs en tiempo real:
echo   ver-logs.bat
echo.
pause







