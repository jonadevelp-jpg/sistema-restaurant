@echo off
echo ============================================
echo  MATAR TODOS LOS PROCESOS NODE.JS
echo ============================================
echo.

echo ADVERTENCIA: Esto matara TODOS los procesos de Node.js
echo Incluyendo el servicio de impresion si esta corriendo
echo.

set /p confirmar="¿Estas seguro? (S/N): "

if /i not "%confirmar%"=="S" (
    echo Cancelado
    pause
    exit /b
)

echo.
echo Matando todos los procesos node.exe...
taskkill /F /IM node.exe

echo.
echo Verificando...
tasklist | findstr node.exe

if errorlevel 1 (
    echo ✅ No hay procesos Node.js corriendo
) else (
    echo ⚠️  Aun hay procesos Node.js corriendo
)

echo.
echo IMPORTANTE: Si el servicio de impresion estaba corriendo,
echo necesitas reiniciarlo: reiniciar-servicio.bat
echo.
pause







