@echo off
echo ============================================
echo  INSTALAR DOTENV
echo ============================================
echo.

echo Instalando dotenv para cargar el archivo .env...
echo.

cd /d "%~dp0"
npm install dotenv

echo.
echo ✅ dotenv instalado
echo.
echo Ahora reinicia el servicio:
echo reiniciar-servicio.bat
echo.
pause







