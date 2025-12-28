@echo off
setlocal enabledelayedexpansion
echo ============================================
echo  ENCONTRAR PUERTO CORRECTO DE IMPRESORA
echo ============================================
echo.

echo [1] Listando impresoras instaladas en Windows...
echo.
powershell -Command "Get-Printer | Select-Object Name, PrinterStatus, PortName, DriverName | Format-Table -AutoSize"
echo.

echo [2] Listando puertos COM disponibles...
echo.
powershell -Command "Get-WmiObject Win32_SerialPort | Select-Object DeviceID, Description, Status | Format-Table -AutoSize"
echo.

echo [3] Creando script de prueba para encontrar el puerto correcto...
echo.

REM Obtener nombre de impresora
echo Ingresa el nombre EXACTO de tu impresora (o presiona Enter para usar la primera):
set /p printer_name=

if "!printer_name!"=="" (
    echo Obteniendo primera impresora...
    for /f "tokens=1" %%a in ('powershell -Command "Get-Printer | Select-Object -First 1 -ExpandProperty Name"') do set "printer_name=%%a"
    echo Usando: !printer_name!
)

echo.
echo [4] Obteniendo puerto de la impresora...
for /f "tokens=1" %%a in ('powershell -Command "Get-Printer -Name '!printer_name!' | Select-Object -ExpandProperty PortName"') do set "printer_port=%%a"

echo.
echo ============================================
echo  RESULTADO
echo ============================================
echo.
echo Nombre de impresora: !printer_name!
echo Puerto configurado: !printer_port!
echo.

REM Crear script de prueba
echo [5] Ejecutando prueba de conexion...
echo.
if not exist test-puerto.js (
    echo ERROR: Archivo test-puerto.js no encontrado
    echo El archivo debe estar en la misma carpeta que este script
    pause
    exit /b 1
)

if "!printer_port!"=="" (
    echo Ejecutando prueba sin puerto especifico (probara COM3-COM6)...
    node test-puerto.js
) else (
    echo Ejecutando prueba con puerto: !printer_port!
    node test-puerto.js "!printer_port!"
)

echo.
echo ============================================
echo  FIN DE PRUEBA
echo ============================================
echo.
pause

