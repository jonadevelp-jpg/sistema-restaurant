-- =====================================================
-- MIGRACIÓN 017: PERMITIR A MESEROS CANCELAR ÓRDENES Y LIBERAR MESAS
-- =====================================================
-- Ejecutar en Supabase SQL Editor
-- 
-- PROBLEMA: Los meseros no pueden cancelar órdenes ni liberar mesas
-- CAUSA: Las políticas RLS solo permiten DELETE a admins
-- SOLUCIÓN: Permitir a meseros eliminar sus propias órdenes y actualizar mesas

-- =====================================================
-- 1. CORREGIR POLÍTICA DE DELETE PARA ÓRDENES
-- =====================================================

-- Eliminar política restrictiva actual
DROP POLICY IF EXISTS "ordenes_delete_admin" ON ordenes_restaurante;

-- Crear nueva política que permite a meseros eliminar sus propias órdenes
-- y a admins/encargados eliminar cualquier orden
CREATE POLICY "ordenes_delete_own_or_admin"
  ON ordenes_restaurante FOR DELETE
  USING (
    -- El usuario es el mesero de la orden
    mesero_id = auth.uid()
    OR
    -- El usuario es admin o encargado
    EXISTS (
      SELECT 1 
      FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'encargado')
    )
  );

-- =====================================================
-- 2. VERIFICAR POLÍTICA DE UPDATE PARA MESAS
-- =====================================================

-- La política actual ya permite a meseros actualizar mesas,
-- pero vamos a verificar y asegurarnos de que esté correcta

-- Verificar política actual de mesas
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
WHERE tablename = 'mesas'
AND cmd = 'UPDATE'
ORDER BY policyname;

-- Si la política no existe o es muy restrictiva, recrearla
DROP POLICY IF EXISTS "mesas_update_admin" ON mesas;

CREATE POLICY "mesas_update_admin"
  ON mesas FOR UPDATE
  USING (
    -- Permitir a admin, encargado y mesero actualizar mesas
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'encargado', 'mesero')
    )
  )
  WITH CHECK (
    -- Mismas condiciones para WITH CHECK
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'encargado', 'mesero')
    )
  );

-- =====================================================
-- 3. VERIFICAR QUE LAS POLÍTICAS SE CREARON CORRECTAMENTE
-- =====================================================

-- Verificar política de DELETE para órdenes
SELECT 
  'ordenes_restaurante DELETE' as tabla_operacion,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'ordenes_restaurante'
AND cmd = 'DELETE'
AND policyname = 'ordenes_delete_own_or_admin';

-- Verificar política de UPDATE para mesas
SELECT 
  'mesas UPDATE' as tabla_operacion,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'mesas'
AND cmd = 'UPDATE'
AND policyname = 'mesas_update_admin';

-- =====================================================
-- RESUMEN DE CAMBIOS
-- =====================================================
-- ✅ Meseros ahora pueden eliminar sus propias órdenes
-- ✅ Admins y encargados pueden eliminar cualquier orden
-- ✅ Meseros, encargados y admins pueden actualizar mesas (liberar/ocupar)
-- ✅ Esto permite que los meseros cancelen órdenes y liberen mesas desde el POS


