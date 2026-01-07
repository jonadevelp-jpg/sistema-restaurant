-- =====================================================
-- VERIFICAR VISUAL_TYPE DE CATEGORÍA DESTACADOS
-- =====================================================
-- Ejecutar en Supabase SQL Editor

-- 1. Ver la categoría "destacados"
SELECT 
  id,
  name,
  slug,
  visual_type,
  image_url
FROM categories
WHERE slug = 'destacados';

-- 2. Ver los items de la categoría "destacados" con su visual_type
SELECT 
  id,
  name,
  visual_type,
  image_url,
  is_available,
  category_id
FROM menu_items
WHERE category_id = (SELECT id FROM categories WHERE slug = 'destacados')
ORDER BY order_num;

-- 3. Verificar si los items tienen visual_type definido
SELECT 
  id,
  name,
  visual_type,
  CASE 
    WHEN visual_type IS NULL THEN '⚠️ Sin visual_type (usará el de la categoría)'
    WHEN visual_type = 'hero' THEN '✅ Hero (cards grandes)'
    WHEN visual_type = 'list' THEN '📋 List (lista simple)'
    WHEN visual_type = 'drink' THEN '🥤 Drink (grid de bebidas)'
    ELSE '❓ Desconocido'
  END as estado_visual_type,
  image_url
FROM menu_items
WHERE category_id = (SELECT id FROM categories WHERE slug = 'destacados')
ORDER BY order_num;




