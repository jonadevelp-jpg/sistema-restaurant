@echo off
echo ============================================
echo  MATAR PROCESO EN PUERTO 4321
echo ============================================
echo.

echo Buscando proceso en puerto 4321...
echo.

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":4321" ^| findstr "LISTENING"') do (
    set "pid=%%a"
    echo PID encontrado: %%a
    echo Matando proceso...
    taskkill /PID %%a /F
    echo.
)

if not defined pid (
    echo No se encontro ningun proceso usando el puerto 4321
)

echo.
echo Verificando que el puerto esta libre...
netstat -ano | findstr ":4321"

if errorlevel 1 (
    echo.
    echo ✅ Puerto 4321 ahora esta libre
) else (
    echo.
    echo ⚠️  Aun hay procesos usando el puerto 4321
)

echo.
pause







