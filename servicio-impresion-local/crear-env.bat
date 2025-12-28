@echo off
echo ============================================
echo  CREAR ARCHIVO .ENV
echo ============================================
echo.

if exist .env (
    echo El archivo .env ya existe.
    echo.
    echo Deseas sobrescribirlo? (S/N)
    set /p respuesta=
    if /i not "%respuesta%"=="S" (
        echo Cancelado.
        pause
        exit /b
    )
)

echo.
echo Generando token seguro...
powershell -Command "$token = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_}); $token"

echo.
echo Creando archivo .env desde env.example...
if exist env.example (
    copy env.example .env >nul
    echo Archivo .env creado desde env.example
    echo.
    echo IMPORTANTE: Edita el archivo .env y completa:
    echo   - SUPABASE_URL
    echo   - SUPABASE_SERVICE_ROLE_KEY
    echo   - PRINTER_KITCHEN_PATH (si es diferente a USB002)
    echo   - PRINTER_CASHIER_PATH (si es diferente a USB002)
    echo.
) else (
    echo Creando archivo .env basico...
    (
        echo PRINT_SERVICE_PORT=3001
        echo PRINT_SERVICE_TOKEN=
    ) > .env
    
    REM Generar token y agregarlo
    powershell -Command "$token = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_}); (Get-Content .env) -replace 'PRINT_SERVICE_TOKEN=', \"PRINT_SERVICE_TOKEN=$token\" | Set-Content .env"
    
    (
        echo.
        echo # Supabase ^(requerido para polling^)
        echo SUPABASE_URL=https://tu-proyecto.supabase.co
        echo SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
        echo.
        echo # Polling
        echo POLLING_ENABLED=true
        echo POLLING_INTERVAL_MS=3000
        echo.
        echo # Impresoras
        echo PRINTER_KITCHEN_TYPE=usb
        echo PRINTER_KITCHEN_PATH=USB002
        echo PRINTER_CASHIER_TYPE=usb
        echo PRINTER_CASHIER_PATH=USB002
    ) >> .env
    
    echo Archivo .env creado con valores por defecto
    echo.
    echo IMPORTANTE: Edita el archivo .env y completa:
    echo   - SUPABASE_URL
    echo   - SUPABASE_SERVICE_ROLE_KEY
    echo   - PRINTER_KITCHEN_PATH ^(si es diferente a USB002^)
    echo   - PRINTER_CASHIER_PATH ^(si es diferente a USB002^)
    echo.
)

echo.
echo ============================================
echo  ARCHIVO .ENV CREADO
echo ============================================
echo.
echo Contenido del archivo:
echo.
type .env
echo.
echo IMPORTANTE: Copia el PRINT_SERVICE_TOKEN y configuralo en Vercel
echo.
pause



