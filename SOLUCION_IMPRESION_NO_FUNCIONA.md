# 🔧 Solución: La Impresión de Prueba No Funciona

## ⚠️ Problema Detectado

El error muestra: **"No se pudo conectar a la impresora de cocina"**

Esto significa que el servicio local no puede establecer conexión con la impresora física.

---

## ✅ Solución Paso a Paso

### Paso 1: Verificar Configuración en .env

El archivo `.env` en la carpeta `servicio-impresion-local` **DEBE tener** la configuración de la impresora:

**Para impresora USB:**
```env
PRINTER_KITCHEN_TYPE=usb
PRINTER_KITCHEN_PATH=USB002
```

**Para impresora de red:**
```env
PRINTER_KITCHEN_TYPE=network
PRINTER_KITCHEN_IP=192.168.1.100
PRINTER_KITCHEN_PORT=9100
```

**Verificar:**
1. Ve a la carpeta `servicio-impresion-local`
2. Abre el archivo `.env` con Bloc de Notas
3. Verifica que tenga las líneas de configuración de impresora

---

### Paso 2: Encontrar el Puerto Correcto (Solo USB)

Si tu impresora es USB, necesitas encontrar el puerto correcto. **IMPORTANTE:** En Windows, `escpos` puede necesitar el puerto COM, no USB002.

**Método 1: Verificar en Panel de Control**
1. Ve a **Panel de Control** → **Dispositivos e impresoras**
2. **Clic derecho** en tu impresora → **Propiedades de impresora**
3. Ve a la pestaña **"Puertos"**
4. Busca el puerto marcado (ej: USB002, USB003, COM3, COM4, etc.)
5. Anota el puerto exacto

**Método 2: Verificar en Administrador de Dispositivos**
1. Presiona `Win + X` → **Administrador de dispositivos**
2. Expande **"Puertos (COM y LPT)"**
3. Busca tu impresora (puede aparecer como "USB Serial Port" o similar)
4. Anota el puerto COM (ej: COM3, COM4)

**Método 3: Usar PowerShell**
```powershell
Get-WmiObject Win32_SerialPort | Select-Object DeviceID, Description
```

**Actualiza el `.env` con el puerto correcto:**

Si el puerto es COM3, COM4, etc.:
```env
PRINTER_KITCHEN_PATH=COM3
```

Si el puerto es USB002, USB003, etc., intenta primero con ese:
```env
PRINTER_KITCHEN_PATH=USB002
```

**Si USB002 no funciona, prueba con COM3, COM4, etc.**

---

### Paso 3: Verificar que la Impresora Esté Conectada

**Verifica manualmente:**
- ✅ La impresora está **ENCENDIDA**
- ✅ La impresora está **CONECTADA** por USB o red
- ✅ El cable USB está bien conectado (si es USB)
- ✅ La impresora aparece en Windows como "Lista" o "En línea"

**Prueba imprimir una página de prueba desde Windows:**
1. Panel de Control → Dispositivos e impresoras
2. Clic derecho en tu impresora → **Imprimir página de prueba**
3. Si no imprime, hay un problema con la impresora o Windows

---

### Paso 4: Reiniciar el Servicio

Después de modificar el `.env`, **SIEMPRE reinicia el servicio:**

```cmd
cd servicio-impresion-local
reiniciar-servicio.bat
```

O manualmente:
```cmd
pm2 restart impresion-restaurante
```

---

### Paso 5: Verificar los Logs Mejorados

Ahora el servicio muestra **mucha más información** cuando intenta imprimir:

```cmd
ver-logs.bat
```

**Busca estas líneas:**
```
📋 ========== INICIANDO IMPRESIÓN DE COMANDA ==========
📋 Configuración de impresora:
   - Tipo: usb
   - Path: USB002
🔌 ========== INTENTANDO CONECTAR A IMPRESORA ==========
```

**Si ves errores, te dirán exactamente qué falta:**
- `❌ Path: NO CONFIGURADO` → Falta `PRINTER_KITCHEN_PATH` en `.env`
- `❌ IP: NO CONFIGURADO` → Falta `PRINTER_KITCHEN_IP` en `.env`
- `❌ Error conectando a impresora: Device not found` → Puerto incorrecto
- `❌ Error conectando a impresora: EACCES` → Permisos insuficientes

