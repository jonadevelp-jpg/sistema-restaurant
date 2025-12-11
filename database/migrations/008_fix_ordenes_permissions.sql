-- =====================================================
-- MIGRACIÓN 008: CORREGIR PERMISOS DE ÓRDENES
-- =====================================================
-- Ejecutar en Supabase SQL Editor
-- Asegura que meseros puedan crear órdenes sin problemas

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "ordenes_insert_mesero_or_admin" ON ordenes_restaurante;
DROP POLICY IF EXISTS "orden_items_insert_own_or_admin" ON orden_items;

-- Nueva política más permisiva para INSERT de órdenes
-- Permite a cualquier usuario autenticado crear órdenes
CREATE POLICY "ordenes_insert_mesero_or_admin"
  ON ordenes_restaurante FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      mesero_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND u.role IN ('admin', 'encargado', 'mesero')
      )
    )
  );

-- Nueva política más permisiva para INSERT de orden_items
CREATE POLICY "orden_items_insert_own_or_admin"
  ON orden_items FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM ordenes_restaurante o
      WHERE o.id = orden_items.orden_id
      AND (
        o.mesero_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM users u
          WHERE u.id = auth.uid()
          AND u.role IN ('admin', 'encargado', 'mesero')
        )
      )
    )
  );

-- Verificar que las políticas estén activas
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
WHERE tablename IN ('ordenes_restaurante', 'orden_items')
ORDER BY tablename, policyname;


