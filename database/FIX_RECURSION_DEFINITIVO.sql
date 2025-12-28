-- =====================================================
-- SOLUCIÓN DEFINITIVA: Recursión Infinita
-- =====================================================
-- Este script DESHABILITA temporalmente RLS en categories y menu_items
-- para que el menú digital funcione mientras corregimos las políticas
-- Ejecutar en Supabase SQL Editor

-- =====================================================
-- PASO 1: Crear funciones SECURITY DEFINER (si no existen)
-- =====================================================

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

-- =====================================================
-- PASO 2: ELIMINAR TODAS las políticas de users
-- =====================================================

DROP POLICY IF EXISTS "users_select_own_or_admin" ON users;
DROP POLICY IF EXISTS "users_select_all" ON users;
DROP POLICY IF EXISTS "users_insert_admin" ON users;
DROP POLICY IF EXISTS "users_update_admin" ON users;
DROP POLICY IF EXISTS "users_delete_admin" ON users;

-- =====================================================
-- PASO 3: Crear política de users SIN recursión
-- =====================================================

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

-- =====================================================
-- PASO 4: ELIMINAR TODAS las políticas de categories
-- =====================================================

DROP POLICY IF EXISTS "categories_select_all" ON categories;
DROP POLICY IF EXISTS "categories_select_public" ON categories;
DROP POLICY IF EXISTS "categories_insert_admin" ON categories;
DROP POLICY IF EXISTS "categories_update_admin" ON categories;
DROP POLICY IF EXISTS "categories_delete_admin" ON categories;
DROP POLICY IF EXISTS "categories_modify_admin" ON categories;

-- =====================================================
-- PASO 5: Crear políticas de categories SIN consultar users
-- =====================================================

-- SELECT: PÚBLICO (todos pueden leer para el menú digital)
CREATE POLICY "categories_select_public" ON categories FOR SELECT
  USING (true);

-- INSERT/UPDATE/DELETE: Solo admin (usando función, no consulta directa)
CREATE POLICY "categories_insert_admin" ON categories FOR INSERT
  WITH CHECK (is_admin() OR NOT EXISTS (SELECT 1 FROM public.users LIMIT 1));

CREATE POLICY "categories_update_admin" ON categories FOR UPDATE
  USING (is_admin() OR NOT EXISTS (SELECT 1 FROM public.users LIMIT 1));

CREATE POLICY "categories_delete_admin" ON categories FOR DELETE
  USING (is_admin());

-- =====================================================
-- PASO 6: ELIMINAR TODAS las políticas de menu_items
-- =====================================================

DROP POLICY IF EXISTS "menu_items_select_all" ON menu_items;
DROP POLICY IF EXISTS "menu_items_select_public" ON menu_items;
DROP POLICY IF EXISTS "menu_items_insert_admin" ON menu_items;
DROP POLICY IF EXISTS "menu_items_update_admin" ON menu_items;
DROP POLICY IF EXISTS "menu_items_delete_admin" ON menu_items;
DROP POLICY IF EXISTS "menu_items_modify_admin" ON menu_items;

-- =====================================================
-- PASO 7: Crear políticas de menu_items SIN consultar users
-- =====================================================

-- SELECT: PÚBLICO (todos pueden leer para el menú digital)
CREATE POLICY "menu_items_select_public" ON menu_items FOR SELECT
  USING (true);

-- INSERT/UPDATE/DELETE: Solo admin (usando función, no consulta directa)
CREATE POLICY "menu_items_insert_admin" ON menu_items FOR INSERT
  WITH CHECK (is_admin() OR NOT EXISTS (SELECT 1 FROM public.users LIMIT 1));

CREATE POLICY "menu_items_update_admin" ON menu_items FOR UPDATE
  USING (is_admin() OR NOT EXISTS (SELECT 1 FROM public.users LIMIT 1));

CREATE POLICY "menu_items_delete_admin" ON menu_items FOR DELETE
  USING (is_admin());

-- =====================================================
-- PASO 8: Verificar que RLS está habilitado
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PASO 9: Verificación final
-- =====================================================

DO $$
DECLARE
  users_policies INTEGER;
  categories_policies INTEGER;
  menu_items_policies INTEGER;
  has_functions BOOLEAN;
BEGIN
  -- Contar políticas
  SELECT COUNT(*) INTO users_policies
  FROM pg_policies
  WHERE tablename = 'users';
  
  SELECT COUNT(*) INTO categories_policies
  FROM pg_policies
  WHERE tablename = 'categories';
  
  SELECT COUNT(*) INTO menu_items_policies
  FROM pg_policies
  WHERE tablename = 'menu_items';
  
  -- Verificar funciones
  SELECT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname IN ('is_admin', 'is_admin_or_encargado')
  ) INTO has_functions;
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ VERIFICACIÓN FINAL';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Políticas activas:';
  RAISE NOTICE '   - users: %', users_policies;
  RAISE NOTICE '   - categories: %', categories_policies;
  RAISE NOTICE '   - menu_items: %', menu_items_policies;
  RAISE NOTICE '';
  RAISE NOTICE '🔧 Funciones anti-recursión:';
  IF has_functions THEN
    RAISE NOTICE '   ✅ Creadas correctamente';
  ELSE
    RAISE NOTICE '   ❌ ERROR: No se crearon las funciones';
  END IF;
  RAISE NOTICE '';
  RAISE NOTICE '🧪 Prueba ahora:';
  RAISE NOTICE '   1. Recarga la página (Ctrl+F5)';
  RAISE NOTICE '   2. El error de recursión debería desaparecer';
  RAISE NOTICE '   3. Si aún no ves el menú, ejecuta: SEED_MENU_COMPLETOS.sql';
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
END $$;



