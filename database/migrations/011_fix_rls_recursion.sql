-- =====================================================
-- MIGRACIÓN 011: CORREGIR RECURSIÓN EN RLS
-- =====================================================
-- Ejecutar en Supabase SQL Editor
-- Soluciona el error "infinite recursion detected in policy for relation users"

-- Crear función SECURITY DEFINER para obtener el rol del usuario
-- Esta función puede leer users sin pasar por RLS
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM users
  WHERE id = user_id
  LIMIT 1;
  
  RETURN COALESCE(user_role, '');
END;
$$;

-- Función para verificar si el usuario es admin o encargado
CREATE OR REPLACE FUNCTION is_admin_or_encargado()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM users
  WHERE id = auth.uid()
  LIMIT 1;
  
  RETURN user_role IN ('admin', 'encargado');
END;
$$;

-- Función para verificar si el usuario es admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM users
  WHERE id = auth.uid()
  LIMIT 1;
  
  RETURN user_role = 'admin';
END;
$$;

-- Ahora actualizar las políticas de órdenes para usar las funciones
DROP POLICY IF EXISTS "ordenes_select_own_or_admin" ON ordenes_restaurante;
DROP POLICY IF EXISTS "ordenes_insert_mesero_or_admin" ON ordenes_restaurante;
DROP POLICY IF EXISTS "ordenes_update_own_or_admin" ON ordenes_restaurante;
DROP POLICY IF EXISTS "ordenes_delete_admin" ON ordenes_restaurante;

-- Políticas actualizadas usando funciones
CREATE POLICY "ordenes_select_own_or_admin"
  ON ordenes_restaurante FOR SELECT
  USING (
    mesero_id = auth.uid()
    OR is_admin_or_encargado()
  );

CREATE POLICY "ordenes_insert_mesero_or_admin"
  ON ordenes_restaurante FOR INSERT
  WITH CHECK (
    mesero_id = auth.uid()
    OR is_admin_or_encargado()
  );

CREATE POLICY "ordenes_update_own_or_admin"
  ON ordenes_restaurante FOR UPDATE
  USING (
    mesero_id = auth.uid()
    OR is_admin_or_encargado()
  );

CREATE POLICY "ordenes_delete_admin"
  ON ordenes_restaurante FOR DELETE
  USING (is_admin());

-- Actualizar políticas de orden_items
DROP POLICY IF EXISTS "orden_items_select_own_or_admin" ON orden_items;
DROP POLICY IF EXISTS "orden_items_insert_own_or_admin" ON orden_items;
DROP POLICY IF EXISTS "orden_items_update_own_or_admin" ON orden_items;
DROP POLICY IF EXISTS "orden_items_delete_own_or_admin" ON orden_items;

CREATE POLICY "orden_items_select_own_or_admin"
  ON orden_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ordenes_restaurante o
      WHERE o.id = orden_items.orden_id
      AND (o.mesero_id = auth.uid() OR is_admin_or_encargado())
    )
  );

CREATE POLICY "orden_items_insert_own_or_admin"
  ON orden_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ordenes_restaurante o
      WHERE o.id = orden_items.orden_id
      AND (o.mesero_id = auth.uid() OR is_admin_or_encargado())
    )
  );

CREATE POLICY "orden_items_update_own_or_admin"
  ON orden_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM ordenes_restaurante o
      WHERE o.id = orden_items.orden_id
      AND (o.mesero_id = auth.uid() OR is_admin_or_encargado())
    )
  );

CREATE POLICY "orden_items_delete_own_or_admin"
  ON orden_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM ordenes_restaurante o
      WHERE o.id = orden_items.orden_id
      AND (o.mesero_id = auth.uid() OR is_admin_or_encargado())
    )
  );

-- Actualizar política de users para evitar recursión
DROP POLICY IF EXISTS "users_select_own_or_admin" ON users;

CREATE POLICY "users_select_own_or_admin"
  ON users FOR SELECT
  USING (
    auth.uid() = id
    OR is_admin()
  );

-- Verificar que las funciones se crearon correctamente
SELECT 
  proname as function_name,
  pg_get_functiondef(oid) as definition
FROM pg_proc
WHERE proname IN ('get_user_role', 'is_admin_or_encargado', 'is_admin')
ORDER BY proname;


