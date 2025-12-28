# 🖨️ Implementación de Impresión Térmica Automática

## ✅ Cambios Implementados

### Archivos Nuevos Creados

1. **`src/lib/printer-service.ts`**
   - Servicio de impresión térmica ESC/POS
   - Soporta impresoras por red (IP) y USB
   - Maneja errores sin crashear el servidor
   - Funciones: `printKitchenCommand()` y `printCustomerReceipt()`

2. **`src/pages/api/ordenes/[id].ts`**
   - API route PATCH para actualizar órdenes
   - Detecta cambios de estado automáticamente
   - Activa impresión cuando corresponde:
     - Estado `'preparing'` → Imprime comanda de cocina
     - Estado `'paid'` → Imprime boleta de cliente
   - Si la impresión falla, NO bloquea la actualización

### Archivos Modificados

1. **`package.json`**
   - Agregada dependencia: `escpos` (v3.0.0-alpha.6)

2. **`src/react/components/OrdenForm.tsx`**
   - `updateEstado()`: Ahora intenta usar la API route primero, con fallback al método directo
   - `confirmarPago()`: Ahora intenta usar la API route primero, con fallback al método directo
   - **IMPORTANTE**: Si la API falla, usa el método original (no rompe funcionalidad existente)

3. **`CONFIGURAR_ENV.md`**
   - Agregada documentación para variables de impresora

## 🔧 Configuración Requerida

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

Agregar al archivo `.env`:

```env
# Impresora de Cocina (para comandas)
PRINTER_KITCHEN_TYPE=network
PRINTER_KITCHEN_IP=192.168.1.100
PRINTER_KITCHEN_PORT=9100

# Impresora de Caja (para boletas)
PRINTER_CASHIER_TYPE=network
PRINTER_CASHIER_IP=192.168.1.101
PRINTER_CASHIER_PORT=9100
```

**Opciones de tipo:**
- `network`: Impresora por red (requiere IP y PORT)
- `usb`: Impresora USB (requiere PATH)

**Ejemplo para USB (Linux):**
```env
PRINTER_KITCHEN_TYPE=usb
PRINTER_KITCHEN_PATH=/dev/usb/lp0
```

**Ejemplo para USB (Windows):**
```env
PRINTER_KITCHEN_TYPE=usb
PRINTER_KITCHEN_PATH=COM3
```

### 3. Verificar Impresoras

Las impresoras deben:
- Estar encendidas y conectadas
- Tener comunicación de red activa (si es network)
- Estar configuradas para ESC/POS

## 🎯 Funcionamiento

### Flujo de Impresión Automática

1. **Usuario cambia estado a "En Preparación"** (`preparing`):
   - Frontend llama a `/api/ordenes/[id]` con `PATCH { estado: 'preparing' }`
   - API actualiza el estado en la BD
   - API detecta cambio a `'preparing'`
   - API obtiene items de la orden
   - API llama a `printKitchenCommand()`
   - Si la impresión falla, solo se registra el error (no bloquea)

2. **Usuario paga la orden** (`paid`):
   - Frontend llama a `/api/ordenes/[id]` con `PATCH { estado: 'paid', ... }`
   - API actualiza el estado en la BD
   - API detecta cambio a `'paid'`
   - API obtiene items de la orden
   - API llama a `printCustomerReceipt()`
   - Si la impresión falla, solo se registra el error (no bloquea)

### Manejo de Errores

- ✅ Si la impresora no está configurada: El sistema funciona normalmente, solo se registra un warning
- ✅ Si la impresora no está conectada: El sistema funciona normalmente, solo se registra un error
- ✅ Si la impresión falla: El sistema funciona normalmente, la orden se actualiza igual
- ✅ Si la API route falla: El frontend usa el método directo como fallback

## 📋 Formato de Impresión

### Comanda de Cocina
- Título: "COMANDA COCINA"
- Información: Orden, Mesa, Hora
- Items: Cantidad x Nombre (en mayúsculas)
- Personalización: Salsas, agregados, notas
- Pie: Total items, timestamp
- Corte de papel automático

### Boleta de Cliente
- Encabezado: Nombre del restaurante, RUT, dirección
- Información: Orden, Mesa, Fecha, Hora
- Items: Cantidad, Descripción, Precio (sin IVA)
- Totales: Monto Neto, IVA (19%), Total
- Método de pago (si aplica)
- Pie: Mensaje de agradecimiento, timestamp
- Corte de papel automático

## 🔍 Verificación

### Verificar que Funciona

1. **Configurar impresoras en `.env`**
2. **Reiniciar el servidor**: `npm run dev`
3. **Crear una orden y agregar items**
4. **Cambiar estado a "En Preparación"**
   - Debe imprimirse la comanda automáticamente
   - Verificar logs en consola del servidor
5. **Pagar la orden**
   - Debe imprimirse la boleta automáticamente
   - Verificar logs en consola del servidor

### Logs Esperados

**Éxito:**
```
[Printer] Comanda impresa exitosamente: Orden ORD-001
[Printer] Boleta impresa exitosamente: Orden ORD-001
```

**Sin configuración:**
```
[Printer] Impresora de cocina no configurada. Saltando impresión.
```

**Error de conexión:**
```
[Printer] No se pudo conectar a la impresora de cocina
[API] Error imprimiendo comanda (no bloquea): [mensaje de error]
```

## ⚠️ Notas Importantes

1. **No rompe funcionalidad existente**: Si las impresoras no están configuradas, el sistema funciona igual que antes
2. **Fallback automático**: Si la API route falla, el frontend usa el método directo
3. **Errores no bloquean**: Si la impresión falla, la orden se actualiza igual
4. **Estados reales**: Se usa `'preparing'` (no "SENT_TO_KITCHEN") y `'paid'` como están en la BD

## 🐛 Solución de Problemas

### La impresión no funciona

1. **Verificar configuración en `.env`**:
   - ¿Las variables están correctas?
   - ¿La IP es accesible desde el servidor?
   - ¿El puerto es correcto (generalmente 9100)?

2. **Verificar conectividad**:
   ```bash
   # Desde el servidor, probar conexión
   telnet 192.168.1.100 9100
   # O usar ping
   ping 192.168.1.100
   ```

3. **Verificar logs del servidor**:
   - Buscar mensajes `[Printer]` en la consola
   - Los errores se registran sin crashear

### La orden se actualiza pero no imprime

- Verificar que las impresoras estén encendidas
- Verificar que la configuración en `.env` sea correcta
- Verificar logs del servidor para ver el error específico
- El sistema seguirá funcionando aunque no imprima

## 📝 Próximos Pasos (Opcional)

- [ ] Agregar configuración de impresoras desde el panel admin
- [ ] Agregar test de conexión a impresoras
- [ ] Agregar reimpresión manual desde la UI
- [ ] Soporte para múltiples impresoras de cocina

---

**Implementación completada sin romper funcionalidad existente** ✅







