# 📋 Instrucciones: Stock de Panes y Bebidas

## 🎯 Funcionalidad

Este sistema permite gestionar el stock de panes y bebidas, y descontar automáticamente el stock cuando se venden productos del menú.

### Características:
- ✅ Gestión de stock de panes (asociados a categorías: completos, sandwiches)
- ✅ Gestión de stock de bebidas (independientes)
- ✅ Descuento automático al vender productos
- ✅ Registro de movimientos de stock
- ✅ Alertas de stock bajo

## 📦 Instalación

### 1. Ejecutar Migración SQL

Ejecuta la migración en el SQL Editor de Supabase:

```sql
-- Archivo: database/migrations/019_create_stock_panes_bebidas.sql
```

Esta migración:
- Crea la tabla `stock_panes_bebidas`
- Crea la tabla `movimientos_stock_panes_bebidas`
- Modifica el trigger `actualizar_stock_orden` para descontar panes y bebidas automáticamente

### 2. Configurar Stock Inicial

Después de ejecutar la migración, ve a:
**Admin Panel → Stock Panes/Bebidas**

Agrega los items de stock:

#### Panes:
- **Pan de Completo** (categoría: completos)
- **Pan de Sandwich** (categoría: sandwiches)

#### Bebidas:
- Agrega cada bebida que vendes (Coca Cola, Fanta, etc.)

## 🔄 Cómo Funciona el Descuento Automático

### Panes:
Cuando se vende un producto de la categoría:
- **Completos** → Descuenta 1 pan de "Pan de Completo"
- **Sandwiches** → Descuenta 1 pan de "Pan de Sandwich"

### Bebidas:
Cuando se vende un producto de la categoría **Bebidas**, el sistema busca una bebida con el mismo nombre que el item del menú y descuenta la cantidad vendida.

**⚠️ IMPORTANTE:** El nombre de la bebida en el stock debe coincidir exactamente con el nombre del item en el menú (case-insensitive).

## 📝 Uso del Sistema

### Agregar Nuevo Item de Stock

1. Ve a **Admin Panel → Stock Panes/Bebidas**
2. Haz clic en **➕ Agregar Item**
3. Completa el formulario:
   - **Tipo:** Pan o Bebida
   - **Nombre:** Nombre del item
   - **Categoría:** (Solo para panes) Selecciona la categoría del menú
   - **Cantidad Actual:** Stock inicial
   - **Stock Mínimo:** Cantidad mínima antes de alertar
   - **Precio Unitario:** Precio de compra/costo
   - **Unidad de Medida:** (Solo para bebidas) lt, ml, o un

### Ajustar Stock

1. Haz clic en **📊 Ajustar** en cualquier item
2. Selecciona el tipo de ajuste:
   - **➕ Entrada (+):** Agrega stock
   - **➖ Salida (-):** Quita stock
   - **⚖️ Ajuste Directo (=):** Establece cantidad exacta
3. Ingresa la cantidad y motivo (opcional)
4. Haz clic en **Aplicar Ajuste**

### Ver Movimientos

Los movimientos se registran automáticamente cuando:
- Se vende un producto (descuento automático)
- Se hace un ajuste manual
- Se agrega stock manualmente

## ⚠️ Notas Importantes

1. **Nombres de Bebidas:** El nombre de la bebida en el stock debe coincidir exactamente con el nombre del item en el menú para que el descuento automático funcione.

2. **Categorías de Panes:** Los panes deben estar asociados a la categoría correcta (completos o sandwiches) para que el descuento funcione.

3. **Stock Mínimo:** Configura un stock mínimo para recibir alertas cuando el stock esté bajo.

4. **Unidades:** 
   - Panes siempre usan unidad "un" (unidades)
   - Bebidas pueden usar "lt" (litros), "ml" (mililitros) o "un" (unidades)

## 🔍 Solución de Problemas

### El stock no se descuenta automáticamente

1. Verifica que el item de stock existe
2. Para panes: Verifica que la categoría del pan coincide con la categoría del producto vendido
3. Para bebidas: Verifica que el nombre de la bebida en el stock coincide exactamente con el nombre del item en el menú

### Error al ejecutar la migración

Si hay un error porque el trigger ya existe, puedes ejecutar solo la parte de actualización de la función:

```sql
-- Solo actualizar la función (sin recrear el trigger)
CREATE OR REPLACE FUNCTION actualizar_stock_orden()
RETURNS TRIGGER AS $$
-- ... (código de la función)
$$ LANGUAGE plpgsql;
```

## 📊 Ejemplo de Uso

1. **Configurar Stock Inicial:**
   - Pan de Completo: 50 unidades
   - Pan de Sandwich: 30 unidades
   - Coca Cola: 20 litros

2. **Vender Productos:**
   - Vender 2 Completos → Descuenta 2 panes de "Pan de Completo"
   - Vender 1 Sandwich → Descuenta 1 pan de "Pan de Sandwich"
   - Vender 3 Coca Cola → Descuenta 3 litros de "Coca Cola"

3. **Verificar Stock:**
   - Pan de Completo: 48 unidades
   - Pan de Sandwich: 29 unidades
   - Coca Cola: 17 litros

