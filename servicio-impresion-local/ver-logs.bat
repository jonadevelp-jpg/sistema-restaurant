@echo off
echo ============================================
echo  VER LOGS DEL SERVICIO
echo ============================================
echo.
echo Presiona Ctrl+C para salir
echo.
powershell -Command "Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force; pm2 logs impresion-restaurante"







