# Análisis: Sistema de Impresión ESC/POS Profesional

## 📋 Análisis del Sistema Actual

### 1. Servicio de Impresión
- **Ubicación**: `servicio-impresion-local/server.js`
- **Método**: Polling cada 3 segundos consultando `print_jobs` con `status='pending'`
- **Impresora**: Conecta por nombre usando Windows Spooler (puerto vport-usb)
- **Formato**: Ya usa `ESCPOSFormatter` pero necesita mejoras

### 2. Base de Datos (Supabase)
✅ **Tablas existentes:**
- `ordenes_restaurante`: id, numero_orden, mesa_id, mesero_id, estado, total, nota, created_at, paid_at
- `orden_items`: id, orden_id, menu_item_id, cantidad, precio_unitario, subtotal, notas
- `print_jobs`: id, orden_id, type, printer_target, status, created_at, printed_at

✅ **Campos suficientes** - No se necesitan cambios en BD

### 3. Problema Identificado
El código actual tiene formato ESC/POS básico, pero:
- ❌ No respeta consistentemente 32 caracteres (58mm)
- ❌ Alineaciones pueden no funcionar correctamente
- ❌ Separadores no están bien formateados
- ❌ Texto puede desbordarse
- ❌ Formato de precios puede no alinearse correctamente

### 4. Vista Previa vs Impresión
✅ **Separación correcta:**
- Vista previa: `ComandaCocina.tsx` y `BoletaCliente.tsx` usan HTML/CSS
- Impresión: `server.js` usa ESC/POS puro
- ✅ No hay mezcla de HTML con impresión

## 🎯 Solución Propuesta

### Arquitectura
```
Frontend (React/Astro)
  ↓
POST /api/print-jobs → Crea print_job en BD
  ↓
Servicio Local (Node.js)
  ↓
Polling detecta print_job pendiente
  ↓
printKitchenCommand() / printCustomerReceipt()
  ↓
ESCPOSFormatter (formato profesional)
  ↓
printRaw() → Windows Spooler → Impresora POS58
```

### Mejoras Necesarias

1. **Función de formateo de texto para 32 caracteres**
   - Truncar/ajustar texto a máximo 32 caracteres
   - Manejar palabras largas correctamente

2. **Separadores profesionales**
   - Usar caracteres ASCII: `-`, `=`, `_`
   - Asegurar que ocupen exactamente 32 caracteres

3. **Alineaciones mejoradas**
   - Izquierda: texto normal
   - Centro: títulos y encabezados
   - Derecha: precios y totales

4. **Formato de precios**
   - Alinear a la derecha
   - Formato consistente: `$12.345`
   - Máximo 10 caracteres para precios

5. **Items con formato tabular**
   - Cantidad (2 chars) | Descripción (18 chars) | Precio (10 chars)
   - Total: 32 caracteres

## 📐 Especificaciones Técnicas

### Ancho de Impresora POS58
- **Ancho máximo**: 32 caracteres (58mm)
- **Fuente normal**: 12 cpi (caracteres por pulgada)
- **Fuente doble**: 6 cpi

### Estructura de Comanda
```
┌────────────────────────────────┐
│      COMANDA COCINA            │ (centrado, doble)
│      ================          │
│                                │
│ Orden: ORD-1234567890          │
│ Mesa: 5                        │
│ Hora: 14:30                    │
│ ------------------------------ │
│ 2x SHAWARMA POLLO              │
│   Sin cebolla                  │
│ 1x FALAFEL                     │
│ ------------------------------ │
│ Total Items: 3                 │
│ 2024-01-15 14:30               │
└────────────────────────────────┘
```

### Estructura de Boleta
```
┌────────────────────────────────┐
│    GOURMET ARABE SPA           │ (centrado, doble)
│    RUT: 77669643-9             │
│    Providencia 1388 Local 49    │
│    Celular: 939459286           │
│ ------------------------------ │
│ Orden: ORD-1234567890          │
│ Mesa: 5                        │
│ Fecha: 15/01/2024              │
│ Hora: 14:30                    │
│ ------------------------------ │
│ Cant Descripcion        Total  │
│ ------------------------------ │
│  2  SHAWARMA POLLO      $12.345│
│  1  FALAFEL             $8.500 │
│ ------------------------------ │
│ Monto Neto:          $17.647   │
│ IVA (19%):           $3.353    │
│ ------------------------------ │
│ TOTAL:                $21.000   │ (negrita)
│ ------------------------------ │
│ Metodo de Pago: EFECTIVO       │
│ Pagado: 15/01/2024 14:30       │
│ ------------------------------ │
│   ¡Gracias por su visita!      │
│   Carne Halal Certificada 🕌    │
│   2024-01-15 14:30             │
└────────────────────────────────┘
```

## 🔧 Implementación

### Paso 1: Mejorar ESCPOSFormatter
- Agregar método `textFixedWidth(text, width, align)`
- Agregar método `separatorLine(char, width)`
- Mejorar método `text()` para manejar truncamiento

### Paso 2: Crear funciones de formateo
- `formatHeader()` - Encabezado del local
- `formatOrderInfo()` - Info de orden
- `formatItems()` - Items con formato tabular
- `formatTotals()` - Totales alineados
- `formatFooter()` - Pie de página

### Paso 3: Refactorizar funciones de impresión
- `printKitchenCommand()` - Usar nuevas funciones
- `printCustomerReceipt()` - Usar nuevas funciones

### Paso 4: Probar y ajustar
- Probar con impresora real
- Ajustar espaciados
- Verificar alineaciones

## ✅ Checklist de Implementación

- [ ] Mejorar `ESCPOSFormatter` con métodos de ancho fijo
- [ ] Crear funciones de formateo profesional
- [ ] Refactorizar `printKitchenCommand()`
- [ ] Refactorizar `printCustomerReceipt()`
- [ ] Probar formato de comanda
- [ ] Probar formato de boleta
- [ ] Verificar que respeta 32 caracteres
- [ ] Verificar alineaciones
- [ ] Verificar separadores
- [ ] Documentar cambios


