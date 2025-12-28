@echo off
REM Abrir PowerShell en el directorio actual
cd /d "%~dp0"
powershell -NoExit -Command "cd '%~dp0'; Write-Host '========================================'; Write-Host '  POWERSHELL - SERVICIO DE IMPRESION'; Write-Host '========================================'; Write-Host ''; Write-Host 'Comandos utiles:'; Write-Host '  pm2 status                    - Ver estado'; Write-Host '  pm2 logs impresion-restaurante - Ver logs'; Write-Host '  pm2 restart impresion-restaurante - Reiniciar'; Write-Host '  pm2 stop impresion-restaurante - Detener'; Write-Host ''; Write-Host 'Directorio actual:'; Write-Host (Get-Location).Path; Write-Host ''"


