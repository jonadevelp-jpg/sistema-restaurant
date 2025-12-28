@echo off
echo ========================================
echo   CANCELAR IMPRESIONES PENDIENTES
echo ========================================
echo.

REM Obtener el nombre de la impresora desde .env si existe
set PRINTER_NAME=POS58

if exist .env (
    for /f "tokens=2 delims==" %%a in ('findstr "PRINTER_KITCHEN_NAME" .env') do set PRINTER_NAME=%%a
    for /f "tokens=2 delims==" %%a in ('findstr "PRINTER_CASHIER_NAME" .env') do set PRINTER_NAME=%%a
)

echo Impresora: %PRINTER_NAME%
echo.

REM Cancelar todos los trabajos de impresión pendientes
powershell -Command "$printer = Get-Printer -Name '%PRINTER_NAME%' -ErrorAction SilentlyContinue; if ($printer) { $jobs = Get-PrintJob -PrinterName '%PRINTER_NAME%'; if ($jobs) { $jobs | Remove-PrintJob; Write-Host \"✅ Se cancelaron $($jobs.Count) trabajo(s) de impresión\" } else { Write-Host \"ℹ️  No hay trabajos pendientes en la cola\" } } else { Write-Host \"❌ Impresora '%PRINTER_NAME%' no encontrada\" }"

echo.
pause



