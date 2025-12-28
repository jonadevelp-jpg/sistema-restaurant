-- =====================================================
-- SOLUCIÓN COMPLETA: Corregir TODAS las Recursiones RLS
-- =====================================================
-- Este script corrige TODAS las políticas RLS que causan recursión infinita
-- Ejecutar en Supabase SQL Editor

-- =====================================================
-- PASO 1: Crear funciones SECURITY DEFINER
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
-- PASO 2: Corregir políticas de users
-- =====================================================

DROP POLICY IF EXISTS "users_select_own_or_admin" ON users;
DROP POLICY IF EXISTS "users_insert_admin" ON users;
DROP POLICY IF EXISTS "users_update_admin" ON users;
DROP POLICY IF EXISTS "users_delete_admin" ON users;

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
-- PASO 3: Corregir políticas de categories (lectura pública)
-- =====================================================

DROP POLICY IF EXISTS "categories_select_all" ON categories;
DROP POLICY IF EXISTS "categories_select_public" ON categories;
DROP POLICY IF EXISTS "categories_insert_admin" ON categories;
DROP POLICY IF EXISTS "categories_update_admin" ON categories;
DROP POLICY IF EXISTS "categories_delete_admin" ON categories;

CREATE POLICY "categories_select_public" ON categories FOR SELECT USING (true);
CREATE POLICY "categories_insert_admin" ON categories FOR INSERT
  WITH CHECK (is_admin_or_encargado() OR NOT EXISTS (SELECT 1 FROM public.users LIMIT 1));
CREATE POLICY "categories_update_admin" ON categories FOR UPDATE
  USING (is_admin_or_encargado() OR NOT EXISTS (SELECT 1 FROM public.users LIMIT 1));
CREATE POLICY "categories_delete_admin" ON categories FOR DELETE
  USING (is_admin());

-- =====================================================
-- PASO 4: Corregir políticas de menu_items (lectura pública)
-- =====================================================

DROP POLICY IF EXISTS "menu_items_select_all" ON menu_items;
DROP POLICY IF EXISTS "menu_items_select_public" ON menu_items;
DROP POLICY IF EXISTS "menu_items_insert_admin" ON menu_items;
DROP POLICY IF EXISTS "menu_items_update_admin" ON menu_items;
DROP POLICY IF EXISTS "menu_items_delete_admin" ON menu_items;

CREATE POLICY "menu_items_select_public" ON menu_items FOR SELECT USING (true);
CREATE POLICY "menu_items_insert_admin" ON menu_items FOR INSERT
  WITH CHECK (is_admin_or_encargado() OR NOT EXISTS (SELECT 1 FROM public.users LIMIT 1));
CREATE POLICY "menu_items_update_admin" ON menu_items FOR UPDATE
  USING (is_admin_or_encargado() OR NOT EXISTS (SELECT 1 FROM public.users LIMIT 1));
CREATE POLICY "menu_items_delete_admin" ON menu_items FOR DELETE
  USING (is_admin());

-- =====================================================
-- PASO 5: Corregir políticas de ordenes_restaurante
-- =====================================================

DROP POLICY IF EXISTS "ordenes_select_own_or_admin" ON ordenes_restaurante;
DROP POLICY IF EXISTS "ordenes_insert_mesero_or_admin" ON ordenes_restaurante;
DROP POLICY IF EXISTS "ordenes_update_own_or_admin" ON ordenes_restaurante;
DROP POLICY IF EXISTS "ordenes_delete_admin" ON ordenes_restaurante;

CREATE POLICY "ordenes_select_own_or_admin" ON ordenes_restaurante FOR SELECT
  USING (
    is_admin_or_encargado()
    OR
    mesero_id = auth.uid()
  );

CREATE POLICY "ordenes_insert_mesero_or_admin" ON ordenes_restaurante FOR INSERT
  WITH CHECK (
    is_admin_or_encargado()
    OR
    mesero_id = auth.uid()
  );

CREATE POLICY "ordenes_update_own_or_admin" ON ordenes_restaurante FOR UPDATE
  USING (
    is_admin_or_encargado()
    OR
    mesero_id = auth.uid()
  );