---

### Paso 6: Probar de Nuevo

Ejecuta el script de prueba mejorado:

```cmd
cd servicio-impresion-local
probar-manualmente.bat
```

Ahora mostrará:
- ✅ La configuración de la impresora antes de intentar imprimir
- ✅ Errores más detallados si algo falla

---

## 🔍 Errores Comunes y Soluciones

### Error: "Path: NO CONFIGURADO"

**Solución:**
1. Abre el `.env` en `servicio-impresion-local`
2. Agrega: `PRINTER_KITCHEN_PATH=USB002` (o el puerto correcto)
3. Reinicia el servicio

---

### Error: "Device not found" o "ENOENT"

**Causa:** El puerto USB no existe o es incorrecto

**Solución:**
1. Verifica el puerto en Panel de Control (Paso 2)
2. **IMPORTANTE:** Si estás usando `USB002`, `USB003`, etc., y no funciona:
   - Prueba con el puerto COM correspondiente (COM3, COM4, etc.)
   - O ejecuta el script de diagnóstico: `diagnostico-usb.bat`
3. Actualiza `PRINTER_KITCHEN_PATH` en `.env` con el puerto correcto
4. Reinicia el servicio

**Ejemplo:**
- Si el puerto es `USB002` y no funciona, prueba `COM3` o `COM4`
- Si el puerto es `COM3`, úsalo directamente: `PRINTER_KITCHEN_PATH=COM3`

---

### Error: "EACCES" o "Permission denied"

**Causa:** Permisos insuficientes en Windows

**Solución:**
1. Ejecuta PowerShell o CMD **como Administrador**
2. Detén el servicio: `pm2 stop impresion-restaurante`
3. Inicia de nuevo: `pm2 start server.js --name impresion-restaurante`
4. O ejecuta `reiniciar-servicio.bat` como Administrador

---

### Error: "ECONNREFUSED" (Solo para impresoras de red)

**Causa:** No se puede conectar a la IP de la impresora

**Solución:**
1. Verifica que la IP sea correcta
2. Verifica que la impresora esté encendida y en la red
3. Prueba hacer ping: `ping 192.168.1.100` (reemplaza con tu IP)
4. Verifica que el puerto 9100 esté abierto

---

## 📋 Verificación Final

Después de seguir todos los pasos:

1. **Verifica configuración:**
   ```cmd
   verificar-impresion.bat
   ```

2. **Revisa los logs:**
   ```cmd
   ver-logs.bat
   ```
   
   Debes ver:
   ```
   ✅ Objeto Printer creado correctamente
   📋 Contenido preparado, enviando a impresora...
   ✅ Comanda impresa correctamente
   ```

3. **Prueba manualmente:**
   ```cmd
   probar-manualmente.bat
   ```

---

## 🎯 Resumen Rápido

1. ✅ Verifica que el `.env` tenga `PRINTER_KITCHEN_TYPE` y `PRINTER_KITCHEN_PATH` (o IP/PORT si es red)
2. ✅ Encuentra el puerto correcto en Panel de Control o Administrador de Dispositivos
3. ✅ **Si USB002 no funciona, prueba con COM3, COM4, etc.**
4. ✅ Verifica que la impresora esté encendida y conectada
5. ✅ Reinicia el servicio: `reiniciar-servicio.bat`
6. ✅ Ejecuta diagnóstico: `diagnostico-usb.bat` (nuevo script de ayuda)
7. ✅ Prueba: `probar-manualmente.bat`
8. ✅ Revisa logs: `ver-logs.bat` (ahora con más información)

**Los logs mejorados te dirán exactamente qué está fallando.** 🔍

---

## 🔧 Script de Diagnóstico Nuevo

He creado un script de diagnóstico que te ayudará a encontrar el problema:

```cmd
cd servicio-impresion-local
diagnostico-usb.bat
```

Este script:
- ✅ Verifica la configuración en `.env`
- ✅ Lista las impresoras instaladas en Windows
- ✅ Muestra los puertos USB/COM disponibles
- ✅ Prueba la conexión con el path configurado
- ✅ Te dice exactamente qué está fallando

