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

echo Enviando peticion de prueba...
echo.

powershell -Command "try { $body = @{type='kitchen';orden=@{numero_orden='TEST-001';created_at=(Get-Date).ToString('o');mesas=@{numero=1}};items=@(@{cantidad=1;menu_item=@{name='Item de Prueba'};notas='';subtotal=1000})} | ConvertTo-Json -Depth 10; $headers = @{'Authorization'='Bearer !token!';'Content-Type'='application/json'}; Write-Host 'Enviando a: http://!ip!:3001'; Write-Host 'Token (primeros 20): ' + '!token:~0,20!'; $response = Invoke-WebRequest -Uri 'http://!ip!:3001' -Method POST -Headers $headers -Body $body; Write-Host 'Respuesta:'; $response.Content } catch { Write-Host 'ERROR:' $_.Exception.Message; if ($_.Exception.Response) { $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream()); $responseBody = $reader.ReadToEnd(); Write-Host 'Detalles:' $responseBody } }"

echo.
echo.
echo Si ves "Comanda impresa correctamente", el servicio funciona!
echo Si ves un error, ese es el problema.
echo.
pause

