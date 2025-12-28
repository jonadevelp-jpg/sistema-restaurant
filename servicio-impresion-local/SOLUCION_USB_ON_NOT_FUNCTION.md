# 🔧 Solución para Error: `usb.on is not a function`

## ❌ Problema

El error `usb.on is not a function` indica que el objeto USB creado no es un dispositivo válido de `escpos`. Esto ocurre porque:

1. **`escpos` v3.0 tiene una API diferente**: El método `escpos.create('usb')` puede devolver un adaptador, no un constructor directo.
2. **`vport-usb:` no es compatible**: Este formato de puerto virtual no es reconocido directamente por `escpos`.
3. **Verificación prematura de `.on()`**: Estábamos verificando `.on()` antes de que el dispositivo estuviera completamente inicializado.

## ✅ Cambios Realizados

### 1. **Mejora en la Importación de `escpos`**

- **Prioridad 1**: Usar `escpos.create('usb')` como método principal (recomendado para v3.0)
- **Prioridad 2**: Intentar obtener USB/Network directamente desde `escpos`
- **Prioridad 3**: Intentar desde `escpos.default`
- **Prioridad 4**: Intentar módulos separados `escpos-usb` y `escpos-network`

### 2. **Mejora en la Conexión USB**

- **No verificar `.on()` inmediatamente**: En lugar de verificar si el dispositivo tiene `.on()`, ahora intentamos crear un objeto `Printer` para verificar que funciona.
- **Soporte para adaptadores**: Si `USB` es un adaptador (objeto) en lugar de un constructor, intentamos usar métodos como `open()` o `create()`.
- **Múltiples métodos de conexión**: Intentamos diferentes formas de crear el dispositivo:
  - Constructor directo: `new USB(path)`
  - Adaptador con `open()`: `USB.open(path)`
  - Adaptador con `create()`: `USB.create(path)`
  - Usando `findPrinter()` y luego diferentes métodos para abrir el dispositivo encontrado

### 3. **Mejor Manejo de `findPrinter()`**

Cuando `USB.findPrinter()` encuentra dispositivos, intentamos:
- Pasar el objeto directamente al constructor
- Crear USB sin parámetros y luego usar `open()`
- Usar `vendorId` y `productId`
- Usar métodos del adaptador si está disponible

## 🎯 Próximos Pasos

### Opción 1: Usar el Nombre Exacto de la Impresora (Recomendado)

1. **Encuentra el nombre de tu impresora:**
   - Panel de Control > Dispositivos e impresoras
   - Busca tu impresora térmica
   - Copia el nombre exacto (ej: "XP-80C", "TM-T20", "POS-80", etc.)

2. **Actualiza el `.env`:**
   ```env
   PRINTER_KITCHEN_PATH=Nombre-Exacto-de-Tu-Impresora
   PRINTER_CASHIER_PATH=Nombre-Exacto-de-Tu-Impresora
   ```

3. **Reinicia el servicio:**
   ```cmd
   cd servicio-impresion-local
   reiniciar-servicio.bat
   ```

### Opción 2: Usar el Puerto COM Real

1. **Encuentra el puerto COM:**
   - Panel de Control > Dispositivos e impresoras
   - Clic derecho en tu impresora > Propiedades de impresora
   - Pestaña "Puertos"
   - Busca el puerto marcado (puede ser `COM3`, `COM4`, `USB002`, etc.)

2. **Actualiza el `.env`:**
   ```env
   PRINTER_KITCHEN_PATH=COM3
   PRINTER_CASHIER_PATH=COM3
   ```

3. **Reinicia el servicio:**
   ```cmd
   cd servicio-impresion-local
   reiniciar-servicio.bat
   ```

### Opción 3: Dejar que `findPrinter()` Encuentre el Dispositivo

El código ahora intenta usar `USB.findPrinter()` automáticamente si los métodos de path fallan. Si encuentra un dispositivo, intentará usarlo automáticamente.

## 📋 Verificación

Después de actualizar el `.env` y reiniciar, verifica los logs:

```cmd
cd servicio-impresion-local
ver-logs.bat
```

Busca mensajes como:
- `✅ Dispositivo USB creado exitosamente`
- `✅ Objeto Printer creado correctamente`

Si ves estos mensajes, la conexión está funcionando.

## 🔍 Diagnóstico Adicional

Si el problema persiste, ejecuta:

```cmd
cd servicio-impresion-local
node test-vport-usb.js
```

Este script probará diferentes métodos de conexión y te mostrará cuál funciona.

## 📝 Notas Importantes

1. **`vport-usb:` no es compatible**: Este formato de puerto virtual no funciona directamente con `escpos`. Usa el nombre de la impresora o el puerto COM real.

2. **Permisos de Administrador**: Asegúrate de ejecutar el servicio como Administrador si es necesario.

3. **Driver de la Impresora**: Verifica que el driver de la impresora esté instalado correctamente en Windows.

4. **Puerto en Uso**: Asegúrate de que ningún otro programa esté usando el puerto de la impresora.

## 🎉 Resultado Esperado

Después de aplicar estos cambios y usar el nombre correcto de la impresora o el puerto COM, deberías ver:

```
✅ Dispositivo USB creado exitosamente
✅ Objeto Printer creado correctamente
🖨️  Impresión exitosa
```

El polling debería funcionar correctamente y las órdenes deberían imprimirse automáticamente.



