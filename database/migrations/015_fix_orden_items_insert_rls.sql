-- =====================================================
-- MIGRACIÓN 015: CORREGIR RLS PARA INSERT DE orden_items
-- =====================================================
-- Ejecutar en Supabase SQL Editor
-- 
-- PROBLEMA: "new row violates row-level security policy for table orden_items"
-- CAUSA: La política RLS está fallando al verificar permisos
-- SOLUCIÓN: Crear política más robusta que no dependa de funciones que puedan fallar

-- Eliminar política existente de INSERT
DROP POLICY IF EXISTS "orden_items_insert_own_or_admin" ON orden_items;

-- Crear nueva política más robusta para INSERT
-- Permite insertar items si:
-- 1. El usuario está autenticado
-- 2. La orden existe
-- 3. El usuario es el mesero de la orden O es admin/encargado/mesero
CREATE POLICY "orden_items_insert_own_or_admin"
  ON orden_items FOR INSERT
  WITH CHECK (
    -- Verificar que el usuario esté autenticado
    auth.uid() IS NOT NULL
    AND
    -- Verificar que la orden exista y el usuario tenga permisos
    EXISTS (
      SELECT 1 
      FROM ordenes_restaurante o
      WHERE o.id = orden_items.orden_id
      AND (
        -- El usuario es el mesero de la orden
        o.mesero_id = auth.uid()
        OR
        -- El usuario es admin, encargado o mesero
        EXISTS (
          SELECT 1 
          FROM users u
          WHERE u.id = auth.uid()
          AND u.role IN ('admin', 'encargado', 'mesero')
        )
      )
    )
  );

-- Verificar que la política se creó correctamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  with_check
FROM pg_policies
WHERE tablename = 'orden_items'
AND policyname = 'orden_items_insert_own_or_admin';

-- Nota: Si aún falla, verifica:
-- 1. Que el usuario esté autenticado (auth.uid() no es NULL)
-- 2. Que la orden exista antes de insertar items
-- 3. Que el usuario tenga el rol correcto en la tabla users



