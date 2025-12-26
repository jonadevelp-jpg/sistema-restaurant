@echo off
echo ============================================
echo  INICIAR SERVICIO DE IMPRESION
echo ============================================
echo.
powershell -Command "Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force; pm2 start server.js --name impresion-restaurante"
pm2 save
echo.
echo Servicio iniciado!
echo.
pause

