@echo off
echo ============================================
echo  INSTALAR PM2 EN LA PC DEL LOCAL
echo ============================================
echo.

echo [1] Verificando Node.js...
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
    npm --version
)
echo.

echo [2] Instalando PM2...
echo Esto puede tardar 1-2 minutos...
npm install -g pm2
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: No se pudo instalar PM2
    echo.
    echo Intenta:
    echo 1. Abrir cmd como Administrador
    echo 2. Ejecutar: npm install -g pm2
    echo.
    pause
    exit /b 1
)
echo.

echo [3] Verificando PM2...
pm2 --version
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: PM2 no se instalo correctamente
    echo.
    pause
    exit /b 1
) else (
    echo.
    echo ============================================
    echo  PM2 INSTALADO CORRECTAMENTE
    echo ============================================
    echo.
    echo Ahora puedes ejecutar:
    echo   instalar-automatico.bat
    echo.
    echo O manualmente:
    echo   pm2 start server.js --name impresion-restaurante
    echo   pm2 save
    echo.
)

pause







