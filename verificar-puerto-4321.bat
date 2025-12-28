@echo off
echo ============================================
echo  VERIFICAR PUERTO 4321
echo ============================================
echo.

echo Buscando procesos que usan el puerto 4321...
echo.

netstat -ano | findstr ":4321"

echo.
echo.
echo Si ves alguna entrada, copia el PID (ultimo numero)
echo Luego ejecuta: matar-proceso-puerto-4321.bat
echo O manualmente: taskkill /PID [numero] /F
echo.
pause







