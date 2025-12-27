-- Script para corregir permisos de pedidos y menú
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar y corregir políticas de ordenes_restaurante
-- Permitir que admin y encargado vean TODAS las órdenes

-- Eliminar políticas antiguas
DROP POLICY IF EXISTS "ordenes_select_own_or_admin" ON ordenes_restaurante;
DROP POLICY IF EXISTS "ordenes_select_all_admin_encargado" ON ordenes_restaurante;
DROP POLICY IF EXISTS "ordenes_select_mesero_or_admin" ON ordenes_restaurante;

-- Nueva política: Admin y encargado pueden ver TODAS las órdenes
-- Mesero puede ver sus propias órdenes
CREATE POLICY "ordenes_select_all_admin_encargado" ON ordenes_restaurante FOR SELECT
  USING (
    -- Admin y encargado pueden ver todas las órdenes
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role IN ('admin', 'encargado')
    )
    OR
    -- Mesero puede ver sus propias órdenes
    (mesero_id = auth.uid())
  );

-- Verificar política de INSERT
DROP POLICY IF EXISTS "ordenes_insert_mesero_or_admin" ON ordenes_restaurante;

CREATE POLICY "ordenes_insert_mesero_or_admin" ON ordenes_restaurante FOR INSERT
  WITH CHECK (
    -- Admin y encargado pueden crear cualquier orden
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role IN ('admin', 'encargado')
    )
    OR
    -- Mesero puede crear órdenes asignadas a él
    (mesero_id = auth.uid())
  );

-- 2. Verificar políticas de menu_items y categories
-- Estas deberían ser públicas para lectura, pero protegidas para escritura

-- Políticas para menu_items (si no existen)
DO $$
BEGIN
  -- SELECT: Todos pueden leer (público)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'menu_items' 
    AND policyname = 'menu_items_select_public'
  ) THEN
    CREATE POLICY "menu_items_select_public" ON menu_items FOR SELECT
      USING (true);
  END IF;

  -- INSERT/UPDATE/DELETE: Solo admin y encargado
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'menu_items' 
    AND policyname = 'menu_items_modify_admin'
  ) THEN
    CREATE POLICY "menu_items_modify_admin" ON menu_items FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM users u 
          WHERE u.id = auth.uid() 
          AND u.role IN ('admin', 'encargado')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM users u 
          WHERE u.id = auth.uid() 
          AND u.role IN ('admin', 'encargado')
        )
      );
  END IF;
END $$;

-- Políticas para categories (si no existen)
DO $$
BEGIN
  -- SELECT: Todos pueden leer (público)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'categories' 
    AND policyname = 'categories_select_public'
  ) THEN
    CREATE POLICY "categories_select_public" ON categories FOR SELECT
      USING (true);
  END IF;

  -- INSERT/UPDATE/DELETE: Solo admin y encargado
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'categories' 
    AND policyname = 'categories_modify_admin'
  ) THEN
    CREATE POLICY "categories_modify_admin" ON categories FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM users u 
          WHERE u.id = auth.uid() 
          AND u.role IN ('admin', 'encargado')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM users u 
          WHERE u.id = auth.uid() 
          AND u.role IN ('admin', 'encargado')
        )
      );
  END IF;
END $$;

-- 3. Verificar que RLS esté habilitado
ALTER TABLE ordenes_restaurante ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 4. Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE '✅ Políticas de permisos actualizadas';
  RAISE NOTICE '   - Admin y encargado pueden ver TODAS las órdenes';
  RAISE NOTICE '   - Menu items y categories: lectura pública, escritura solo admin/encargado';
END $$;

