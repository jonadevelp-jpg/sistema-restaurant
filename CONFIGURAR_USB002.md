# ✅ Configuración para Impresora USB002

## 🎯 Tu Impresora

Tu impresora está conectada por **USB** y aparece como **USB002** en los puertos. Esto es **correcto** y funcionará perfectamente.

---

## 📝 Configuración para .env

Agrega esto a tu archivo `.env`:

```env
# Impresora de Cocina (USB002)
PRINTER_KITCHEN_TYPE=usb
PRINTER_KITCHEN_PATH=USB002
```

Si tienes una segunda impresora para boletas, agrega también:

```env
# Impresora de Caja (si tienes otra)
PRINTER_CASHIER_TYPE=usb
PRINTER_CASHIER_PATH=USB002
# O si es otra impresora diferente, usa su puerto (USB001, USB003, etc.)
```

---

## ✅ Verificación

1. **Guarda el archivo `.env`**
2. **Reinicia el servidor:**
   ```bash
   npm run dev
   ```
3. **Prueba crear una orden y cambiarla a "En Preparación"**
4. **Revisa los logs del servidor** para ver si imprime correctamente

---

## 🔍 Si No Funciona

### Verificar que USB002 sea el puerto correcto:

1. Ve a **Panel de Control** → **Dispositivos e impresoras**
2. **Clic derecho** en tu impresora → **Propiedades de la impresora**
3. Ve a la pestaña **"Puertos"**
4. Verifica que **USB002** esté marcado/seleccionado
5. Si hay otro puerto marcado, anota cuál es y úsalo en el `.env`

### Otros puertos USB comunes:

- `USB001`
- `USB002` ← El tuyo
- `USB003`
- `COM3` (a veces Windows usa COM en lugar de USB)
- `COM4`

---

## 📋 Ejemplo Completo de .env

```env
# Supabase
PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Impresora de Cocina
PRINTER_KITCHEN_TYPE=usb
PRINTER_KITCHEN_PATH=USB002

# Impresora de Caja (si tienes otra)
PRINTER_CASHIER_TYPE=usb
PRINTER_CASHIER_PATH=USB002
```

---

## 🎉 ¡Listo!

Con esta configuración, cuando:
- **Cambies una orden a "En Preparación"** → Se imprimirá la comanda de cocina
- **Pagues una orden** → Se imprimirá la boleta de cliente

---

**¡USB002 es perfecto y debería funcionar sin problemas!** ✅







