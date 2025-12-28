@echo off
setlocal enabledelayedexpansion
echo ============================================
echo  VERIFICAR PRINT_JOBS EN SUPABASE
echo ============================================
echo.

cd /d "%~dp0"

REM Verificar archivo .env
if not exist .env (
    echo ❌ Archivo .env no encontrado
    echo.
    echo Crea el archivo .env con:
    echo   SUPABASE_URL=tu-url
    echo   SUPABASE_SERVICE_ROLE_KEY=tu-key
    echo.
    pause
    exit /b 1
)

echo ✅ Archivo .env encontrado
echo.

REM Cargar variables de entorno
for /f "tokens=*" %%i in (.env) do (
    set "line=%%i"
    if not "!line:~0,1!"=="#" (
        if not "!line!"=="" (
            for /f "tokens=1* delims==" %%a in ("!line!") do (
                set "%%a=%%b"
            )
        )
    )
)

if not defined SUPABASE_URL (
    echo ❌ SUPABASE_URL no configurado en .env
    pause
    exit /b 1
)

if not defined SUPABASE_SERVICE_ROLE_KEY (
    echo ❌ SUPABASE_SERVICE_ROLE_KEY no configurado en .env
    pause
    exit /b 1
)

echo ✅ Variables de entorno cargadas
echo.
echo Creando script de verificacion...
echo.

REM Crear script Node.js temporal
echo const { createClient } = require('@supabase/supabase-js'); > temp-check-jobs.js
echo const fs = require('fs'); >> temp-check-jobs.js
echo const path = require('path'); >> temp-check-jobs.js
echo. >> temp-check-jobs.js
echo // Cargar .env >> temp-check-jobs.js
echo const envPath = path.join(__dirname, '.env'); >> temp-check-jobs.js
echo const envContent = fs.readFileSync(envPath, 'utf8'); >> temp-check-jobs.js
echo envContent.split(/\r?\n/).forEach(line =^>^ { >> temp-check-jobs.js
echo   const trimmed = line.trim(); >> temp-check-jobs.js
echo   if (trimmed ^&^& !trimmed.startsWith('#'^) ^&^& trimmed.includes('='^)^) { >> temp-check-jobs.js
echo     const [key, ...valueParts] = trimmed.split('='); >> temp-check-jobs.js
echo     const value = valueParts.join('=').replace(/^["']|["']$/g, ''); >> temp-check-jobs.js
echo     if (key ^&^& value^) process.env[key.trim(^)] = value.trim(^); >> temp-check-jobs.js
echo   } >> temp-check-jobs.js
echo }^); >> temp-check-jobs.js
echo. >> temp-check-jobs.js
echo const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY); >> temp-check-jobs.js
echo. >> temp-check-jobs.js
echo async function checkPrintJobs(^) { >> temp-check-jobs.js
echo   console.log('🔍 Consultando print_jobs pendientes...'); >> temp-check-jobs.js
echo   const { data, error } = await supabase >> temp-check-jobs.js
echo     .from('print_jobs'^) >> temp-check-jobs.js
echo     .select('*'^) >> temp-check-jobs.js
echo     .eq('status', 'pending'^) >> temp-check-jobs.js
echo     .order('created_at', { ascending: true }^) >> temp-check-jobs.js
echo     .limit(10); >> temp-check-jobs.js
echo. >> temp-check-jobs.js
echo   if (error^) { >> temp-check-jobs.js
echo     console.error('❌ Error:', error.message^); >> temp-check-jobs.js
echo     return; >> temp-check-jobs.js
echo   } >> temp-check-jobs.js
echo. >> temp-check-jobs.js
echo   if (!data || data.length === 0^) { >> temp-check-jobs.js
echo     console.log('✅ No hay print_jobs pendientes'); >> temp-check-jobs.js
echo   } else { >> temp-check-jobs.js
echo     console.log(`📋 Encontrados ${data.length} print_job(s) pendiente(s):`); >> temp-check-jobs.js
echo     data.forEach((job, idx^) =^>^ { >> temp-check-jobs.js
echo       console.log(`\n  ${idx + 1}. ID: ${job.id}`); >> temp-check-jobs.js
echo       console.log(`     Tipo: ${job.type}`); >> temp-check-jobs.js
echo       console.log(`     Impresora: ${job.printer_target}`); >> temp-check-jobs.js
echo       console.log(`     Creado: ${new Date(job.created_at^).toLocaleString('es-CL'^)}`); >> temp-check-jobs.js
echo       console.log(`     Intentos: ${job.attempts || 0}`); >> temp-check-jobs.js
echo     }^); >> temp-check-jobs.js
echo   } >> temp-check-jobs.js
echo } >> temp-check-jobs.js
echo. >> temp-check-jobs.js
echo checkPrintJobs(^).catch(err =^>^ { >> temp-check-jobs.js
echo   console.error('❌ Error:', err.message^); >> temp-check-jobs.js
echo   process.exit(1^); >> temp-check-jobs.js
echo }^); >> temp-check-jobs.js

echo Ejecutando verificacion...
node temp-check-jobs.js
set "check_result=%errorlevel%"

REM Limpiar
del temp-check-jobs.js >nul 2>&1

if %check_result% neq 0 (
    echo.
    echo ❌ Error al verificar print_jobs
    echo Verifica:
    echo   1. Que la tabla print_jobs exista en Supabase
    echo   2. Que SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY sean correctos
    echo   3. Que el servicio de impresion este corriendo
    pause
    exit /b 1
)

echo.
echo ============================================
echo  VERIFICACION COMPLETADA
echo ============================================
echo.
pause

