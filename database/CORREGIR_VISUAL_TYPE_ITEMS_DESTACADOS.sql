-- =====================================================
-- CORREGIR VISUAL_TYPE DE ITEMS EN CATEGORÍA DESTACADOS
-- =====================================================
-- Ejecutar en Supabase SQL Editor
-- Este script cambia el visual_type de items en "destacados" a 'hero' si tienen imagen

-- 1. Ver el estado actual
SELECT 
  mi.id,
  mi.name,
  mi.visual_type,
  mi.image_url,
  CASE 
    WHEN mi.visual_type = 'hero' THEN '✅ Hero (cards grandes)'
    WHEN mi.visual_type = 'list' THEN '📋 List (lista simple)'
    WHEN mi.visual_type = 'drink' THEN '🥤 Drink (grid)'
    WHEN mi.visual_type IS NULL THEN '⚠️ NULL'
    ELSE '❓ Desconocido'
  END as estado_actual,
  CASE 
    WHEN mi.image_url IS NOT NULL AND mi.image_url != '' THEN '✅ Tiene imagen'
    ELSE '❌ Sin imagen'
  END as tiene_imagen
FROM menu_items mi
WHERE mi.category_id = (SELECT id FROM categories WHERE slug = 'destacados')
ORDER BY mi.order_num;

-- 2. Corregir: Si tiene imagen, cambiar a 'hero'
UPDATE menu_items
SET visual_type = 'hero'
WHERE category_id = (SELECT id FROM categories WHERE slug = 'destacados')
  AND image_url IS NOT NULL
  AND image_url != ''
  AND visual_type != 'hero';

-- 3. Verificar resultado
SELECT 
  mi.id,
  mi.name,
  mi.visual_type,
  mi.image_url,
  CASE 
    WHEN mi.visual_type = 'hero' THEN '✅ Hero (cards grandes)'
    WHEN mi.visual_type = 'list' THEN '📋 List (lista simple)'
    WHEN mi.visual_type = 'drink' THEN '🥤 Drink (grid)'
    WHEN mi.visual_type IS NULL THEN '⚠️ NULL'
    ELSE '❓ Desconocido'
  END as estado_final
FROM menu_items mi
WHERE mi.category_id = (SELECT id FROM categories WHERE slug = 'destacados')
ORDER BY mi.order_num;




