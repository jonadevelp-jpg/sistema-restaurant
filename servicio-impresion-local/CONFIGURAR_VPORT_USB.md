# 🔧 Configuración para Impresora con Puerto vport-usb:

## ✅ Tu Impresora

Tu impresora usa el puerto **`vport-usb:`** (puerto virtual USB). Este es un formato válido y el código ahora lo soporta.

---

## 📝 Configuración en .env

Actualiza tu archivo `.env` con:

```env
PRINTER_KITCHEN_TYPE=usb
PRINTER_KITCHEN_PATH=vport-usb:
```

Si tienes una segunda impresora para boletas:

```env
PRINTER_CASHIER_TYPE=usb
PRINTER_CASHIER_PATH=vport-usb:
```

---

## ✅ Verificación

1. **Guarda el archivo `.env`**
2. **Reinicia el servicio:**
   ```cmd
   reiniciar-servicio.bat
   ```
3. **Verifica los logs:**
   ```cmd
   ver-logs.bat
   ```
   
   Deberías ver:
   ```
   📋 Impresora Cocina:
      - Tipo: usb
      - Path: vport-usb:
   ```

4. **Prueba la impresión:**
   ```cmd
   probar-manualmente.bat
   ```

---

## 🔍 Si No Funciona

El código intenta múltiples variaciones automáticamente:
- `vport-usb:` (con dos puntos)
- `vport-usb` (sin dos puntos)
- `vport-usb` (solo el nombre)

Si ninguna funciona, verifica:

1. **En Panel de Control:**
   - Dispositivos e impresoras
   - Clic derecho en tu impresora > Propiedades de impresora
   - Pestaña "Puertos"
   - Verifica el nombre exacto del puerto

2. **Prueba otros formatos:**
   - Si el puerto aparece como `vport-usb:` → usa exactamente eso
   - Si aparece como `vport-usb` → usa sin los dos puntos
   - Si aparece como otro nombre → usa ese nombre exacto

---

## 📋 Ejemplo Completo de .env

```env
# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Polling
POLLING_ENABLED=true
POLLING_INTERVAL_MS=3000

# Impresora de Cocina
PRINTER_KITCHEN_TYPE=usb
PRINTER_KITCHEN_PATH=vport-usb:

# Impresora de Caja
PRINTER_CASHIER_TYPE=usb
PRINTER_CASHIER_PATH=vport-usb:

# Servidor HTTP
PRINT_SERVICE_PORT=3001
PRINT_SERVICE_TOKEN=tu-token-seguro
```

---

## 🎉 ¡Listo!

Con esta configuración, cuando:
- **Cambies una orden a "En Preparación"** → Se imprimirá la comanda de cocina
- **Pagues una orden** → Se imprimirá la boleta de cliente

El servicio detectará automáticamente las órdenes pendientes y las imprimirá.



