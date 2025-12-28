# Solución: Permisos de Ejecución en PowerShell

## Problema
PowerShell está bloqueando la ejecución de scripts con el error:
```
No se puede cargar el archivo ... porque la ejecución de scripts está deshabilitada en este sistema.
```

## Soluciones

### Opción 1: Usar el script .bat (Más fácil) ⭐ RECOMENDADO

Simplemente ejecuta:
```bash
run-dev.bat
```

Este archivo ya está creado en el proyecto y no requiere permisos especiales.

### Opción 2: Usar el script .ps1 con bypass

Ejecuta en PowerShell:
```powershell
powershell -ExecutionPolicy Bypass -File run-dev.ps1
```

### Opción 3: Usar CMD en lugar de PowerShell

Abre CMD (Símbolo del sistema) en lugar de PowerShell y ejecuta:
```bash
npm run dev
```

CMD no tiene restricciones de política de ejecución.

### Opción 4: Cambiar política de ejecución permanentemente

**IMPORTANTE**: Ejecuta PowerShell como Administrador

1. Cierra PowerShell actual
2. Haz clic derecho en "Windows PowerShell" → "Ejecutar como administrador"
3. Ejecuta:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
4. Confirma con `Y` cuando te lo pida
5. Cierra PowerShell de administrador
6. Abre PowerShell normal y ejecuta `npm run dev`

### Opción 5: Bypass temporal (solo para esta sesión)

En PowerShell, ejecuta:
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
npm run dev
```

Esto solo afecta la sesión actual de PowerShell.

## Recomendación

**Usa la Opción 1** (`run-dev.bat`) - Es la más simple y no requiere cambiar configuraciones del sistema.

## Verificar que funciona

Después de aplicar cualquier solución, verifica ejecutando:
```bash
npm --version
```

Si ves la versión de npm, todo está funcionando correctamente.







