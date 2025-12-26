@echo off
echo ============================================
echo  REINICIAR SERVICIO DE IMPRESION
echo ============================================
echo.

echo Reiniciando servicio...
powershell -Command "Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force; pm2 restart impresion-restaurante"

echo.
echo Servicio reiniciado!
echo.
echo Para ver logs:
echo   ver-logs.bat
echo.
pause

