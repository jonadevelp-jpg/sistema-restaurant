@echo off
chcp 65001 >nul
echo ========================================
echo   COPIAR CONFIGURACIÓN DE SUPABASE
echo ========================================
echo.

set ROOT_ENV=..\\.env
set LOCAL_ENV=.env

echo 📋 Buscando configuración de Supabase...
echo.

if not exist %ROOT_ENV% (
    echo ❌ No se encontró .env en la raíz del proyecto
    echo    Ruta esperada: %ROOT_ENV%
    echo.
    echo Por favor, configura manualmente:
    echo   1. Abre: notepad %LOCAL_ENV%
    echo   2. Agrega tu SUPABASE_URL
    echo   3. Guarda y ejecuta: node test-supabase-conexion.js
    echo.
    pause
    exit /b 1
)

echo ✅ Se encontró .env en la raíz del proyecto
echo.

REM Verificar si existe .env local, si no, copiar desde env.example
if not exist %LOCAL_ENV% (
    echo 📝 Creando .env local desde env.example...
    copy env.example %LOCAL_ENV% >nul
    echo ✅ Archivo .env local creado
    echo.
)

REM Leer SUPABASE_URL del .env raíz
set SUPABASE_URL=
for /f "tokens=2 delims==" %%a in ('findstr /C:"PUBLIC_SUPABASE_URL=" %ROOT_ENV% 2^>nul') do set SUPABASE_URL=%%a
for /f "tokens=2 delims==" %%a in ('findstr /C:"SUPABASE_URL=" %ROOT_ENV% 2^>nul') do if not defined SUPABASE_URL set SUPABASE_URL=%%a

REM Leer SUPABASE_SERVICE_ROLE_KEY del .env raíz
set SERVICE_KEY=
for /f "tokens=2 delims==" %%a in ('findstr /C:"SUPABASE_SERVICE_ROLE_KEY=" %ROOT_ENV% 2^>nul') do set SERVICE_KEY=%%a

if not defined SUPABASE_URL (
    echo ⚠️  No se encontró SUPABASE_URL en el .env raíz
    echo    Buscando: PUBLIC_SUPABASE_URL o SUPABASE_URL
    echo.
) else (
    echo ✅ Se encontró SUPABASE_URL en el .env raíz
    echo    URL: %SUPABASE_URL%
    echo.
)

if not defined SERVICE_KEY (
    echo ⚠️  No se encontró SUPABASE_SERVICE_ROLE_KEY en el .env raíz
    echo.
) else (
    echo ✅ Se encontró SUPABASE_SERVICE_ROLE_KEY en el .env raíz
    set KEY_SHORT=%SERVICE_KEY:~0,20%...
    echo    Key: %KEY_SHORT%
    echo.
)

if not defined SUPABASE_URL (
    echo ========================================
    echo   CONFIGURACIÓN MANUAL REQUERIDA
    echo ========================================
    echo.
    echo No se pudo copiar automáticamente la configuración.
    echo.
    echo Por favor, edita manualmente el archivo .env:
    echo   notepad %LOCAL_ENV%
    echo.
    echo Y agrega:
    echo   SUPABASE_URL=https://tu-proyecto.supabase.co
    echo   SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
    echo.
    echo Para obtener estos valores:
    echo   1. Ve a: https://app.supabase.com
    echo   2. Selecciona tu proyecto
    echo   3. Ve a: Settings ^> API
    echo   4. Copia "Project URL" y "service_role" key
    echo.
    pause
    exit /b 1
)

echo ========================================
echo   ACTUALIZANDO .ENV LOCAL
echo ========================================
echo.

REM Actualizar SUPABASE_URL en .env local
findstr /C:"SUPABASE_URL=" %LOCAL_ENV% >nul
if %errorlevel% equ 0 (
    echo 📝 Actualizando SUPABASE_URL...
    powershell -Command "(Get-Content '%LOCAL_ENV%') -replace 'SUPABASE_URL=.*', 'SUPABASE_URL=%SUPABASE_URL%' | Set-Content '%LOCAL_ENV%'"
    echo ✅ SUPABASE_URL actualizado
) else (
    echo 📝 Agregando SUPABASE_URL...
    echo SUPABASE_URL=%SUPABASE_URL%>> %LOCAL_ENV%
    echo ✅ SUPABASE_URL agregado
)

REM Actualizar SUPABASE_SERVICE_ROLE_KEY en .env local
if defined SERVICE_KEY (
    findstr /C:"SUPABASE_SERVICE_ROLE_KEY=" %LOCAL_ENV% >nul
    if %errorlevel% equ 0 (
        echo 📝 Actualizando SUPABASE_SERVICE_ROLE_KEY...
        powershell -Command "$content = Get-Content '%LOCAL_ENV%' -Raw; $content = $content -replace 'SUPABASE_SERVICE_ROLE_KEY=.*', 'SUPABASE_SERVICE_ROLE_KEY=%SERVICE_KEY%'; Set-Content '%LOCAL_ENV%' -Value $content -NoNewline"
        echo ✅ SUPABASE_SERVICE_ROLE_KEY actualizado
    ) else (
        echo 📝 Agregando SUPABASE_SERVICE_ROLE_KEY...
        echo SUPABASE_SERVICE_ROLE_KEY=%SERVICE_KEY%>> %LOCAL_ENV%
        echo ✅ SUPABASE_SERVICE_ROLE_KEY agregado
    )
) else (
    echo ⚠️  No se pudo copiar SUPABASE_SERVICE_ROLE_KEY
    echo    Deberás agregarlo manualmente
)

echo.
echo ========================================
echo   VERIFICACIÓN
echo ========================================
echo.
echo Ejecutando test de conexión...
echo.
node test-supabase-conexion.js

echo.
pause



