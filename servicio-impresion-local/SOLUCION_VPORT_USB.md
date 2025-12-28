# 🔧 Solución para Puerto vport-usb:

## ❌ Problema Actual

El error `usb.on is not a function` indica que el objeto USB no se está creando correctamente. El puerto `vport-usb:` no es un formato que `escpos` entienda directamente.

## 🔍 Diagnóstico

El problema puede ser:

1. **`vport-usb:` no es compatible con escpos directamente**
   - `escpos` espera formatos como `USB002`, `COM3`, o el nombre de la impresora
   - `vport-usb:` es un puerto virtual que puede requerir un enfoque diferente

2. **El módulo USB no se está cargando correctamente**
   - Error: `USB is not a constructor`
   - Esto sugiere que la importación de `escpos` no está funcionando

## ✅ Soluciones

### Solución 1: Usar el Nombre de la Impresora (Recomendado)

En lugar de usar `vport-usb:`, usa el **nombre exacto de la impresora**:

1. **Encuentra el nombre de tu impresora:**
   - Panel de Control > Dispositivos e impresoras
   - Busca tu impresora térmica
   - Copia el nombre exacto (ej: "XP-80C", "TM-T20", etc.)

2. **Actualiza el .env:**
   ```env
   PRINTER_KITCHEN_PATH=Nombre-Exacto-de-Tu-Impresora
   PRINTER_CASHIER_PATH=Nombre-Exacto-de-Tu-Impresora
   ```

3. **Reinicia el servicio:**
   ```cmd
   reiniciar-servicio.bat
   ```

### Solución 2: Encontrar el Puerto COM Real

1. **Ve a Panel de Control > Dispositivos e impresoras**
2. **Clic derecho en tu impresora > Propiedades de impresora**
3. **Pestaña "Puertos"**
4. **Busca el puerto marcado** (puede ser `COM3`, `COM4`, `USB002`, etc.)
5. **Actualiza el .env con ese puerto:**
   ```env
   PRINTER_KITCHEN_PATH=COM3
   PRINTER_CASHIER_PATH=COM3
   ```

### Solución 3: Usar el Dispositivo Encontrado por findPrinter()

El código ya intenta usar `USB.findPrinter()` automáticamente. Si encuentra un dispositivo, intentará usarlo. Pero el problema es que el módulo USB no se está cargando correctamente.

**Verifica la instalación:**
```cmd
cd servicio-impresion-local
npm list escpos escpos-usb
```

Si `escpos-usb` no está instalado:
```cmd
npm install escpos-usb
```

### Solución 4: Usar Impresión RAW Directa (Avanzado)

Si ninguna de las soluciones anteriores funciona, puedes usar impresión RAW directa a través de Windows:

```javascript
const fs = require('fs');
const printer = require('printer');

// Enviar datos RAW directamente al puerto
const printerName = 'Nombre-de-Tu-Impresora';
printer.printDirect({
  data: buffer, // Datos ESC/POS
  printer: printerName,
  type: 'RAW',
  success: (jobID) => console.log('Impreso:', jobID),
  error: (err) => console.error('Error:', err)
});
```

## 🔍 Verificación

Después de cambiar el `.env`, verifica:

1. **Reinicia el servicio:**
   ```cmd
   reiniciar-servicio.bat
   ```

2. **Verifica los logs:**
   ```cmd
   ver-logs.bat
   ```

3. **Deberías ver:**
   ```
   ✅ Dispositivo USB creado exitosamente
   ```

## 📝 Notas Importantes

- **`vport-usb:` es un puerto virtual** que puede no ser compatible con `escpos` directamente
- **El nombre de la impresora suele funcionar mejor** que el puerto
- **Verifica que la impresora esté encendida y conectada** antes de probar
- **Ejecuta como Administrador** si tienes problemas de permisos

## 🎯 Próximos Pasos

1. Prueba usar el **nombre de la impresora** en lugar de `vport-usb:`
2. Si no funciona, busca el **puerto COM real** en Panel de Control
3. Verifica que `escpos-usb` esté instalado correctamente
4. Si nada funciona, considera usar impresión RAW directa



