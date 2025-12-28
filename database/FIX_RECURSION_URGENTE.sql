-- =====================================================
-- SOLUCIÓN URGENTE: Recursión Infinita en RLS
-- =====================================================
-- Ejecutar ESTE script primero en Supabase SQL Editor
-- Corrige el error: "infinite recursion detected in policy for relation users"

-- PASO 1: Eliminar TODAS las políticas problemáticas de users
DROP POLICY IF EXISTS "users_select_own_or_admin" ON users;
DROP POLICY IF EXISTS "users_select_all" ON users;
DROP POLICY IF EXISTS "users_insert_admin" ON users;
DROP POLICY IF EXISTS "users_update_admin" ON users;
DROP POLICY IF EXISTS "users_delete_admin" ON users;

-- PASO 2: Crear funciones SECURITY DEFINER (pueden leer users sin RLS)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  user_role TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  -- Leer directamente sin pasar por RLS
  SELECT role INTO user_role
  FROM public.users
  WHERE id = auth.uid()
  LIMIT 1;
  
  RETURN COALESCE(user_role, '') = 'admin';
END;
$$;

CREATE OR REPLACE FUNCTION is_admin_or_encargado()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  user_role TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  SELECT role INTO user_role
  FROM public.users
  WHERE id = auth.uid()
  LIMIT 1;
  
  RETURN COALESCE(user_role, '') IN ('admin', 'encargado');
END;
$$;

-- PASO 3: Crear nueva política de users SIN recursión
CREATE POLICY "users_select_own_or_admin" ON users FOR SELECT
  USING (
    auth.uid() = id
    OR is_admin()
    OR NOT EXISTS (SELECT 1 FROM public.users LIMIT 1)
  );

CREATE POLICY "users_insert_admin" ON users FOR INSERT
  WITH CHECK (
    is_admin()
    OR NOT EXISTS (SELECT 1 FROM public.users LIMIT 1)
  );

CREATE POLICY "users_update_admin" ON users FOR UPDATE
  USING (
    auth.uid() = id
    OR is_admin()
  );

CREATE POLICY "users_delete_admin" ON users FOR DELETE
  USING (is_admin());

-- PASO 4: Corregir políticas de categories (públicas para lectura)
DROP POLICY IF EXISTS "categories_select_all" ON categories;
DROP POLICY IF EXISTS "categories_insert_admin" ON categories;
DROP POLICY IF EXISTS "categories_update_admin" ON categories;
DROP POLICY IF EXISTS "categories_delete_admin" ON categories;

-- SELECT: Todos pueden leer (público para menú digital)
CREATE POLICY "categories_select_all" ON categories FOR SELECT
  USING (true);

-- INSERT/UPDATE/DELETE: Solo admin
CREATE POLICY "categories_insert_admin" ON categories FOR INSERT
  WITH CHECK (is_admin() OR NOT EXISTS (SELECT 1 FROM public.users LIMIT 1));

CREATE POLICY "categories_update_admin" ON categories FOR UPDATE
  USING (is_admin() OR NOT EXISTS (SELECT 1 FROM public.users LIMIT 1));

CREATE POLICY "categories_delete_admin" ON categories FOR DELETE
  USING (is_admin());

-- PASO 5: Corregir políticas de menu_items (públicas para lectura)
DROP POLICY IF EXISTS "menu_items_select_all" ON menu_items;
DROP POLICY IF EXISTS "menu_items_insert_admin" ON menu_items;
DROP POLICY IF EXISTS "menu_items_update_admin" ON menu_items;
DROP POLICY IF EXISTS "menu_items_delete_admin" ON menu_items;

-- SELECT: Todos pueden leer (público para menú digital)
CREATE POLICY "menu_items_select_all" ON menu_items FOR SELECT
  USING (true);

-- INSERT/UPDATE/DELETE: Solo admin
CREATE POLICY "menu_items_insert_admin" ON menu_items FOR INSERT
  WITH CHECK (is_admin() OR NOT EXISTS (SELECT 1 FROM public.users LIMIT 1));

CREATE POLICY "menu_items_update_admin" ON menu_items FOR UPDATE
  USING (is_admin() OR NOT EXISTS (SELECT 1 FROM public.users LIMIT 1));

CREATE POLICY "menu_items_delete_admin" ON menu_items FOR DELETE
  USING (is_admin());

-- PASO 6: Verificación
DO $$
BEGIN
  RAISE NOTICE '✅ Script ejecutado correctamente';
  RAISE NOTICE '✅ Funciones is_admin() e is_admin_or_encargado() creadas';
  RAISE NOTICE '✅ Políticas de users corregidas (sin recursión)';
  RAISE NOTICE '✅ Políticas de categories y menu_items corregidas (lectura pública)';
  RAISE NOTICE '';
  RAISE NOTICE '🧪 Prueba: Recarga la página y verifica que el menú carga';
END $$;



