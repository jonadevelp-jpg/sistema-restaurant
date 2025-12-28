# 📋 ¿Cuándo se Guarda la Comanda en la Base de Datos?

## Resumen Rápido

**Los items se guardan INMEDIATAMENTE cuando los agregas a la orden.**
**El estado se guarda cuando cambias el estado (ej: "Preparación").**
**La impresión automática ocurre cuando cambias el estado a "preparing".**

---

## 🔄 Flujo Completo

### 1️⃣ **Crear Orden** (Se guarda en BD)
Cuando haces clic en una mesa y creas una orden nueva:
- Se crea un registro en `ordenes_restaurante` con estado `'pending'`
- La orden se guarda **inmediatamente** en la base de datos
- **Ubicación del código**: `src/react/components/MesasView.tsx` (líneas 429-468)

```typescript
// Se inserta la orden en la BD
const { data: orden, error } = await supabase
  .from('ordenes_restaurante')
  .insert({
    numero_orden: numeroOrden,
    mesa_id: mesa.id,
    mesero_id: user.id,
    estado: 'pending',  // Estado inicial
    total: 0,
  })
```

### 2️⃣ **Agregar Items** (Se guardan INMEDIATAMENTE)
Cuando haces clic en un item del menú para agregarlo a la orden:
- Se inserta o actualiza **inmediatamente** en `orden_items`
- **NO espera** a cambiar el estado
- **Ubicación del código**: `src/react/components/OrdenForm.tsx` (líneas 240-284)

```typescript
// Se guarda INMEDIATAMENTE en la BD
const { data, error } = await supabase
  .from('orden_items')
  .insert({
    orden_id: ordenId,
    menu_item_id: menuItem.id,
    cantidad: 1,
    precio_unitario: menuItem.price,
    subtotal: menuItem.price,
    notas: notasJson,
  })
```

**✅ Los items están guardados en la BD desde el momento que los agregas.**

### 3️⃣ **Cambiar Estado** (Se actualiza en BD y activa impresión)
Cuando haces clic en el botón **"⏳ Preparación"**:
- Se actualiza el estado de `'pending'` a `'preparing'` en la BD
- **Esto activa la impresión automática** de la comanda
- **Ubicación del código**: `src/react/components/OrdenForm.tsx` (líneas 428-488)

```typescript
// Se actualiza el estado en la BD
const response = await fetch(`/api/ordenes/${ordenId}`, {
  method: 'PATCH',
  body: JSON.stringify({ estado: 'preparing' }),
});
```

**✅ El cambio de estado se guarda y activa la impresión automática.**

### 4️⃣ **Impresión Automática** (Se activa al cambiar estado)
Cuando el estado cambia a `'preparing'`:
- La API route detecta el cambio de estado
- Llama a `printKitchenCommand()` para imprimir la comanda
- **Ubicación del código**: `src/pages/api/ordenes/[id].ts` (líneas 86-91)

```typescript
// Si el estado cambió a 'preparing', imprime comanda
if (estadoNuevo === 'preparing' && items.length > 0) {
  printKitchenCommand(ordenActualizada, items);
}
```

**✅ La impresión se activa automáticamente cuando cambias el estado.**

---

## 🖨️ Botón "Comanda" (Solo Vista Previa)

El botón **"🖨️ Comanda"** en la interfaz:
- **NO guarda nada** en la base de datos
- **NO cambia el estado** de la orden
- Solo muestra una **vista previa** de cómo se vería la comanda impresa
- Es útil para verificar antes de enviar a cocina
- **Ubicación del código**: `src/react/components/OrdenForm.tsx` (líneas 760-763)

```typescript
<button onClick={() => setShowComanda(true)}>
  🖨️ Comanda
</button>
```

**⚠️ Este botón NO guarda ni imprime, solo muestra una vista previa.**

---

## 📊 Resumen de Cuándo se Guarda

| Acción | ¿Se guarda en BD? | ¿Cuándo? |
|--------|-------------------|----------|
| **Crear orden** | ✅ SÍ | Inmediatamente al crear |
| **Agregar item** | ✅ SÍ | Inmediatamente al agregar |
| **Cambiar estado** | ✅ SÍ | Inmediatamente al cambiar |
| **Clic en "Comanda"** | ❌ NO | Solo muestra vista previa |
| **Impresión automática** | ✅ SÍ | Se activa al cambiar a "preparing" |

---

## 🔍 Verificación en la Base de Datos

Para verificar que todo se guardó correctamente:

```sql
-- Ver la orden
SELECT * FROM ordenes_restaurante 
WHERE id = 'tu-orden-id';

-- Ver los items de la orden
SELECT * FROM orden_items 
WHERE orden_id = 'tu-orden-id';

-- Ver el estado actual
SELECT estado, numero_orden, created_at 
FROM ordenes_restaurante 
WHERE id = 'tu-orden-id';
```

---

## ⚠️ Importante

1. **Los items se guardan inmediatamente** - No necesitas cambiar el estado para guardarlos
2. **El estado se guarda cuando lo cambias** - Al hacer clic en "Preparación"
3. **La impresión se activa automáticamente** - Cuando cambias el estado a "preparing"
4. **El botón "Comanda" es solo vista previa** - No guarda ni imprime nada

---

## 🐛 Si hay Problemas

Si los items no se guardan:
- Verifica que el usuario esté autenticado
- Verifica las políticas RLS (Row Level Security) en Supabase
- Ejecuta la migración `015_fix_orden_items_insert_rls.sql` si hay errores de RLS

Si la impresión no funciona:
- Verifica que el servicio de impresión local esté corriendo
- Verifica que el estado cambió a "preparing"
- Revisa los logs del servicio: `cd servicio-impresion-local && ver-logs.bat`



