@echo off
chcp 65001 >nul
echo ========================================
echo   CONFIGURAR SUPABASE EN .ENV
echo ========================================
echo.

if not exist .env (
    echo ❌ No existe el archivo .env
    echo.
    echo Creando .env desde env.example...
    copy env.example .env >nul
    echo ✅ Archivo .env creado
    echo.
)

echo 📋 Verificando configuración actual...
echo.

findstr /C:"SUPABASE_URL=" .env >nul
if %errorlevel% equ 0 (
    for /f "tokens=2 delims==" %%a in ('findstr /C:"SUPABASE_URL=" .env') do set CURRENT_URL=%%a
    echo    SUPABASE_URL actual: %CURRENT_URL%
) else (
    echo    SUPABASE_URL: ❌ NO ENCONTRADO
)

findstr /C:"SUPABASE_SERVICE_ROLE_KEY=" .env >nul
if %errorlevel% equ 0 (
    for /f "tokens=2 delims==" %%a in ('findstr /C:"SUPABASE_SERVICE_ROLE_KEY=" .env') do (
        set KEY=%%a
        set KEY_SHORT=!KEY:~0,20!...
        echo    SUPABASE_SERVICE_ROLE_KEY: !KEY_SHORT!
    )
) else (
    echo    SUPABASE_SERVICE_ROLE_KEY: ❌ NO ENCONTRADO
)

echo.
echo ========================================
echo   INSTRUCCIONES
echo ========================================
echo.
echo Para obtener tu SUPABASE_URL:
echo.
echo 1. Ve a: https://app.supabase.com
echo 2. Selecciona tu proyecto
echo 3. Ve a: Settings ^> API
echo 4. Copia el valor de "Project URL"
echo    (Formato: https://xxxxx.supabase.co)
echo.
echo Para obtener tu SUPABASE_SERVICE_ROLE_KEY:
echo.
echo 1. En la misma página (Settings ^> API)
echo 2. Busca "service_role" key (NO la anon key)
echo 3. Copia el valor completo
echo    (Es un token largo que empieza con eyJ...)
echo.
echo ========================================
echo   EDITAR .ENV
echo ========================================
echo.
echo ¿Quieres abrir el archivo .env para editarlo? (S/N)
set /p OPEN_EDITOR=
if /i "%OPEN_EDITOR%"=="S" (
    echo.
    echo Abriendo .env en el editor...
    notepad .env
    echo.
    echo ✅ Archivo .env editado
    echo.
    echo Ahora ejecuta: node test-supabase-conexion.js
    echo Para verificar que la configuración es correcta.
) else (
    echo.
    echo Puedes editar .env manualmente con:
    echo   notepad .env
    echo.
)

echo.
pause



