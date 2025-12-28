# Script para verificar el puerto correcto de la impresora
# Ejecutar en PowerShell: .\verificar-puerto-impresora.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VERIFICACION DE PUERTO DE IMPRESORA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Buscar impresoras con LPT
Write-Host "IMPRESORAS CON PUERTO LPT:" -ForegroundColor Yellow
Write-Host ""
$lptPrinters = Get-Printer | Where-Object { $_.PortName -like "*LPT*" }
if ($lptPrinters) {
    $lptPrinters | Select-Object Name, PortName, DriverName | Format-Table -AutoSize
} else {
    Write-Host "No se encontraron impresoras con puerto LPT" -ForegroundColor Gray
}

Write-Host ""
Write-Host "DISPOSITIVOS USB CONECTADOS:" -ForegroundColor Yellow
Write-Host ""
$usbDevices = Get-WmiObject Win32_USBControllerDevice | ForEach-Object { 
    try {
        [wmi]$_.Dependent 
    } catch {
        $null
    }
} | Where-Object { 
    $_.Description -like "*printer*" -or 
    $_.Description -like "*thermal*" -or 
    $_.Description -like "*print*" -or
    $_.Description -like "*escpos*" -or
    $_.Description -like "*epson*" -or
    $_.Description -like "*star*" -or
    $_.Description -like "*zebra*" -or
    $_.Description -like "*bixolon*"
} | Select-Object Description, DeviceID, PNPDeviceID

if ($usbDevices) {
    $usbDevices | Format-Table -AutoSize
} else {
    Write-Host "No se encontraron dispositivos USB de impresora" -ForegroundColor Gray
}

Write-Host ""
Write-Host "PUERTOS COM DISPONIBLES:" -ForegroundColor Yellow
Write-Host ""
Get-WmiObject Win32_SerialPort | Select-Object DeviceID, Description, Name | Format-Table -AutoSize

Write-Host ""
Write-Host "PUERTOS PARALELOS (LPT):" -ForegroundColor Yellow
Write-Host ""
Get-WmiObject Win32_ParallelPort | Select-Object DeviceID, Description, Status | Format-Table -AutoSize

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CONFIGURACION RECOMENDADA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Si tiene LPT1, puede ser que necesite usar el driver USB
if ($lptPrinters) {
    Write-Host "ATENCION: Tu impresora esta configurada con puerto LPT1" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "LPT1 es un puerto PARALELO (antiguo), no USB." -ForegroundColor White
    Write-Host ""
    Write-Host "Opciones:" -ForegroundColor Green
    Write-Host ""
    Write-Host "1. Si realmente es USB:" -ForegroundColor Cyan
    Write-Host "   - Desinstala la impresora actual" -ForegroundColor White
    Write-Host "   - Vuelve a instalar con el driver USB correcto" -ForegroundColor White
    Write-Host "   - Deberia aparecer como COM3, COM4, etc." -ForegroundColor White
    Write-Host ""
    Write-Host "2. Si es realmente puerto paralelo (LPT1):" -ForegroundColor Cyan
    Write-Host "   - El sistema actual NO soporta puertos paralelos directamente" -ForegroundColor White
    Write-Host "   - Necesitas un adaptador USB-to-Parallel o configurar como red" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Para usar LPT1 (si realmente es paralelo):" -ForegroundColor Cyan
    Write-Host "   PRINTER_KITCHEN_TYPE=usb" -ForegroundColor White
    Write-Host "   PRINTER_KITCHEN_PATH=LPT1" -ForegroundColor White
    Write-Host ""
    Write-Host "   NOTA: Esto puede no funcionar. Mejor reconectar como USB." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PASOS PARA RECONFIGURAR COMO USB" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Desconecta la impresora USB" -ForegroundColor White
Write-Host "2. Ve a Panel de Control > Dispositivos e impresoras" -ForegroundColor White
Write-Host "3. Elimina la impresora actual (clic derecho > Eliminar dispositivo)" -ForegroundColor White
Write-Host "4. Conecta la impresora USB de nuevo" -ForegroundColor White
Write-Host "5. Windows deberia detectarla automaticamente" -ForegroundColor White
Write-Host "6. Si no, instala el driver desde el CD o sitio web del fabricante" -ForegroundColor White
Write-Host "7. Verifica que aparezca como COM3, COM4, etc. (no LPT1)" -ForegroundColor White
Write-Host ""
Write-Host "Luego ejecuta este script de nuevo para ver el puerto correcto." -ForegroundColor Cyan
Write-Host ""







