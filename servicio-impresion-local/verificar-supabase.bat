@echo off
setlocal enabledelayedexpansion
echo ============================================
echo   VERIFICAR CONFIGURACION DE SUPABASE
echo ============================================
echo.

cd /d "%~dp0"

echo Verificando archivo .env...
if not exist .env (
    echo ❌ ERROR: El archivo .env NO existe
    echo.
    echo Solucion:
    echo   1. Copia env.example a .env: copy env.example .env
    echo   2. Edita .env y completa los valores de Supabase
    echo.
    pause
    exit /b 1
)

echo ✅ Archivo .env encontrado
echo.

echo Verificando variables de Supabase...
echo.

findstr /C:"SUPABASE_URL" .env >nul 2>&1
if errorlevel 1 (
    echo ❌ SUPABASE_URL no encontrado en .env
) else (
    echo ✅ SUPABASE_URL encontrado
    for /f "tokens=2 delims==" %%a in ('findstr /C:"SUPABASE_URL" .env ^| findstr /V "^#"') do (
        set "SUPABASE_URL=%%a"
        if "!SUPABASE_URL!"=="https://tu-proyecto.supabase.co" (
            echo    ⚠️  VALOR DE EJEMPLO - Debes reemplazarlo con tu URL real
        ) else (
            echo    ✅ Valor: !SUPABASE_URL:~0,40!...
        )
    )
)

findstr /C:"SUPABASE_SERVICE_ROLE_KEY" .env >nul 2>&1
if errorlevel 1 (
    echo ❌ SUPABASE_SERVICE_ROLE_KEY no encontrado en .env
) else (
    echo ✅ SUPABASE_SERVICE_ROLE_KEY encontrado
    for /f "tokens=2 delims==" %%a in ('findstr /C:"SUPABASE_SERVICE_ROLE_KEY" .env ^| findstr /V "^#"') do (
        set "KEY=%%a"
        if "!KEY!"=="tu-service-role-key-aqui" (
            echo    ⚠️  VALOR DE EJEMPLO - Debes reemplazarlo con tu clave real
        ) else (
            set "KEY_LEN=!KEY:~0,20!"
            echo    ✅ Valor configurado (primeros 20 caracteres: !KEY_LEN!...)
        )
    )
)

echo.
echo ============================================
echo   VERIFICACION COMPLETA
echo ============================================
echo.
echo Si ves valores de ejemplo, debes:
echo   1. Ir a Supabase Dashboard ^> Settings ^> API
echo   2. Copiar Project URL y service_role key
echo   3. Actualizar el archivo .env
echo   4. Reiniciar el servicio: reiniciar-servicio.bat
echo.
pause

