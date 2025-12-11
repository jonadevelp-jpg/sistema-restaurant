-- =====================================================
-- MIGRACIÓN 010: PERMISOS DE MOVIMIENTOS DE STOCK
-- =====================================================
-- Ejecutar en Supabase SQL Editor
-- Permite a encargados insertar movimientos de stock

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "movimientos_stock_insert_admin" ON movimientos_stock;

-- Nueva política: admin y encargado pueden insertar
CREATE POLICY "movimientos_stock_insert_admin"
  ON movimientos_stock FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'encargado')
    )
  );

-- Verificar políticas
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  with_check
FROM pg_policies
WHERE tablename = 'movimientos_stock'
ORDER BY policyname;


