# 🔧 Solución Definitiva para VPORT-USB:

## ❌ Problema

El puerto `VPORT-USB:` es un puerto virtual que Windows asigna a impresoras USB, pero **NO es compatible directamente con `escpos`**. Este puerto puede aparecer siempre igual, incluso si cambias el cable a otra entrada USB.

## ✅ Soluciones (en orden de preferencia)

### Solución 1: Usar findPrinter() automáticamente (RECOMENDADO)

El código ahora detecta automáticamente cuando el path es un nombre de impresora (como "POS58") y usa `findPrinter()` para encontrar el dispositivo USB real por su Vendor ID y Product ID.

**Ventajas:**
- Funciona independientemente del puerto virtual
- No requiere conocer el puerto COM
- Funciona aunque cambies el cable USB

**Cómo funciona:**
1. El código detecta que "POS58" no es un puerto COM válido
2. Usa `findPrinter()` para encontrar el dispositivo USB
3. Extrae el Vendor ID (vid) y Product ID (pid)
4. Intenta múltiples métodos para crear el dispositivo USB

**Si esta solución no funciona**, continúa con las siguientes.

### Solución 2: Encontrar el Puerto COM Real

Aunque el puerto virtual sea `VPORT-USB:`, Windows puede asignar un puerto COM real a la impresora.

**Pasos:**

1. **Abre el Administrador de Dispositivos:**
   - Presiona `Win + X`
   - Selecciona "Administrador de dispositivos"

2. **Busca tu impresora:**
   - Expande "Puertos (COM y LPT)"
   - Busca una entrada relacionada con tu impresora (puede ser "USB Serial Port", "POS58", etc.)
   - Anota el número COM (ej: COM3, COM4, COM5)

3. **Actualiza el .env:**
   ```env
   PRINTER_CASHIER_PATH=COM3
   PRINTER_KITCHEN_PATH=COM3
   ```
   (Reemplaza COM3 con el puerto que encontraste)

4. **Reinicia el servicio:**
   ```cmd
   cd servicio-impresion-local
   reiniciar-servicio.bat
   ```

### Solución 3: Usar el Nombre de la Impresora

Si el puerto COM no funciona, puedes usar el nombre exacto de la impresora:

```env
PRINTER_CASHIER_PATH=POS58
PRINTER_KITCHEN_PATH=POS58
```

El código intentará usar `findPrinter()` automáticamente.

### Solución 4: Ejecutar como Administrador

A veces Windows requiere permisos de administrador para acceder a dispositivos USB:

1. **Cierra el servicio actual:**
   ```cmd
   pm2 stop impresion-restaurante
   pm2 delete impresion-restaurante
   ```

2. **Abre PowerShell como Administrador:**
   - Presiona `Win + X`
   - Selecciona "Windows PowerShell (Administrador)"

3. **Navega al directorio:**
   ```cmd
   cd C:\Users\Dell\Documents\sistema-restaurant\servicio-impresion-local
   ```

4. **Inicia el servicio:**
   ```cmd
   .\iniciar-servicio.bat
   ```

### Solución 5: Verificar el Driver de la Impresora

Si ninguna solución funciona, puede ser un problema del driver:

1. **Ve a Panel de Control > Dispositivos e impresoras**
2. **Clic derecho en POS58 > Propiedades de impresora**
3. **Pestaña "Avanzado"**
4. **Verifica que el driver esté instalado correctamente**
5. **Si es necesario, reinstala el driver desde el sitio del fabricante**

## 🔍 Diagnóstico

Para diagnosticar el problema, ejecuta:

```cmd
cd servicio-impresion-local
.\encontrar-puerto-com.bat
```

Este script mostrará:
- Impresoras instaladas
- Puertos COM disponibles
- Puerto asignado a tu impresora

## 📝 Notas Importantes

1. **El puerto VPORT-USB: es normal** - Es el puerto virtual que Windows asigna a impresoras USB
2. **findPrinter() es la mejor solución** - Funciona independientemente del puerto virtual
3. **Si cambias el cable USB**, el puerto COM puede cambiar, pero `findPrinter()` siempre encontrará el dispositivo
4. **Ejecutar como Administrador** puede resolver problemas de permisos

## 🆘 Si Nada Funciona

Si ninguna solución funciona:

1. Verifica que la impresora esté encendida y conectada
2. Verifica que el driver esté instalado correctamente
3. Prueba con otra impresora térmica para descartar problemas de hardware
4. Revisa los logs del servicio para ver errores específicos:
   ```cmd
   cd servicio-impresion-local
   .\ver-logs.bat
   ```



