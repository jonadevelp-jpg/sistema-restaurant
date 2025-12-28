@echo off
echo ============================================
echo  VERIFICAR INSTALACION DE escpos
echo ============================================
echo.

echo [1] Verificando si escpos esta instalado...
echo.
if not exist node_modules\escpos (
    echo ERROR: escpos NO esta instalado
    echo.
    echo Instalando escpos...
    call npm install escpos
    echo.
) else (
    echo OK: escpos esta instalado
    echo.
)

echo [2] Verificando la estructura de escpos...
echo.
if not exist test-escpos.js (
    echo ERROR: Archivo test-escpos.js no encontrado
    echo El archivo debe estar en la misma carpeta que este script
    pause
    exit /b 1
)

echo Ejecutando verificacion...
echo.
node test-escpos.js

echo.
echo ============================================
echo  RESULTADO
echo ============================================
echo.
echo Si ves errores, puede ser necesario:
echo 1. Reinstalar escpos: npm uninstall escpos ^&^& npm install escpos
echo 2. Verificar la version en package.json
echo.
pause

