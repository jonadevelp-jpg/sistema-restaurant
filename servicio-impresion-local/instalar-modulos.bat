@echo off
echo ============================================
echo  INSTALAR MODULOS DE escpos
echo ============================================
echo.

echo [1] Instalando escpos-usb...
echo.
call npm install escpos-usb
if %errorlevel% neq 0 (
    echo.
    echo ADVERTENCIA: escpos-usb no se pudo instalar con version especifica
    echo Intentando sin especificar version...
    call npm install escpos-usb --save
)

echo.
echo [2] Instalando escpos-network...
echo.
call npm install escpos-network
if %errorlevel% neq 0 (
    echo.
    echo ADVERTENCIA: escpos-network no se pudo instalar
    echo Esto es normal si no existe el paquete o no es necesario
    echo.
)

echo.
echo [3] Verificando instalacion...
echo.
if exist node_modules\escpos-usb (
    echo OK: escpos-usb instalado
) else (
    echo ADVERTENCIA: escpos-usb no esta instalado
    echo Esto puede ser normal si escpos.create() funciona
)

if exist node_modules\escpos-network (
    echo OK: escpos-network instalado
) else (
    echo ADVERTENCIA: escpos-network no esta instalado
    echo Esto es normal si no usas impresoras de red
)

echo.
echo ============================================
echo  RESULTADO
echo ============================================
echo.
echo Si los modulos no se instalaron, el codigo intentara:
echo 1. Usar escpos.create() si esta disponible
echo 2. Usar USB/Network directamente desde escpos si estan disponibles
echo.
echo Ejecuta: verificar-escpos.bat para verificar
echo.
pause



