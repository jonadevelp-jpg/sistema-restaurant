@echo off
echo ============================================
echo  SOLUCIONADOR AUTOMATICO - SERVICIO IMPRESION
echo ============================================
echo.
echo Este script hara TODO automaticamente:
echo 1. Habilitar ejecucion de scripts en PowerShell
echo 2. Verificar PM2
echo 3. Iniciar el servicio
echo 4. Configurar auto-inicio
echo.
pause

echo.
echo [1] Habilitando ejecucion de scripts en PowerShell...
powershell -Command "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: No se pudo cambiar la politica de ejecucion
    echo Intentando como Administrador...
    powershell -Command "Start-Process powershell -Verb RunAs -ArgumentList '-Command Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine -Force'"
    timeout /t 3
) else (
    echo OK: Politica de ejecucion habilitada
)
echo.

echo [2] Verificando Node.js...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Node.js no esta instalado
    echo.
    echo Por favor:
    echo 1. Ve a https://nodejs.org/
    echo 2. Descarga la version LTS
    echo 3. Instala normalmente
    echo 4. Reinicia la PC
    echo 5. Ejecuta este script de nuevo
    echo.
    pause
    exit /b 1
) else (
    echo OK: Node.js encontrado
    node --version
)
echo.

echo [3] Verificando PM2...
where pm2 >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo PM2 no encontrado, instalando...
    call npm install -g pm2
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: No se pudo instalar PM2
        echo Intentando con politica temporal...
        powershell -Command "Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force; npm install -g pm2"
    )
) else (
    echo OK: PM2 encontrado
    pm2 --version
)
echo.

echo [4] Verificando archivo .env...
if not exist .env (
    echo Archivo .env no existe, creandolo...
    echo PORT=3001 > .env
    echo PRINT_SERVICE_TOKEN=%RANDOM%%RANDOM%%RANDOM%%RANDOM% >> .env
    echo PRINTER_KITCHEN_TYPE=usb >> .env
    echo PRINTER_KITCHEN_PATH=USB002 >> .env
    echo PRINTER_CASHIER_TYPE=usb >> .env
    echo PRINTER_CASHIER_PATH=USB002 >> .env
    echo.
    echo IMPORTANTE: Se genero un token automatico
    echo Revisa el archivo .env y copia el PRINT_SERVICE_TOKEN
    echo.
    type .env
    echo.
    pause
) else (
    echo OK: Archivo .env existe
)
echo.

echo [5] Instalando dependencias...
if not exist node_modules (
    echo Instalando dependencias (esto puede tardar 1-2 minutos)...
    call npm install
) else (
    echo OK: Dependencias ya instaladas
)
echo.

echo [6] Verificando si el servicio esta corriendo...
pm2 list | findstr "impresion-restaurante" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo El servicio ya esta corriendo
    pm2 status
) else (
    echo Iniciando el servicio...
    powershell -Command "Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force; pm2 start server.js --name impresion-restaurante"
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: No se pudo iniciar el servicio
        echo Intentando metodo alternativo...
        call pm2 start server.js --name impresion-restaurante
    )
)
echo.

echo [7] Configurando auto-inicio...
pm2 save
if %ERRORLEVEL% EQU 0 (
    echo OK: Configuracion guardada
) else (
    echo ADVERTENCIA: No se pudo guardar la configuracion
    echo Ejecuta manualmente: pm2 save
)
echo.

echo [8] Verificando IP local...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set ip=%%a
    set ip=!ip:~1!
    echo.
    echo ============================================
    echo  CONFIGURACION COMPLETA
    echo ============================================
    echo.
    echo Tu IP local es: !ip!
    echo.
    echo IMPORTANTE: Configura en Vercel:
    echo   PRINT_SERVICE_URL=http://!ip!:3001
    echo.
    echo Para obtener el token, ejecuta:
    echo   type .env
    echo.
    echo Para ver los logs:
    echo   pm2 logs impresion-restaurante
    echo.
    goto :found_ip
)
:found_ip

echo.
echo ============================================
echo  RESUMEN
echo ============================================
echo.
pm2 status
echo.
echo Si todo esta en verde (online), el servicio esta funcionando!
echo.
pause







