@echo off
echo ============================================
echo  DIAGNOSTICO DEL SERVICIO DE IMPRESION
echo ============================================
echo.

echo [1] Verificando Node.js...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js no esta instalado
) else (
    echo OK: Node.js encontrado
    node --version
)
echo.

echo [2] Verificando PM2...
where pm2 >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ADVERTENCIA: PM2 no esta instalado
) else (
    echo OK: PM2 encontrado
    echo.
    echo Estado del servicio:
    pm2 status
)
echo.

echo [3] Verificando archivo .env...
if exist .env (
    echo OK: Archivo .env existe
    echo.
    echo Contenido del .env:
    type .env
) else (
    echo ERROR: Archivo .env NO existe
    echo Ejecuta: instalar-automatico.bat
)
echo.

echo [4] Verificando que el servicio este escuchando...
netstat -an | findstr ":3001" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo OK: Algo esta escuchando en el puerto 3001
    netstat -an | findstr ":3001"
) else (
    echo ADVERTENCIA: Nada esta escuchando en el puerto 3001
    echo El servicio puede no estar corriendo
)
echo.

echo [5] Verificando IP local...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set ip=%%a
    set ip=!ip:~1!
    echo Tu IP local es: !ip!
    echo.
    echo Esta IP debe estar en Vercel como:
    echo PRINT_SERVICE_URL=http://!ip!:3001
    goto :found_ip
)
:found_ip

echo.
echo ============================================
echo  RESUMEN
echo ============================================
echo.
echo Si el servicio no esta corriendo:
echo   pm2 start server.js --name impresion-restaurante
echo.
echo Si PM2 no esta instalado:
echo   npm install -g pm2
echo.
echo Para ver logs en tiempo real:
echo   pm2 logs impresion-restaurante
echo.
pause







