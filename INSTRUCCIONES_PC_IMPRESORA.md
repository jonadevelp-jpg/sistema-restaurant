# 🖨️ Instrucciones para la PC donde está la Impresora

## ⚠️ IMPORTANTE

El servicio de impresión local **DEBE correr en la PC donde está físicamente conectada la impresora USB**.

Si estás viendo los logs desde otra PC, necesitas trabajar en la PC donde está la impresora.

---

## 📍 Identificar la PC Correcta

Según los logs, la PC donde está la impresora es:
- **Usuario:** `TxPOS`
- **Ruta:** `C:\Users\TxPOS\sistema-restaurant\servicio-impresion-local\`

---

## ✅ Pasos a Seguir en la PC de la Impresora

### Paso 1: Abrir la Carpeta del Servicio

1. Ve a la PC donde está la impresora (la PC de `TxPOS`)
2. Abre la carpeta: `C:\Users\TxPOS\sistema-restaurant\servicio-impresion-local\`
3. Abre PowerShell o CMD en esa carpeta

---

### Paso 2: Verificar el Archivo .env

1. Verifica que existe el archivo `.env` en esa carpeta
2. Abre el `.env` con Bloc de Notas
3. Verifica que tenga estas líneas:

```env
PRINT_SERVICE_TOKEN=tu-token-aqui
PRINTER_KITCHEN_TYPE=usb
PRINTER_KITCHEN_PATH=USB002
```

**O si el puerto es COM3, COM4, etc.:**
```env
PRINTER_KITCHEN_TYPE=usb
PRINTER_KITCHEN_PATH=COM3
```

---

### Paso 3: Encontrar el Puerto Correcto

En la PC donde está la impresora:

1. Ve a **Panel de Control** → **Dispositivos e impresoras**
2. **Clic derecho** en tu impresora → **Propiedades de impresora**
3. Ve a la pestaña **"Puertos"**
4. Busca el puerto marcado (ej: USB002, USB003, COM3, COM4, etc.)
5. Anota el puerto exacto

**O usa PowerShell:**
```powershell
Get-WmiObject Win32_SerialPort | Select-Object DeviceID, Description
```

---

### Paso 4: Actualizar el .env

1. Abre el `.env` en la PC de la impresora
2. Actualiza `PRINTER_KITCHEN_PATH` con el puerto correcto:

```env
PRINTER_KITCHEN_PATH=COM3
```

(Reemplaza COM3 con el puerto que encontraste)

---

### Paso 5: Reiniciar el Servicio

En la PC de la impresora, ejecuta:

```cmd
cd C:\Users\TxPOS\sistema-restaurant\servicio-impresion-local
reiniciar-servicio.bat
```

O manualmente:
```cmd
pm2 restart impresion-restaurante
```

---

### Paso 6: Verificar los Logs Mejorados

En la PC de la impresora:

```cmd
cd C:\Users\TxPOS\sistema-restaurant\servicio-impresion-local
ver-logs.bat
```

Ahora verás información detallada:
- ✅ Qué path está intentando usar
- ✅ Dónde exactamente falla (al crear USB o al crear Printer)
- ✅ El error completo con stack trace

---

### Paso 7: Ejecutar Diagnóstico

En la PC de la impresora:

```cmd
cd C:\Users\TxPOS\sistema-restaurant\servicio-impresion-local
diagnostico-usb.bat
```

Este script:
- ✅ Verifica la configuración
- ✅ Lista las impresoras instaladas
- ✅ Muestra los puertos disponibles
- ✅ Prueba la conexión directamente

---

## 🔍 Errores Comunes y Soluciones

### Error: "Path: NO CONFIGURADO"

**Solución:**
1. Abre el `.env` en la PC de la impresora
2. Agrega: `PRINTER_KITCHEN_PATH=COM3` (o el puerto correcto)
3. Reinicia el servicio

---

### Error: "Device not found" o "ENOENT"

**Causa:** El puerto no existe o es incorrecto

**Solución:**
1. En la PC de la impresora, verifica el puerto en Panel de Control
2. Si estás usando `USB002` y no funciona, prueba con `COM3`, `COM4`, etc.
3. Actualiza el `.env` con el puerto correcto
4. Reinicia el servicio

---

### Error: "EACCES" o "Permission denied"

**Causa:** Permisos insuficientes

**Solución:**
1. En la PC de la impresora, ejecuta PowerShell o CMD **como Administrador**
2. Reinicia el servicio:
   ```cmd
   pm2 restart impresion-restaurante
   ```

---

## 📋 Resumen

1. ✅ Ve a la PC donde está la impresora (`C:\Users\TxPOS\...`)
2. ✅ Verifica el puerto correcto en Panel de Control
3. ✅ Actualiza `PRINTER_KITCHEN_PATH` en el `.env` (puede ser COM3, COM4, etc. en lugar de USB002)
4. ✅ Reinicia el servicio: `reiniciar-servicio.bat`
5. ✅ Ejecuta diagnóstico: `diagnostico-usb.bat`
6. ✅ Revisa logs: `ver-logs.bat` (ahora con información detallada)

---

## 🚨 IMPORTANTE

- El servicio **DEBE correr en la PC donde está la impresora**
- Los cambios en el `.env` **DEBEN hacerse en esa PC**
- El reinicio del servicio **DEBE hacerse en esa PC**

Si estás trabajando desde otra PC, necesitas:
- Acceso remoto a la PC de la impresora, O
- Hacer los cambios directamente en esa PC



