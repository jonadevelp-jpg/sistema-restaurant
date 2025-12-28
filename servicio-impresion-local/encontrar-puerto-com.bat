@echo off
chcp 65001 >nul
echo ========================================
echo   ENCONTRAR PUERTO COM DE LA IMPRESORA
echo ========================================
echo.

echo [1] Buscando impresoras instaladas...
echo.
powershell -Command "Get-Printer | Where-Object {$_.Name -like '*POS*' -or $_.Name -like '*58*' -or $_.Name -like '*Térmica*'} | Select-Object Name, PrinterStatus, DriverName | Format-Table -AutoSize"

echo.
echo [2] Buscando puertos COM disponibles...
echo.
powershell -Command "Get-WmiObject Win32_SerialPort | Select-Object DeviceID, Description, Status | Format-Table -AutoSize"

echo.
echo [3] Buscando puertos de impresora POS58...
echo.
powershell -Command "$printer = Get-Printer -Name 'POS58' -ErrorAction SilentlyContinue; if ($printer) { $port = Get-PrinterProperty -PrinterName 'POS58' -PropertyName 'PortName' -ErrorAction SilentlyContinue; if ($port) { Write-Host 'Puerto encontrado:' $port } else { Write-Host 'No se pudo obtener el puerto directamente' } } else { Write-Host 'Impresora POS58 no encontrada' }"

echo.
echo [4] Información detallada de la impresora POS58...
echo.
powershell -Command "$printer = Get-CimInstance -ClassName Win32_Printer -Filter \"Name='POS58'\" -ErrorAction SilentlyContinue; if ($printer) { Write-Host 'Nombre:' $printer.Name; Write-Host 'Puerto:' $printer.PortName; Write-Host 'Estado:' $printer.PrinterStatus; Write-Host 'Driver:' $printer.DriverName } else { Write-Host 'Impresora no encontrada' }"

echo.
echo ========================================
echo   INSTRUCCIONES MANUALES
echo ========================================
echo.
echo Si no se encuentra el puerto COM automáticamente:
echo.
echo 1. Ve a: Panel de Control ^> Dispositivos e impresoras
echo 2. Busca tu impresora "POS58"
echo 3. Clic derecho ^> Propiedades de impresora
echo 4. Ve a la pestaña "Puertos"
echo 5. Busca el puerto marcado (puede ser COM3, COM4, USB002, etc.)
echo 6. Copia ese nombre exacto
echo 7. Actualiza el archivo .env con ese puerto
echo.
echo Ejemplo:
echo   PRINTER_CASHIER_PATH=COM3
echo   PRINTER_KITCHEN_PATH=COM3
echo.
pause



