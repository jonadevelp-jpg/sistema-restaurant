@echo off
echo ============================================
echo  OBTENER IP LOCAL
echo ============================================
echo.

setlocal enabledelayedexpansion

echo Metodo 1: Buscando IP con ipconfig...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set "ip=%%a"
    set "ip=!ip:~1!"
    set "ip=!ip: =!"
    if defined ip (
        echo IP encontrada: !ip!
        echo.
        echo Configura en Vercel:
        echo   PRINT_SERVICE_URL=http://!ip!:3001
        echo.
        goto :end
    )
)

echo.
echo Metodo 2: Buscando IP alternativa...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set "ip=%%a"
    set "ip=!ip: =!"
    if defined ip (
        echo IP encontrada: !ip!
        echo.
        echo Configura en Vercel:
        echo   PRINT_SERVICE_URL=http://!ip!:3001
        echo.
        goto :end
    )
)

echo.
echo ERROR: No se pudo obtener la IP automaticamente
echo.
echo Obtener IP manualmente:
echo 1. Ejecuta: ipconfig
echo 2. Busca "Adaptador de Ethernet" o "Adaptador de LAN inalambrica"
echo 3. Busca "Direccion IPv4" o "IPv4 Address"
echo 4. Copia el numero (ej: 192.168.1.122)
echo.

:end
endlocal
pause







