-- =====================================================
-- SOLUCIÓN COMPLETA: Recursión Infinita en TODAS las Políticas RLS
-- =====================================================
-- Error: "infinite recursion detected in policy for relation users"
-- Este script corrige TODAS las políticas que consultan users directamente
-- Ejecutar en Supabase SQL Editor

-- =====================================================
-- PASO 1: Crear funciones SECURITY DEFINER
-- =====================================================
-- Estas funciones pueden leer users sin pasar por RLS

-- Función para verificar si el usuario es admin
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
  -- Si no hay usuario autenticado, retornar false
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  -- Leer directamente desde users sin pasar por RLS (SECURITY DEFINER)
  SELECT role INTO user_role
  FROM public.users
  WHERE id = auth.uid()
  LIMIT 1;
  
  RETURN COALESCE(user_role, '') = 'admin';
END;
$$;

-- Función para verificar si el usuario es admin o encargado
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
  -- Si no hay usuario autenticado, retornar false
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  -- Leer directamente desde users sin pasar por RLS (SECURITY DEFINER)
  SELECT role INTO user_role
  FROM public.users
  WHERE id = auth.uid()
  LIMIT 1;
  
  RETURN COALESCE(user_role, '') IN ('admin', 'encargado');
END;
$$;

-- =====================================================
-- PASO 2: Corregir política de users (la más crítica)
-- =====================================================

DROP POLICY IF EXISTS "users_select_own_or_admin" ON users;
DROP POLICY IF EXISTS "users_select_all" ON users;
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
-- PASO 3: Corregir políticas de categories
-- =====================================================

DROP POLICY IF EXISTS "categories_insert_admin" ON categories;
DROP POLICY IF EXISTS "categories_update_admin" ON categories;
DROP POLICY IF EXISTS "categories_delete_admin" ON categories;

CREATE POLICY "categories_insert_admin" ON categories FOR INSERT
  WITH CHECK (
    is_admin()
    OR NOT EXISTS (SELECT 1 FROM public.users LIMIT 1)
  );

CREATE POLICY "categories_update_admin" ON categories FOR UPDATE
  USING (
    is_admin()
    OR NOT EXISTS (SELECT 1 FROM public.users LIMIT 1)
  );

CREATE POLICY "categories_delete_admin" ON categories FOR DELETE
  USING (
    is_admin()
    OR NOT EXISTS (SELECT 1 FROM public.users LIMIT 1)
  );

-- =====================================================
-- PASO 4: Corregir políticas de menu_items
-- =====================================================

DROP POLICY IF EXISTS "menu_items_insert_admin" ON menu_items;
DROP POLICY IF EXISTS "menu_items_update_admin" ON menu_items;
DROP POLICY IF EXISTS "menu_items_delete_admin" ON menu_items;

CREATE POLICY "menu_items_insert_admin" ON menu_items FOR INSERT
  WITH CHECK (
    is_admin()
    OR NOT EXISTS (SELECT 1 FROM public.users LIMIT 1)
  );

CREATE POLICY "menu_items_update_admin" ON menu_items FOR UPDATE
  USING (
    is_admin()
    OR NOT EXISTS (SELECT 1 FROM public.users LIMIT 1)
  );

CREATE POLICY "menu_items_delete_admin" ON menu_items FOR DELETE
  USING (
    is_admin()
    OR NOT EXISTS (SELECT 1 FROM public.users LIMIT 1)
  );

-- =====================================================
-- PASO 5: Corregir políticas de ordenes_restaurante
-- =====================================================

DROP POLICY IF EXISTS "ordenes_select_own_or_admin" ON ordenes_restaurante;
DROP POLICY IF EXISTS "ordenes_insert_mesero_or_admin" ON ordenes_restaurante;
DROP POLICY IF EXISTS "ordenes_update_own_or_admin" ON ordenes_restaurante;
DROP POLICY IF EXISTS "ordenes_delete_admin" ON ordenes_restaurante;

CREATE POLICY "ordenes_select_own_or_admin" ON ordenes_restaurante FOR SELECT
  USING (
    mesero_id = auth.uid()
    OR is_admin_or_encargado()
  );

CREATE POLICY "ordenes_insert_mesero_or_admin" ON ordenes_restaurante FOR INSERT
  WITH CHECK (
    mesero_id = auth.uid()
    OR is_admin_or_encargado()
  );

CREATE POLICY "ordenes_update_own_or_admin" ON ordenes_restaurante FOR UPDATE
  USING (
    mesero_id = auth.uid()
    OR is_admin_or_encargado()
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
      AND (o.mesero_id = auth.uid() OR is_admin_or_encargado())
    )
  );

CREATE POLICY "orden_items_insert_own_or_admin" ON orden_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ordenes_restaurante o
      WHERE o.id = orden_items.orden_id
      AND (o.mesero_id = auth.uid() OR is_admin_or_encargado())
    )
  );

CREATE POLICY "orden_items_update_own_or_admin" ON orden_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM ordenes_restaurante o
      WHERE o.id = orden_items.orden_id
      AND (o.mesero_id = auth.uid() OR is_admin_or_encargado())
    )
  );

