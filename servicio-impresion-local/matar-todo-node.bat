@echo off
echo ============================================
echo  MATAR TODOS LOS PROCESOS NODE.JS
echo ============================================
echo.
echo ⚠️  ADVERTENCIA: Esto matará TODOS los procesos Node.js
echo.
set /p confirm="¿Estás seguro? (S/N): "
if /i not "%confirm%"=="S" (
    echo Operación cancelada.
    pause
    exit /b 0
)

echo.
echo [1/3] Matando procesos PM2...
where pm2 >nul 2>&1
if %errorlevel% equ 0 (
    pm2 stop all >nul 2>&1
    pm2 delete all >nul 2>&1
    echo    ✅ PM2 limpiado
) else (
    echo    ⚠️  PM2 no encontrado
)

echo.
echo [2/3] Matando todos los procesos node.exe...
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo    ✅ Todos los procesos Node.js eliminados
) else (
    echo    ⚠️  No se encontraron procesos Node.js
)

echo.
echo [3/3] Liberando puerto 3001...
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :3001') do (
    echo    Matando proceso en puerto 3001: PID %%a
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 1 /nobreak >nul
echo    ✅ Puerto 3001 liberado

echo.
echo ============================================
echo  LIMPIEZA COMPLETADA
echo ============================================
echo.
pause