CREATE POLICY "ordenes_delete_admin" ON ordenes_restaurante FOR DELETE
  USING (is_admin());

-- =====================================================
-- PASO 6: Corregir políticas de orden_items
-- =====================================================

DROP POLICY IF EXISTS "orden_items_select_own_or_admin" ON orden_items;
DROP POLICY IF EXISTS "orden_items_insert_own_or_admin" ON orden_items;
DROP POLICY IF EXISTS "orden_items_update_own_or_admin" ON orden_items;
DROP POLICY IF EXISTS "orden_items_delete_own_or_admin" ON orden_items;

CREATE POLICY "orden_items_select_own_or_admin" ON orden_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ordenes_restaurante o
      WHERE o.id = orden_items.orden_id
      AND (
        is_admin_or_encargado()
        OR
        o.mesero_id = auth.uid()
      )
    )
  );

CREATE POLICY "orden_items_insert_own_or_admin" ON orden_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ordenes_restaurante o
      WHERE o.id = orden_items.orden_id
      AND (
        is_admin_or_encargado()
        OR
        o.mesero_id = auth.uid()
      )
    )
  );

CREATE POLICY "orden_items_update_own_or_admin" ON orden_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM ordenes_restaurante o
      WHERE o.id = orden_items.orden_id
      AND (
        is_admin_or_encargado()
        OR
        o.mesero_id = auth.uid()
      )
    )
  );

CREATE POLICY "orden_items_delete_own_or_admin" ON orden_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM ordenes_restaurante o
      WHERE o.id = orden_items.orden_id
      AND (
        is_admin_or_encargado()
        OR
        o.mesero_id = auth.uid()
      )
    )
  );

-- =====================================================
-- PASO 7: Verificar que RLS está habilitado
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_restaurante ENABLE ROW LEVEL SECURITY;
ALTER TABLE orden_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PASO 8: Verificación final
-- =====================================================

DO $$
DECLARE
  funciones_count INTEGER;
  users_policies INTEGER;
  categories_policies INTEGER;
  menu_items_policies INTEGER;
  ordenes_policies INTEGER;
  orden_items_policies INTEGER;
BEGIN
  SELECT COUNT(*) INTO funciones_count
  FROM pg_proc
  WHERE proname IN ('is_admin', 'is_admin_or_encargado');
  
  SELECT COUNT(*) INTO users_policies
  FROM pg_policies WHERE tablename = 'users';
  
  SELECT COUNT(*) INTO categories_policies
  FROM pg_policies WHERE tablename = 'categories';
  
  SELECT COUNT(*) INTO menu_items_policies
  FROM pg_policies WHERE tablename = 'menu_items';
  
  SELECT COUNT(*) INTO ordenes_policies
  FROM pg_policies WHERE tablename = 'ordenes_restaurante';
  
  SELECT COUNT(*) INTO orden_items_policies
  FROM pg_policies WHERE tablename = 'orden_items';
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ VERIFICACIÓN FINAL - TODAS LAS POLÍTICAS';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 Funciones anti-recursión: %', funciones_count;
  IF funciones_count < 2 THEN
    RAISE NOTICE '   ❌ ERROR: Faltan funciones';
  ELSE
    RAISE NOTICE '   ✅ Creadas correctamente';
  END IF;
  RAISE NOTICE '';
  RAISE NOTICE '📊 Políticas por tabla:';
  RAISE NOTICE '   - users: %', users_policies;
  RAISE NOTICE '   - categories: %', categories_policies;
  RAISE NOTICE '   - menu_items: %', menu_items_policies;
  RAISE NOTICE '   - ordenes_restaurante: %', ordenes_policies;
  RAISE NOTICE '   - orden_items: %', orden_items_policies;
  RAISE NOTICE '';
  RAISE NOTICE '🧪 Prueba ahora:';
  RAISE NOTICE '   1. Recarga la página /admin/mesas (Ctrl+F5)';
  RAISE NOTICE '   2. Los pedidos deberían cargar correctamente';
  RAISE NOTICE '   3. El menú digital debería funcionar';
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
END $$;