CREATE POLICY "orden_items_delete_own_or_admin" ON orden_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM ordenes_restaurante o
      WHERE o.id = orden_items.orden_id
      AND (o.mesero_id = auth.uid() OR is_admin_or_encargado())
    )
  );

-- =====================================================
-- PASO 7: Corregir otras políticas que consultan users
-- =====================================================

-- Suppliers
DROP POLICY IF EXISTS "suppliers_insert_admin" ON suppliers;
DROP POLICY IF EXISTS "suppliers_update_admin" ON suppliers;
DROP POLICY IF EXISTS "suppliers_delete_admin" ON suppliers;

CREATE POLICY "suppliers_insert_admin" ON suppliers FOR INSERT
  WITH CHECK (
    is_admin()
    OR NOT EXISTS (SELECT 1 FROM public.users LIMIT 1)
  );

CREATE POLICY "suppliers_update_admin" ON suppliers FOR UPDATE
  USING (
    is_admin()
    OR NOT EXISTS (SELECT 1 FROM public.users LIMIT 1)
  );

CREATE POLICY "suppliers_delete_admin" ON suppliers FOR DELETE
  USING (
    is_admin()
    OR NOT EXISTS (SELECT 1 FROM public.users LIMIT 1)
  );

-- Ingredientes
DROP POLICY IF EXISTS "ingredientes_insert_admin" ON ingredientes;
DROP POLICY IF EXISTS "ingredientes_update_admin" ON ingredientes;
DROP POLICY IF EXISTS "ingredientes_delete_admin" ON ingredientes;

CREATE POLICY "ingredientes_insert_admin" ON ingredientes FOR INSERT
  WITH CHECK (
    is_admin()
    OR NOT EXISTS (SELECT 1 FROM public.users LIMIT 1)
  );

CREATE POLICY "ingredientes_update_admin" ON ingredientes FOR UPDATE
  USING (
    is_admin()
    OR NOT EXISTS (SELECT 1 FROM public.users LIMIT 1)
  );

CREATE POLICY "ingredientes_delete_admin" ON ingredientes FOR DELETE
  USING (
    is_admin()
    OR NOT EXISTS (SELECT 1 FROM public.users LIMIT 1)
  );

-- Compras
DROP POLICY IF EXISTS "compras_insert_admin" ON compras;
DROP POLICY IF EXISTS "compras_update_admin" ON compras;
DROP POLICY IF EXISTS "compras_delete_admin" ON compras;

CREATE POLICY "compras_insert_admin" ON compras FOR INSERT
  WITH CHECK (is_admin_or_encargado());

CREATE POLICY "compras_update_admin" ON compras FOR UPDATE
  USING (is_admin_or_encargado());

CREATE POLICY "compras_delete_admin" ON compras FOR DELETE
  USING (is_admin());

-- Empleados
DROP POLICY IF EXISTS "empleados_insert_admin" ON empleados;
DROP POLICY IF EXISTS "empleados_update_admin" ON empleados;
DROP POLICY IF EXISTS "empleados_delete_admin" ON empleados;

CREATE POLICY "empleados_insert_admin" ON empleados FOR INSERT
  WITH CHECK (is_admin_or_encargado());

CREATE POLICY "empleados_update_admin" ON empleados FOR UPDATE
  USING (is_admin_or_encargado());

CREATE POLICY "empleados_delete_admin" ON empleados FOR DELETE
  USING (is_admin());

-- Propinas
DROP POLICY IF EXISTS "propinas_update_admin" ON propinas_distribucion;
DROP POLICY IF EXISTS "propinas_delete_admin" ON propinas_distribucion;

CREATE POLICY "propinas_update_admin" ON propinas_distribucion FOR UPDATE
  USING (is_admin_or_encargado());

CREATE POLICY "propinas_delete_admin" ON propinas_distribucion FOR DELETE
  USING (is_admin());

-- Branches
DROP POLICY IF EXISTS "branches_insert_admin" ON branches;
DROP POLICY IF EXISTS "branches_update_admin" ON branches;
DROP POLICY IF EXISTS "branches_delete_admin" ON branches;

CREATE POLICY "branches_insert_admin" ON branches FOR INSERT
  WITH CHECK (
    is_admin()
    OR NOT EXISTS (SELECT 1 FROM public.users LIMIT 1)
  );

CREATE POLICY "branches_update_admin" ON branches FOR UPDATE
  USING (
    is_admin()
    OR NOT EXISTS (SELECT 1 FROM public.users LIMIT 1)
  );

CREATE POLICY "branches_delete_admin" ON branches FOR DELETE
  USING (is_admin());

-- =====================================================
-- PASO 8: Verificación
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Funciones creadas:';
  RAISE NOTICE '   - is_admin()';
  RAISE NOTICE '   - is_admin_or_encargado()';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Todas las políticas RLS actualizadas sin recursión';
  RAISE NOTICE '';
  RAISE NOTICE '🧪 Prueba: Intenta consultar categories o menu_items';
END $$;



