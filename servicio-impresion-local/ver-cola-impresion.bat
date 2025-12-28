@echo off
echo ========================================
echo   VER COLA DE IMPRESIÓN
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

REM Mostrar trabajos pendientes
powershell -Command "$printer = Get-Printer -Name '%PRINTER_NAME%' -ErrorAction SilentlyContinue; if ($printer) { $jobs = Get-PrintJob -PrinterName '%PRINTER_NAME%'; if ($jobs) { Write-Host \"📋 Trabajos pendientes:\"; $jobs | Format-Table -AutoSize Id, Name, Status, SubmittedTime } else { Write-Host \"ℹ️  No hay trabajos pendientes\" } } else { Write-Host \"❌ Impresora '%PRINTER_NAME%' no encontrada\" }"

echo.
pause



