@echo off
echo ============================================
echo  VER TOKEN QUE USA EL SERVICIO
echo ============================================
echo.

echo Mostrando los ultimos logs del servicio...
echo Buscando mensajes sobre el token...
echo.

pm2 logs impresion-restaurante --lines 50 --nostream | findstr /i "Token token TOKEN 🔐"

echo.
echo.
echo Si ves "cambiar-este-token" o "cambiar-es", el .env NO se esta cargando
echo Si ves tu token real, entonces el problema es otro
echo.
pause







