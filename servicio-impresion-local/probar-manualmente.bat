@echo off
setlocal enabledelayedexpansion
echo ============================================
echo  PROBAR IMPRESION MANUALMENTE
echo ============================================
echo.

echo Este script enviara una peticion de prueba al servicio local
echo para verificar que funciona correctamente.
echo.

REM Obtener IP
set "ip="
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    if not defined ip (
        set "temp=%%a"
        set "temp=!temp:~1!"
        set "temp=!temp: =!"
        if "!temp!" neq "" (
            set "ip=!temp!"
        )
    )
)

if not defined ip (
    echo ERROR: No se pudo obtener la IP
    pause
    exit /b 1
)

echo Tu IP es: !ip!
echo.

REM Obtener token del .env
if not exist .env (
    echo ERROR: Archivo .env no existe
    pause
    exit /b 1
)

echo Leyendo archivo .env...
for /f "usebackq tokens=2 delims==" %%a in (`findstr /C:"PRINT_SERVICE_TOKEN=" .env`) do (
    set "token=%%a"
    set "token=!token: =!"
)

if not defined token (
    echo ERROR: No se encontro el token en .env
    echo.
    echo Contenido del .env:
    type .env
    pause
    exit /b 1
)

echo Token encontrado: !token:~0,20!...
echo.

echo IMPORTANTE: Verifica que este token sea EXACTAMENTE igual
echo al configurado en Vercel (sin espacios, sin saltos de linea)
echo.

REM Verificar configuracion de impresora
echo ============================================
echo  CONFIGURACION DE IMPRESORA
echo ============================================
echo.

set "printer_type="
set "printer_path="
set "printer_ip="
set "printer_port="

for /f "usebackq tokens=2 delims==" %%a in (`findstr /C:"PRINTER_KITCHEN_TYPE=" .env`) do (
    set "printer_type=%%a"
    set "printer_type=!printer_type: =!"
)

for /f "usebackq tokens=2 delims==" %%a in (`findstr /C:"PRINTER_KITCHEN_PATH=" .env`) do (
    set "printer_path=%%a"
    set "printer_path=!printer_path: =!"
)

for /f "usebackq tokens=2 delims==" %%a in (`findstr /C:"PRINTER_KITCHEN_IP=" .env`) do (
    set "printer_ip=%%a"
    set "printer_ip=!printer_ip: =!"
)

for /f "usebackq tokens=2 delims==" %%a in (`findstr /C:"PRINTER_KITCHEN_PORT=" .env`) do (
    set "printer_port=%%a"
    set "printer_port=!printer_port: =!"
)

if not defined printer_type (
    echo ADVERTENCIA: PRINTER_KITCHEN_TYPE no configurado en .env
    echo El servicio usara el valor por defecto: usb
    set "printer_type=usb"
) else (
    echo Tipo de impresora: !printer_type!
)

if "!printer_type!"=="network" (
    if not defined printer_ip (
        echo ERROR: PRINTER_KITCHEN_IP no configurado para impresora de red
        echo Agrega al .env: PRINTER_KITCHEN_IP=192.168.1.XXX
        pause
        exit /b 1
    )
    if not defined printer_port (
        echo ADVERTENCIA: PRINTER_KITCHEN_PORT no configurado, usando 9100 por defecto
        set "printer_port=9100"
    )
    echo IP de impresora: !printer_ip!
    echo Puerto de impresora: !printer_port!
) else (
    if not defined printer_path (
        echo ADVERTENCIA: PRINTER_KITCHEN_PATH no configurado en .env
        echo El servicio usara el valor por defecto: USB002
        set "printer_path=USB002"
    ) else (
        echo Path de impresora: !printer_path!
    )
)

echo.
echo ============================================
echo  ENVIANDO PETICION DE PRUEBA
echo ============================================
echo.

powershell -Command "try { $body = @{type='kitchen';orden=@{numero_orden='TEST-001';created_at=(Get-Date).ToString('o');mesas=@{numero=1}};items=@(@{cantidad=1;menu_item=@{name='Item de Prueba'};notas='';subtotal=1000})} | ConvertTo-Json -Depth 10; $headers = @{'Authorization'='Bearer !token!';'Content-Type'='application/json'}; Write-Host 'Enviando a: http://!ip!:3001'; Write-Host 'Token (primeros 20): ' + '!token:~0,20!'; $response = Invoke-WebRequest -Uri 'http://!ip!:3001' -Method POST -Headers $headers -Body $body; Write-Host 'Respuesta:'; $response.Content } catch { Write-Host 'ERROR:' $_.Exception.Message; if ($_.Exception.Response) { $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream()); $responseBody = $reader.ReadToEnd(); Write-Host 'Detalles:' $responseBody } }"

echo.
echo.
echo Si ves "Comanda impresa correctamente", el servicio funciona!
echo Si ves un error, ese es el problema.
echo.
pause

