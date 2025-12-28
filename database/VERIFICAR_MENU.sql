-- =====================================================
-- VERIFICAR ESTADO DEL MENÚ DIGITAL
-- =====================================================
-- Ejecutar en Supabase SQL Editor para diagnosticar por qué no se ve el menú

-- 1. Verificar que existen categorías
SELECT 
  'Categorías totales' as tipo,
  COUNT(*) as cantidad
FROM categories;

-- 2. Verificar categorías activas con slugs válidos
SELECT 
  id,
  name,
  slug,
  is_active,
  order_num,
  visual_type,
  CASE 
    WHEN slug IN ('destacados', 'completos', 'sandwiches', 'acompanamientos', 'pollo', 'bebidas') THEN '✅ Slug válido'
    ELSE '❌ Slug no válido'
  END as estado_slug
FROM categories
WHERE is_active = true
ORDER BY order_num;

-- 3. Verificar categorías con slugs válidos (las que necesita el menú)
SELECT 
  'Categorías válidas encontradas' as tipo,
  COUNT(*) as cantidad
FROM categories
WHERE is_active = true
  AND slug IN ('destacados', 'completos', 'sandwiches', 'acompanamientos', 'pollo', 'bebidas');

-- 4. Verificar items del menú
SELECT 
  'Items totales' as tipo,
  COUNT(*) as cantidad
FROM menu_items;

-- 5. Verificar items disponibles por categoría
SELECT 
  c.name as categoria,
  c.slug,
  COUNT(mi.id) as items_disponibles,
  COUNT(CASE WHEN mi.is_featured THEN 1 END) as items_destacados
FROM categories c
LEFT JOIN menu_items mi ON mi.category_id = c.id AND mi.is_available = true
WHERE c.is_active = true
  AND c.slug IN ('destacados', 'completos', 'sandwiches', 'acompanamientos', 'pollo', 'bebidas')
GROUP BY c.id, c.name, c.slug
ORDER BY c.order_num;

-- 6. Verificar políticas RLS de categories
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'categories'
ORDER BY policyname;

-- 7. Verificar políticas RLS de menu_items
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'menu_items'
ORDER BY policyname;

-- 8. Verificar funciones de ayuda (para evitar recursión)
SELECT 
  proname as function_name,
  CASE 
    WHEN prosecdef THEN '✅ SECURITY DEFINER'
    ELSE '❌ No es SECURITY DEFINER'
  END as tipo_seguridad
FROM pg_proc
WHERE proname IN ('is_admin', 'is_admin_or_encargado')
ORDER BY proname;

-- 9. Resumen final
DO $$
DECLARE
  total_cats INTEGER;
  valid_cats INTEGER;
  total_items INTEGER;
  has_functions BOOLEAN;
BEGIN
  -- Contar categorías totales
  SELECT COUNT(*) INTO total_cats FROM categories;
  
  -- Contar categorías válidas y activas
  SELECT COUNT(*) INTO valid_cats 
  FROM categories
  WHERE is_active = true
    AND slug IN ('destacados', 'completos', 'sandwiches', 'acompanamientos', 'pollo', 'bebidas');
  
  -- Contar items totales
  SELECT COUNT(*) INTO total_items FROM menu_items;
  
  -- Verificar funciones
  SELECT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname IN ('is_admin', 'is_admin_or_encargado')
  ) INTO has_functions;
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '📊 RESUMEN DEL ESTADO DEL MENÚ DIGITAL';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📁 Categorías:';
  RAISE NOTICE '   - Total en BD: %', total_cats;
  RAISE NOTICE '   - Válidas y activas: %', valid_cats;
  IF valid_cats = 0 THEN
    RAISE NOTICE '   ⚠️  PROBLEMA: No hay categorías válidas. Ejecuta: database/SEED_MENU_COMPLETOS.sql';
  END IF;
  RAISE NOTICE '';
  RAISE NOTICE '🍽️  Items del menú:';
  RAISE NOTICE '   - Total en BD: %', total_items;
  IF total_items = 0 THEN
    RAISE NOTICE '   ⚠️  PROBLEMA: No hay items. Ejecuta: database/SEED_MENU_COMPLETOS.sql';
  END IF;
  RAISE NOTICE '';
  RAISE NOTICE '🔒 Funciones anti-recursión:';
  IF has_functions THEN
    RAISE NOTICE '   ✅ Funciones creadas correctamente';
  ELSE
    RAISE NOTICE '   ❌ PROBLEMA: Falta ejecutar: database/FIX_TODAS_RECURSIONES.sql';
  END IF;
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
END $$;



