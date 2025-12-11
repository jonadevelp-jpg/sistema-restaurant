-- =====================================================
-- MIGRACIÓN 009: PERMISOS DE INGREDIENTES PARA ENCARGADOS
-- =====================================================
-- Ejecutar en Supabase SQL Editor
-- Permite a encargados y meseros actualizar stock

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "ingredientes_update_admin" ON ingredientes;
DROP POLICY IF EXISTS "ingredientes_insert_admin" ON ingredientes;

-- Nueva política: admin y encargado pueden insertar/actualizar
CREATE POLICY "ingredientes_insert_admin"
  ON ingredientes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'encargado')
    )
    OR NOT EXISTS (SELECT 1 FROM users LIMIT 1) -- Permitir si no hay usuarios aún
  );

CREATE POLICY "ingredientes_update_admin"
  ON ingredientes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'encargado')
    )
    OR NOT EXISTS (SELECT 1 FROM users LIMIT 1)
  );

-- Verificar políticas
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  with_check
FROM pg_policies
WHERE tablename = 'ingredientes'
ORDER BY policyname;


