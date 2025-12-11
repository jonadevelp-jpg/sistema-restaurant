# 🔧 Solución: Error de Recursión en RLS

## ❌ Error
```
Error cargando órdenes: infinite recursion detected in policy for relation "users"
```

## 🔍 Causa
Las políticas RLS (Row Level Security) de las tablas `ordenes_restaurante` y `orden_items` consultan la tabla `users` para verificar roles, pero `users` también tiene RLS activado, creando un ciclo infinito.

## ✅ Solución

Ejecuta la migración `011_fix_rls_recursion.sql` en Supabase SQL Editor:

### Paso 1: Abrir SQL Editor
1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Abre el **SQL Editor**

### Paso 2: Ejecutar Migración
1. Copia el contenido completo de:
   ```
   app-final/database/migrations/011_fix_rls_recursion.sql
   ```
2. Pégalo en el SQL Editor
3. Haz clic en **Run** o presiona `Ctrl+Enter`

### Paso 3: Verificar
Deberías ver un mensaje de éxito y una lista de las funciones creadas:
- `get_user_role`
- `is_admin_or_encargado`
- `is_admin`

## 🎯 Qué Hace Esta Migración

1. **Crea funciones SECURITY DEFINER:**
   - Estas funciones pueden leer `users` sin pasar por RLS
   - Evitan la recursión infinita

2. **Actualiza políticas de órdenes:**
   - Usa `is_admin_or_encargado()` en lugar de consultar `users` directamente
   - Usa `is_admin()` para verificaciones de admin

3. **Actualiza política de users:**
   - Usa `is_admin()` para evitar recursión

## 🧪 Probar

Después de ejecutar la migración:

1. Recarga la página `/admin/ordenes`
2. Debería cargar sin errores
3. Verifica que puedas ver las órdenes

## ⚠️ Si Aún Hay Problemas

Si después de ejecutar la migración aún hay errores:

1. **Verifica que las funciones existan:**
   ```sql
   SELECT proname FROM pg_proc 
   WHERE proname IN ('is_admin', 'is_admin_or_encargado');
   ```

2. **Verifica las políticas:**
   ```sql
   SELECT tablename, policyname, cmd
   FROM pg_policies
   WHERE tablename IN ('ordenes_restaurante', 'orden_items', 'users')
   ORDER BY tablename, policyname;
   ```

3. **Si necesitas resetear:**
   - Ejecuta la migración nuevamente (es idempotente)
   - O contacta al administrador

---

**Esta migración es segura y no afecta los datos existentes.**


