@echo off
REM ============================================
REM Script para Cambiar Configuracion de Impresora
REM ============================================
REM Usa este script cuando cambies de impresora
REM o necesites actualizar la configuracion
REM ============================================

echo.
echo ============================================
echo  CONFIGURAR IMPRESORA
echo ============================================
echo.

if not exist .env (
    echo ERROR: No existe el archivo .env
    echo Por favor ejecuta primero: instalar-automatico.bat
    pause
    exit /b 1
)

echo Abriendo archivo .env para editar...
echo.
echo INSTRUCCIONES:
echo 1. Busca la linea PRINTER_KITCHEN_PATH
echo 2. Cambia USB002 por el puerto de tu impresora
echo 3. Guarda el archivo (Ctrl+S)
echo 4. Cierra el Bloc de Notas
echo.
pause

notepad .env

echo.
echo ============================================
echo  REINICIANDO SERVICIO
echo ============================================
echo.

REM Verificar si PM2 esta instalado
where pm2 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Reiniciando servicio con PM2...
    call pm2 restart impresion-restaurante
    echo.
    echo Servicio reiniciado correctamente
    echo.
    echo Para ver el estado: pm2 status
    echo Para ver logs: pm2 logs impresion-restaurante
) else (
    echo.
    echo ADVERTENCIA: PM2 no esta instalado
    echo.
    echo Para aplicar los cambios:
    echo 1. Deten el servicio actual (Ctrl+C si esta corriendo)
    echo 2. Ejecuta: npm start
    echo.
    echo O instala PM2:
    echo   npm install -g pm2
    echo   pm2 start server.js --name impresion-restaurante
    echo   pm2 save
)

echo.
echo ============================================
echo  CONFIGURACION ACTUALIZADA
echo ============================================
echo.
echo Si cambiaste la IP de la PC, tambien debes
echo actualizar PRINT_SERVICE_URL en Vercel.
echo.
pause







