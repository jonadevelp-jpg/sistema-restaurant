@echo off
echo ============================================
echo  VERIFICAR POR QUE NO IMPRIME
echo ============================================
echo.

echo [1] Estado del servicio...
powershell -Command "Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force; pm2 status"
echo.

echo [2] Verificando archivo .env...
if exist .env (
    echo OK: Archivo .env existe
    echo.
    echo Configuracion de impresora:
    findstr "PRINTER_KITCHEN" .env
    echo.
) else (
    echo ERROR: Archivo .env NO existe
    echo Ejecuta: crear-env.bat
    pause
    exit /b 1
)
echo.

echo [3] Verificando que la impresora este conectada...
echo.
echo IMPORTANTE: Verifica manualmente:
echo 1. La impresora debe estar ENCENDIDA
echo 2. La impresora debe estar CONECTADA por USB
echo 3. El puerto debe ser correcto (ej: USB002)
echo.
echo Para verificar el puerto:
echo 1. Ve a Panel de Control ^> Dispositivos e impresoras
echo 2. Clic derecho en tu impresora ^> Propiedades de impresora
echo 3. Ve a la pestana "Puertos"
echo 4. Busca el puerto USB (ej: USB002, USB003, etc.)
echo.

echo [4] Verificando ultimos logs del servicio...
echo.
echo Ultimas 30 lineas de logs (busca errores):
echo.
powershell -Command "Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force; pm2 logs impresion-restaurante --lines 30 --nostream"
echo.

echo ============================================
echo  DIAGNOSTICO
echo ============================================
echo.
echo Si ves errores arriba, esos son los problemas.
echo.
echo Errores comunes:
echo - "Error conectando a impresora" = Puerto incorrecto o impresora desconectada
echo - "Device not found" = Puerto incorrecto
echo - "Permission denied" = Permisos de Windows
echo.
echo Para ver logs en tiempo real:
echo   ver-logs.bat
echo.
pause







