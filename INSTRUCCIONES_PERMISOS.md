# 🔐 Instrucciones: Aplicar Permisos RLS

## 📋 Resumen

Para que el sistema funcione correctamente, necesitas aplicar las migraciones de permisos que permiten a los usuarios crear órdenes y gestionar stock.

## ✅ Migraciones a Aplicar

Ejecuta estas migraciones en el **Supabase SQL Editor** en el siguiente orden:

### 1. Permisos de Órdenes (008)
**Archivo:** `database/migrations/008_fix_ordenes_permissions.sql`

**Qué hace:**
- Permite a meseros, encargados y admin crear órdenes
- Permite a meseros agregar items a sus órdenes

**Cómo aplicar:**
1. Abre Supabase Dashboard
2. Ve a SQL Editor
3. Copia y pega el contenido de `008_fix_ordenes_permissions.sql`
4. Ejecuta el script

### 2. Permisos de Ingredientes (009)
**Archivo:** `database/migrations/009_fix_ingredientes_permissions.sql`

**Qué hace:**
- Permite a encargados y admin crear/editar ingredientes
- Permite gestionar stock de ingredientes

**Cómo aplicar:**
1. En SQL Editor
2. Copia y pega el contenido de `009_fix_ingredientes_permissions.sql`
3. Ejecuta el script

### 3. Permisos de Movimientos de Stock (010)
**Archivo:** `database/migrations/010_fix_movimientos_permissions.sql`

**Qué hace:**
- Permite a encargados registrar movimientos de stock
- Necesario para ajustar inventario

**Cómo aplicar:**
1. En SQL Editor
2. Copia y pega el contenido de `010_fix_movimientos_permissions.sql`
3. Ejecuta el script

## 🧪 Verificar Permisos

Después de aplicar las migraciones, verifica que funcionen:

### Test 1: Crear Orden
1. Inicia sesión como mesero
2. Ve a `/admin/mesas`
3. Haz clic en una mesa libre
4. Deberías poder crear una orden sin errores

### Test 2: Agregar Items a Orden
1. En la orden creada
2. Agrega items del menú
3. Deberían agregarse sin problemas

### Test 3: Ajustar Stock
1. Inicia sesión como encargado o admin
2. Ve a `/admin/stock`
3. Haz clic en "Ajustar" en cualquier ingrediente
4. Deberías poder ajustar el stock

## ⚠️ Si Hay Errores

Si ves errores de permisos:

1. **Verifica que el usuario esté en la tabla `users`:**
   ```sql
   SELECT id, email, role FROM users WHERE id = auth.uid();
   ```

2. **Verifica las políticas activas:**
   ```sql
   SELECT tablename, policyname, cmd, with_check
   FROM pg_policies
   WHERE tablename IN ('ordenes_restaurante', 'orden_items', 'ingredientes', 'movimientos_stock')
   ORDER BY tablename, policyname;
   ```

3. **Si necesitas resetear permisos:**
   - Ejecuta las migraciones nuevamente (son idempotentes)
   - O contacta al administrador de la base de datos

## 📝 Notas

- Las migraciones son **idempotentes** (puedes ejecutarlas múltiples veces sin problemas)
- Los permisos se aplican inmediatamente después de ejecutar los scripts
- No necesitas reiniciar el servidor de la aplicación

---

**¿Problemas?** Revisa los logs de Supabase o contacta al desarrollador.


