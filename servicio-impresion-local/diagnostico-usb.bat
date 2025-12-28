@echo off
echo ============================================
echo  DIAGNOSTICO DE IMPRESORA USB
echo ============================================
echo.

echo [1] Verificando configuracion en .env...
if not exist .env (
    echo ERROR: Archivo .env no existe
    pause
    exit /b 1
)

echo.
echo Configuracion de impresora USB:
findstr "PRINTER_KITCHEN" .env
echo.

echo [2] Verificando que la impresora este instalada en Windows...
echo.
echo Listando impresoras instaladas:
powershell -Command "Get-Printer | Select-Object Name, PrinterStatus, DriverName | Format-Table -AutoSize"
echo.

echo [3] Verificando puertos USB disponibles...
echo.
echo Puertos USB/COM disponibles:
powershell -Command "Get-WmiObject Win32_SerialPort | Select-Object DeviceID, Description, Status | Format-Table -AutoSize"
echo.

echo [4] Verificando puertos de impresora...
echo.
echo IMPORTANTE: Para ver el puerto correcto de tu impresora:
echo 1. Ve a Panel de Control ^> Dispositivos e impresoras
echo 2. Clic derecho en tu impresora ^> Propiedades de impresora
echo 3. Ve a la pestana "Puertos"
echo 4. Busca el puerto marcado (ej: USB002, USB003, COM3, etc.)
echo.

echo [5] Verificando si el servicio puede acceder a la impresora...
echo.
echo Si el puerto es USB002, USB003, etc., puede que necesites:
echo - Usar el nombre de la impresora en lugar del puerto
echo - O verificar permisos de Windows
echo.

echo [6] Creando script de prueba de conexion...
echo.
echo Creando test-usb.js...
(
echo const { USB, Printer } = require^('escpos'^);
echo console.log^('Probando conexion USB...'^);
echo const path = process.argv[2] || 'USB002';
echo console.log^('Path:', path^);
echo try {
echo   const device = new USB^(path^);
echo   console.log^('Dispositivo USB creado exitosamente'^);
echo   const printer = new Printer^(device^);
echo   console.log^('Printer creado exitosamente'^);
echo   console.log^('SUCCESS: La conexion funciona!'^);
echo } catch ^(error^) {
echo   console.error^('ERROR:', error.message^);
echo   console.error^('Stack:', error.stack^);
echo   process.exit^(1^);
echo }
) > test-usb.js

echo Script creado. Ejecutando prueba...
echo.

set "printer_path="
for /f "usebackq tokens=2 delims==" %%a in (`findstr /C:"PRINTER_KITCHEN_PATH=" .env`) do (
    set "printer_path=%%a"
    set "printer_path=!printer_path: =!"
)

if defined printer_path (
    echo Probando con path: !printer_path!
    node test-usb.js !printer_path!
) else (
    echo ADVERTENCIA: PRINTER_KITCHEN_PATH no configurado
    echo Probando con USB002 por defecto...
    node test-usb.js USB002
)

echo.
echo ============================================
echo  RESULTADO
echo ============================================
echo.
echo Si ves "SUCCESS", la conexion funciona.
echo Si ves "ERROR", el problema es el path o permisos.
echo.
del test-usb.js
pause



