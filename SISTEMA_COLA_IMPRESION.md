# Sistema de Cola de Impresión (Print Jobs)

## Resumen

El sistema de impresión ha sido completamente refactorizado para **separar la impresión del estado de las órdenes**. Ahora, imprimir es una **ACCIÓN** solicitada por el usuario, no un efecto secundario del cambio de estado.

## Cambios Principales

### 1. Nueva Tabla: `print_jobs`

Se creó una tabla `print_jobs` que funciona como una cola de trabajos de impresión:

```sql
CREATE TABLE print_jobs (
  id UUID PRIMARY KEY,
  orden_id UUID REFERENCES ordenes_restaurante(id),
  type TEXT CHECK (type IN ('kitchen', 'receipt', 'payment')),
  printer_target TEXT CHECK (printer_target IN ('kitchen', 'cashier')),
  status TEXT CHECK (status IN ('pending', 'printing', 'printed', 'error')),
  error_message TEXT,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP,
  printed_at TIMESTAMP,
  requested_by UUID REFERENCES users(id)
);
```

### 2. Polling Modificado

El servicio de impresión local (`servicio-impresion-local/server.js`) ahora:

- **ANTES**: Consultaba órdenes con `estado='preparing'` o `estado='paid'` y campos `kitchen_printed_at`/`receipt_printed_at` NULL.
- **AHORA**: Consulta `print_jobs` con `status='pending'` y los procesa secuencialmente.

### 3. API Route Nueva: `/api/print-jobs`

Nueva ruta que crea trabajos de impresión:

```typescript
POST /api/print-jobs
Body: {
  ordenId: string,
  type: 'kitchen' | 'receipt' | 'payment',
  printerTarget?: 'kitchen' | 'cashier'
}
```

### 4. Frontend Actualizado

Los botones de impresión ahora crean `print_jobs` en lugar de llamar directamente a la impresión:

- **ComandaCocina**: `handleSendToKitchen()` → crea `print_job` tipo `kitchen`
- **BoletaCliente**: `handlePrintReceipt()` → crea `print_job` tipo `receipt`
- **OrdenForm**: `confirmarPago()` → crea `print_job` tipo `payment`

### 5. Desacoplamiento del Estado

La API route `/api/ordenes/[id]` **ya NO imprime automáticamente** al cambiar el estado. El cambio de estado y la impresión son completamente independientes.

## Flujo Completo

### Cuando el usuario solicita una impresión:

1. **Frontend** → Llama a `POST /api/print-jobs` con `ordenId`, `type`, `printerTarget`
2. **API Route** → Crea un registro en `print_jobs` con `status='pending'`
3. **Servicio Local** → El polling detecta el `print_job` pendiente
4. **Servicio Local** → Marca el `print_job` como `status='printing'` (evita duplicados)
5. **Servicio Local** → Obtiene la orden e items, imprime según el tipo
6. **Servicio Local** → Marca el `print_job` como `status='printed'` o `status='error'`

### Tipos de Impresión

- **`kitchen`**: Comanda de cocina → impresora `kitchen`
- **`receipt`**: Boleta de cliente → impresora `cashier`
- **`payment`**: Recibo de pago → impresora `cashier`

## Migración de Base de Datos

Ejecutar en Supabase SQL Editor:

```sql
-- Ver: database/migrations/018_create_print_jobs.sql
```

## Ventajas del Nuevo Sistema

1. ✅ **Separación de responsabilidades**: El estado de la orden no está acoplado a la impresión
2. ✅ **Control explícito**: Solo se imprime cuando el usuario lo solicita
3. ✅ **Cola de trabajos**: Permite reintentos y manejo de errores
4. ✅ **Auditoría**: Se registra quién solicitó cada impresión (`requested_by`)
5. ✅ **Escalabilidad**: Fácil agregar más tipos de impresión o impresoras
6. ✅ **Sin duplicados**: El sistema evita procesar el mismo `print_job` dos veces

## Compatibilidad

- Los endpoints HTTP antiguos del servicio local (`/print/kitchen`, `/print/receipt`) siguen funcionando, pero ahora crean `print_jobs` en lugar de imprimir directamente.
- Los campos `kitchen_printed_at` y `receipt_printed_at` en `ordenes_restaurante` se mantienen por compatibilidad, pero ya no se usan para el polling.

## Próximos Pasos

1. Ejecutar la migración `018_create_print_jobs.sql` en Supabase
2. Reiniciar el servicio de impresión local
3. Probar los botones de impresión desde el frontend
4. Verificar que el polling procese los `print_jobs` correctamente


