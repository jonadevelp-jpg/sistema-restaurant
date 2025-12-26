@echo off
echo ============================================
echo  PROBAR CONEXION DEL SERVICIO
echo ============================================
echo.

echo [1] Verificando que el servicio este corriendo...
powershell -Command "Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force; pm2 status"
echo.

echo [2] Obteniendo IP local...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set ip=%%a
    set ip=!ip:~1!
    echo Tu IP es: !ip!
    echo.
    echo [3] Probando conexion local...
    powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://!ip!:3001' -Method GET -TimeoutSec 5; Write-Host 'OK: Servicio respondiendo' } catch { Write-Host 'ERROR: Servicio no responde -' $_.Exception.Message }"
    echo.
    echo [4] Verificando puerto 3001...
    netstat -an | findstr ":3001"
    echo.
    goto :found_ip
)
:found_ip

echo.
echo ============================================
echo  VERIFICACION COMPLETA
echo ============================================
echo.
echo Si el servicio esta corriendo y el puerto 3001 esta escuchando,
echo entonces el problema puede estar en:
echo 1. Variables no configuradas en Vercel
echo 2. El servidor de Vercel no puede alcanzar esta IP
echo 3. Firewall bloqueando el puerto 3001
echo.
pause

