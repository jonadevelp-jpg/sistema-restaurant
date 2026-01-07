-- =====================================================
-- DIAGNÓSTICO: Verificar Estado de Políticas y Permisos
-- =====================================================
-- Ejecutar en Supabase SQL Editor para diagnosticar el problema

-- 1. Verificar si las funciones anti-recursión existen
SELECT 
  proname as funcion,
  prosrc as codigo
FROM pg_proc
WHERE proname IN ('is_admin', 'is_admin_or_encargado')
ORDER BY proname;

-- 2. Verificar políticas de ordenes_restaurante
SELECT 
  policyname,
  cmd as operacion,
  qual as condicion_using,
  with_check as condicion_check
FROM pg_policies
WHERE tablename = 'ordenes_restaurante'
ORDER BY policyname;

-- 3. Verificar si RLS está habilitado
SELECT 
  relname as tabla,
  relrowsecurity as rls_habilitado
FROM pg_class
WHERE relname IN ('ordenes_restaurante', 'orden_items', 'users')
ORDER BY relname;

-- 4. Contar órdenes existentes (para verificar que hay datos)
SELECT 
  tipo_pedido,
  estado,
  COUNT(*) as cantidad
FROM ordenes_restaurante
GROUP BY tipo_pedido, estado
ORDER BY tipo_pedido, estado;

-- 5. Verificar usuarios y sus roles
SELECT 
  id,
  role,
  email,
  name
FROM users
ORDER BY role, email;

-- 6. Mensaje de diagnóstico
DO $$
DECLARE
  funciones_count INTEGER;
  politicas_count INTEGER;
  ordenes_count INTEGER;
  usuarios_count INTEGER;
BEGIN
  -- Contar funciones
  SELECT COUNT(*) INTO funciones_count
  FROM pg_proc
  WHERE proname IN ('is_admin', 'is_admin_or_encargado');
  
  -- Contar políticas
  SELECT COUNT(*) INTO politicas_count
  FROM pg_policies
  WHERE tablename = 'ordenes_restaurante';
  
  -- Contar órdenes
  SELECT COUNT(*) INTO ordenes_count
  FROM ordenes_restaurante;
  
  -- Contar usuarios
  SELECT COUNT(*) INTO usuarios_count
  FROM users;
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '📊 DIAGNÓSTICO DE ÓRDENES';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 Funciones anti-recursión: %', funciones_count;
  IF funciones_count < 2 THEN
    RAISE NOTICE '   ⚠️  FALTAN FUNCIONES - Ejecuta FIX_POLITICAS_ORDENES.sql';
  ELSE
    RAISE NOTICE '   ✅ Funciones creadas correctamente';
  END IF;
  RAISE NOTICE '';
  RAISE NOTICE '🔒 Políticas de ordenes_restaurante: %', politicas_count;
  IF politicas_count < 4 THEN
    RAISE NOTICE '   ⚠️  FALTAN POLÍTICAS - Ejecuta FIX_POLITICAS_ORDENES.sql';
  ELSE
    RAISE NOTICE '   ✅ Políticas configuradas correctamente';
  END IF;
  RAISE NOTICE '';
  RAISE NOTICE '📦 Órdenes en la base de datos: %', ordenes_count;
  IF ordenes_count = 0 THEN
    RAISE NOTICE '   ℹ️  No hay órdenes aún (esto es normal si no has creado ninguna)';
  ELSE
    RAISE NOTICE '   ✅ Hay órdenes en la base de datos';
  END IF;
  RAISE NOTICE '';
  RAISE NOTICE '👥 Usuarios en la base de datos: %', usuarios_count;
  IF usuarios_count = 0 THEN
    RAISE NOTICE '   ⚠️  NO HAY USUARIOS - Necesitas crear un usuario admin';
    RAISE NOTICE '   📝 Ejecuta: database/CREAR_USUARIO_ADMIN.sql';
  ELSE
    RAISE NOTICE '   ✅ Hay usuarios en la base de datos';
  END IF;
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
END $$;




