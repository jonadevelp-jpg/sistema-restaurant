# 🔄 Solución: Sincronización de Mesas entre Admin y Mesero

## ⚠️ Problema

Cuando un **admin** ve que hay mesas ocupadas, el **mesero** no las ve. Esto causa desincronización porque:

- El mesero solo puede ver las órdenes donde él es el `mesero_id`
- Si un admin crea una orden, el `mesero_id` puede ser NULL o del admin
- El mesero no ve esas órdenes, entonces el cálculo de mesas ocupadas es incorrecto

---

## ✅ Solución

Se creó la migración **`013_fix_mesero_ver_todas_ordenes.sql`** que permite a los meseros:

1. **VER todas las órdenes activas** (`pending`, `preparing`, `ready`, `served`)
   - Esto permite que vean el estado correcto de las mesas
   - Sincroniza la vista entre admin y mesero

2. **MODIFICAR solo sus propias órdenes**
   - La política de UPDATE sigue siendo restrictiva
   - Los meseros solo pueden modificar órdenes donde son el `mesero_id`

---

## 📋 Pasos para Aplicar la Solución

### 1. Ejecutar la Migración en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **SQL Editor**
3. Abre el archivo `database/migrations/013_fix_mesero_ver_todas_ordenes.sql`
4. Copia todo el contenido
5. Pégalo en el SQL Editor
6. Haz clic en **Run** o presiona `Ctrl + Enter`

### 2. Verificar que Funcionó

Después de ejecutar, deberías ver una tabla con las políticas actualizadas:

```
schemaname | tablename        | policyname                    | ...
-----------|------------------|-------------------------------|----
public     | ordenes_restaurante | ordenes_select_own_or_admin | ...
public     | orden_items      | orden_items_select_own_or_admin | ...
```

### 3. Probar la Sincronización

1. **Como Admin:**
   - Crea una orden en una mesa
   - Verifica que la mesa aparezca como "ocupada"

2. **Como Mesero:**
   - Inicia sesión con una cuenta de mesero
   - Ve a "Mesas (POS)"
   - Deberías ver la misma mesa como "ocupada" ✅

---

## 🔒 Seguridad

**IMPORTANTE**: Esta solución es segura porque:

- ✅ Los meseros **solo pueden VER** las órdenes activas
- ✅ Los meseros **NO pueden MODIFICAR** órdenes de otros meseros
- ✅ La política de UPDATE sigue siendo restrictiva
- ✅ Los meseros **NO pueden VER** órdenes pagadas de otros meseros (solo activas)

**Lo que cambió:**
- Antes: Mesero veía solo sus órdenes
- Ahora: Mesero ve todas las órdenes activas (para sincronización)

**Lo que NO cambió:**
- Mesero solo puede modificar sus propias órdenes
- Mesero solo puede ver órdenes pagadas propias

---

## 🧪 Verificación

### Verificar Políticas Actuales

Ejecuta esto en Supabase SQL Editor:

```sql
SELECT 
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('ordenes_restaurante', 'orden_items')
AND policyname LIKE '%select%'
ORDER BY tablename, policyname;
```

Deberías ver que `ordenes_select_own_or_admin` incluye la condición para meseros ver órdenes activas.

---

## 📝 Cambios Técnicos

### Política Anterior (Problemática):
```sql
-- Mesero solo veía órdenes donde mesero_id = auth.uid()
mesero_id = auth.uid() OR is_admin_or_encargado()
```

### Política Nueva (Corregida):
```sql
-- Mesero ve todas las órdenes activas
is_admin_or_encargado()
OR
(es_mesero() AND estado IN ('pending', 'preparing', 'ready', 'served'))
OR
mesero_id = auth.uid()
```

---

## 🆘 Si No Funciona

1. **Verifica que ejecutaste la migración:**
   - Revisa el SQL Editor en Supabase
   - Debe mostrar que las políticas se actualizaron

2. **Verifica que el usuario sea mesero:**
   - En Supabase, ve a Authentication → Users
   - Verifica que el usuario tenga rol `mesero` en la tabla `users`

3. **Limpia la caché del navegador:**
   - Presiona `Ctrl + Shift + R` para recargar sin caché
   - O cierra y abre el navegador

4. **Revisa la consola del navegador:**
   - Presiona `F12` → Console
   - Busca errores relacionados con Supabase o RLS

---

**¡Después de ejecutar la migración, las mesas deberían sincronizarse correctamente entre admin y mesero!** ✅







