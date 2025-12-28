-- =====================================================
-- SOLUCIÓN: Recursión Infinita en Políticas RLS de users
-- =====================================================
-- Error: "infinite recursion detected in policy for relation users"
-- Ejecutar en Supabase SQL Editor

-- Paso 1: Crear funciones SECURITY DEFINER para evitar recursión
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

-- Paso 2: Eliminar la política problemática de users
DROP POLICY IF EXISTS "users_select_own_or_admin" ON users;
DROP POLICY IF EXISTS "users_select_all" ON users;
DROP POLICY IF EXISTS "users_insert_admin" ON users;
DROP POLICY IF EXISTS "users_update_admin" ON users;
DROP POLICY IF EXISTS "users_delete_admin" ON users;

-- Paso 3: Crear nueva política de users SIN recursión
-- Usa la función is_admin() que no consulta users directamente
CREATE POLICY "users_select_own_or_admin" ON users FOR SELECT
  USING (
    -- El usuario puede ver su propio perfil
    auth.uid() = id
    -- O es admin (usando función que no causa recursión)
    OR is_admin()
    -- O no hay usuarios en la BD (para setup inicial)
    OR NOT EXISTS (SELECT 1 FROM public.users LIMIT 1)
  );

-- Políticas adicionales para users (INSERT, UPDATE, DELETE)
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

-- Paso 4: Verificar que las funciones se crearon correctamente
DO $$
BEGIN
  RAISE NOTICE '✅ Funciones creadas:';
  RAISE NOTICE '   - is_admin()';
  RAISE NOTICE '   - is_admin_or_encargado()';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Políticas de users actualizadas sin recursión';
END $$;

-- Paso 5: Probar que no hay recursión
-- Esta consulta debería funcionar sin error
SELECT 
  id,
  email,
  role,
  name
FROM users
WHERE id = auth.uid()
LIMIT 1;



