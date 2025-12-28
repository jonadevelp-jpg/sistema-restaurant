-- =====================================================
-- MIGRACIÓN 016: CORREGIR RLS PARA UPDATE DE ordenes_restaurante
-- =====================================================
-- Ejecutar en Supabase SQL Editor
-- 
-- PROBLEMA: No se puede cambiar el estado a "preparing"
-- CAUSA: La política RLS puede estar bloqueando la actualización
-- SOLUCIÓN: Verificar y corregir la política de UPDATE

-- Verificar políticas actuales
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
WHERE tablename = 'ordenes_restaurante'
AND cmd = 'UPDATE'
ORDER BY policyname;

-- Eliminar política existente de UPDATE si existe
DROP POLICY IF EXISTS "ordenes_update_own_or_admin" ON ordenes_restaurante;

-- Crear nueva política más robusta para UPDATE
-- Permite actualizar si:
-- 1. El usuario está autenticado
-- 2. El usuario es el mesero de la orden O es admin/encargado/mesero
CREATE POLICY "ordenes_update_own_or_admin"
  ON ordenes_restaurante FOR UPDATE
  USING (
    -- Verificar que el usuario esté autenticado
    auth.uid() IS NOT NULL
    AND (
      -- El usuario es el mesero de la orden
      mesero_id = auth.uid()
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
  WITH CHECK (
    -- Mismas condiciones para WITH CHECK
    auth.uid() IS NOT NULL
    AND (
      mesero_id = auth.uid()
      OR
      EXISTS (
        SELECT 1 
        FROM users u
        WHERE u.id = auth.uid()
        AND u.role IN ('admin', 'encargado', 'mesero')
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
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'ordenes_restaurante'
AND policyname = 'ordenes_update_own_or_admin';

-- Nota: Si aún falla, verifica:
-- 1. Que el usuario esté autenticado (auth.uid() no es NULL)
-- 2. Que el usuario tenga el rol correcto en la tabla users
-- 3. Que el mesero_id de la orden coincida con el usuario actual (si no es admin/encargado)



