-- =====================================================
-- SOLUCIÓN: Corregir Políticas RLS de ordenes_restaurante
-- =====================================================
-- Este script corrige las políticas de ordenes_restaurante para evitar recursión
-- y permitir que admin/encargado vean todas las órdenes
-- Ejecutar en Supabase SQL Editor

-- =====================================================
-- PASO 1: Asegurar que las funciones anti-recursión existan
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
-- PASO 2: ELIMINAR todas las políticas existentes de ordenes_restaurante
-- =====================================================

DROP POLICY IF EXISTS "ordenes_select_own_or_admin" ON ordenes_restaurante;
DROP POLICY IF EXISTS "ordenes_insert_mesero_or_admin" ON ordenes_restaurante;
DROP POLICY IF EXISTS "ordenes_update_own_or_admin" ON ordenes_restaurante;
DROP POLICY IF EXISTS "ordenes_delete_admin" ON ordenes_restaurante;

-- =====================================================
-- PASO 3: Crear nuevas políticas SIN recursión
-- =====================================================

-- SELECT: Admin/encargado ven TODAS las órdenes, meseros ven sus propias órdenes
CREATE POLICY "ordenes_select_own_or_admin" ON ordenes_restaurante FOR SELECT
  USING (
    -- Admin y encargado pueden ver TODAS las órdenes
    is_admin_or_encargado()
    OR
    -- Mesero puede ver sus propias órdenes
    mesero_id = auth.uid()
  );

-- INSERT: Admin/encargado pueden crear órdenes, meseros pueden crear sus propias órdenes
CREATE POLICY "ordenes_insert_mesero_or_admin" ON ordenes_restaurante FOR INSERT
  WITH CHECK (
    -- Admin y encargado pueden crear cualquier orden
    is_admin_or_encargado()
    OR
    -- Mesero puede crear órdenes asignadas a sí mismo
    mesero_id = auth.uid()
  );

-- UPDATE: Admin/encargado pueden actualizar cualquier orden, meseros solo sus propias órdenes
CREATE POLICY "ordenes_update_own_or_admin" ON ordenes_restaurante FOR UPDATE
  USING (
    -- Admin y encargado pueden actualizar cualquier orden
    is_admin_or_encargado()
    OR
    -- Mesero puede actualizar solo sus propias órdenes
    mesero_id = auth.uid()
  );

-- DELETE: Solo admin puede eliminar órdenes
CREATE POLICY "ordenes_delete_admin" ON ordenes_restaurante FOR DELETE
  USING (is_admin());

-- =====================================================
-- PASO 4: Corregir políticas de orden_items
-- =====================================================

DROP POLICY IF EXISTS "orden_items_select_own_or_admin" ON orden_items;
DROP POLICY IF EXISTS "orden_items_insert_own_or_admin" ON orden_items;
DROP POLICY IF EXISTS "orden_items_update_own_or_admin" ON orden_items;
DROP POLICY IF EXISTS "orden_items_delete_own_or_admin" ON orden_items;

-- SELECT: Ver items de órdenes que el usuario puede ver
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

-- INSERT: Insertar items en órdenes que el usuario puede modificar
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

-- UPDATE: Actualizar items de órdenes que el usuario puede modificar
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

-- DELETE: Eliminar items de órdenes que el usuario puede modificar
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
-- PASO 5: Verificar que RLS está habilitado
-- =====================================================

ALTER TABLE ordenes_restaurante ENABLE ROW LEVEL SECURITY;
ALTER TABLE orden_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PASO 6: Verificación final
-- =====================================================

DO $$
DECLARE
  ordenes_policies INTEGER;
  orden_items_policies INTEGER;
  has_functions BOOLEAN;
BEGIN
  -- Contar políticas
  SELECT COUNT(*) INTO ordenes_policies
  FROM pg_policies
  WHERE tablename = 'ordenes_restaurante';
  
  SELECT COUNT(*) INTO orden_items_policies
  FROM pg_policies
  WHERE tablename = 'orden_items';
  
  -- Verificar funciones
  SELECT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname IN ('is_admin', 'is_admin_or_encargado')
  ) INTO has_functions;
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ VERIFICACIÓN FINAL - Políticas de Órdenes';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Políticas activas:';
  RAISE NOTICE '   - ordenes_restaurante: %', ordenes_policies;
  RAISE NOTICE '   - orden_items: %', orden_items_policies;
  RAISE NOTICE '';
  RAISE NOTICE '🔧 Funciones anti-recursión:';
  IF has_functions THEN
    RAISE NOTICE '   ✅ Creadas correctamente';
  ELSE
    RAISE NOTICE '   ❌ ERROR: No se crearon las funciones';
  END IF;
  RAISE NOTICE '';
  RAISE NOTICE '🧪 Prueba ahora:';
  RAISE NOTICE '   1. Recarga la página /admin/mesas (Ctrl+F5)';
  RAISE NOTICE '   2. Los pedidos deberían cargar correctamente';
  RAISE NOTICE '   3. Los botones "Nueva Orden" deberían funcionar';
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
END $$;




