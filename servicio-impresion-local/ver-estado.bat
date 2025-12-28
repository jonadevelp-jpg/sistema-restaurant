@echo off
echo ============================================
echo  ESTADO DEL SERVICIO
echo ============================================
echo.
powershell -Command "Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force; pm2 status"
echo.
echo.
echo Para ver logs: ver-logs.bat
echo Para iniciar: iniciar-servicio.bat
echo.
pause







