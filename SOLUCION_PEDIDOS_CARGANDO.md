# 🔧 Solución: Pedidos se queda cargando y no se pueden crear órdenes

## ❌ Problemas reportados:
1. La página de pedidos se queda cargando (tanto "Pedidos en Barra" como "Pedidos Para Llevar")
2. El botón "Nueva Orden Barra" no funciona
3. El botón "Nueva Orden Para Llevar" no funciona

## ✅ Solución paso a paso:

### Paso 1: Ejecutar script SQL para corregir permisos

1. Abre **Supabase Dashboard** → **SQL Editor**
2. Copia y pega el contenido completo de: `database/FIX_PERMISOS_PEDIDOS.sql`
3. Haz clic en **RUN** o presiona `Ctrl+Enter`
4. Verifica que aparezca el mensaje: `✅ Políticas de permisos actualizadas`

### Paso 2: Verificar tu usuario en la tabla `users`

Ejecuta este SQL en Supabase para verificar tu usuario:

```sql
-- Ver tu usuario actual
SELECT 
  id,
  email,
  name,
  role,
  created_at
FROM users
WHERE id = auth.uid();
```

**Si no aparece ningún resultado o tu rol no es `admin` o `encargado`:**

1. Obtén tu UUID de usuario desde Supabase Auth:
   - Ve a **Authentication** → **Users**
   - Copia el UUID del usuario

2. Ejecuta este SQL (reemplaza `TU_UUID_AQUI` con tu UUID real):

```sql
-- Crear o actualizar tu usuario como admin
INSERT INTO users (id, role, name, email)
VALUES (
  'TU_UUID_AQUI',  -- ⚠️ PEGA AQUÍ TU UUID
  'admin',
  'Administrador',
  'tu-email@ejemplo.com'  -- ⚠️ CAMBIA POR TU EMAIL
)
ON CONFLICT (id) DO UPDATE
SET role = 'admin', name = 'Administrador';
```

### Paso 3: Verificar políticas RLS

Ejecuta este SQL para verificar que las políticas estén correctas:

```sql
-- Ver políticas de ordenes_restaurante
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'ordenes_restaurante'
ORDER BY policyname;
```

Deberías ver al menos:
- `ordenes_select_all_admin_encargado` (SELECT)
- `ordenes_insert_mesero_or_admin` (INSERT)

### Paso 4: Recargar la aplicación

1. **Cierra sesión** en el panel de admin
2. **Inicia sesión nuevamente**
3. **Recarga la página** de pedidos (Ctrl+F5 o Cmd+Shift+R)
4. Abre la **consola del navegador** (F12) para ver los logs

## 🔍 Debugging

Si después de ejecutar el script SQL sigue sin funcionar:

1. **Abre la consola del navegador** (F12 → Console)
2. Busca mensajes que empiecen con:
   - `🔄` (proceso iniciado)
   - `✅` (éxito)
   - `❌` (error)
3. Copia los mensajes de error y compártelos

### Errores comunes:

**Error: "No tienes acceso para ver las órdenes"**
- ✅ Solución: Ejecuta `FIX_PERMISOS_PEDIDOS.sql`
- Verifica que tu usuario tenga rol `admin` o `encargado`

**Error: "Token inválido o expirado"**
- ✅ Solución: Cierra sesión y vuelve a iniciar sesión

**Error: "PGRST301" o "permission denied"**
- ✅ Solución: Las políticas RLS están bloqueando. Ejecuta el script SQL.

**La página se queda cargando indefinidamente**
- ✅ Solución: 
  1. Ejecuta el script SQL
  2. Verifica la consola del navegador para ver el error específico
  3. Asegúrate de que tu usuario tenga permisos

## 📝 Notas importantes:

- El script SQL **NO elimina datos**, solo corrige permisos
- Puedes ejecutarlo múltiples veces sin problemas
- Si tienes dudas, revisa la consola del navegador (F12) para ver errores específicos



