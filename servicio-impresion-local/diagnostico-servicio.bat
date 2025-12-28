@echo off
echo ============================================
echo  DIAGNOSTICO COMPLETO DEL SERVICIO
echo ============================================
echo.

cd /d "%~dp0"

echo [1/6] Verificando si PM2 esta instalado...
where pm2 >nul 2>&1
if %errorlevel% equ 0 (
    echo    ✅ PM2 encontrado
    pm2 --version
) else (
    echo    ❌ PM2 NO encontrado
    echo    El servicio no puede correr sin PM2
    pause
    exit /b 1
)

echo.
echo [2/6] Verificando estado del servicio en PM2...
pm2 describe impresion-restaurante >nul 2>&1
if %errorlevel% equ 0 (
    echo    ✅ Servicio encontrado en PM2
    echo.
    echo    Estado del servicio:
    pm2 describe impresion-restaurante | findstr /C:"status" /C:"restarts" /C:"uptime"
) else (
    echo    ❌ Servicio NO encontrado en PM2
    echo    El servicio no esta corriendo
)

echo.
echo [3/6] Verificando procesos Node.js...
echo    Procesos Node.js activos:
tasklist /FI "IMAGENAME eq node.exe" 2>nul | findstr node.exe
if %errorlevel% neq 0 (
    echo    ⚠️  No se encontraron procesos Node.js
) else (
    echo    ✅ Procesos Node.js encontrados
)

echo.
echo [4/6] Verificando puerto 3001...
netstat -aon | findstr :3001
if %errorlevel% neq 0 (
    echo    ⚠️  Puerto 3001 NO esta en uso
    echo    El servicio HTTP no esta escuchando
) else (
    echo    ✅ Puerto 3001 esta en uso
)

echo.
echo [5/6] Verificando archivo .env...
if exist .env (
    echo    ✅ Archivo .env existe
    echo    Variables configuradas:
    findstr /V "^#" .env | findstr /V "^$" | findstr "PRINTER\|SUPABASE\|POLLING"
) else (
    echo    ❌ Archivo .env NO existe
    echo    El servicio no puede funcionar sin .env
)

echo.
echo [6/6] Mostrando ultimos logs del servicio...
echo    ============================================
echo    ULTIMOS 30 LOGS:
echo    ============================================
pm2 logs impresion-restaurante --lines 30 --nostream 2>nul
if %errorlevel% neq 0 (
    echo    ⚠️  No se pudieron obtener logs
    echo    El servicio puede no estar corriendo
)

echo.
echo ============================================
echo  DIAGNOSTICO COMPLETADO
echo ============================================
echo.
echo Si el servicio no esta corriendo:
echo   1. Ejecuta: iniciar-servicio.bat
echo   2. O: reiniciar-servicio-forzado.bat
echo.
echo Si el servicio esta corriendo pero no imprime:
echo   1. Verifica que .env tenga SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY
echo   2. Verifica que la tabla print_jobs exista en Supabase
echo   3. Ejecuta: ver-logs.bat para ver logs en tiempo real
echo.
pause


