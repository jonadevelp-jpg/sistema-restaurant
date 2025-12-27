-- =====================================================
-- CORREGIR VISUAL_TYPE DE CATEGORÍA ACOMPAÑAMIENTOS
-- =====================================================
-- Ejecutar en Supabase SQL Editor
-- Este script asegura que la categoría "acompanamientos" tenga visual_type = 'hero'
-- y que sus items también tengan visual_type = 'hero' si tienen imagen
-- =====================================================

-- 1. Verificar y corregir la categoría "acompanamientos"
UPDATE categories
SET visual_type = 'hero'
WHERE slug = 'acompanamientos'
  AND (visual_type IS NULL OR visual_type != 'hero');

-- 2. Verificar y corregir los items de "acompanamientos" que tienen imagen
UPDATE menu_items
SET visual_type = 'hero'
WHERE category_id = (SELECT id FROM categories WHERE slug = 'acompanamientos')
  AND image_url IS NOT NULL
  AND image_url != ''
  AND (visual_type IS NULL OR visual_type != 'hero');

-- 3. Verificar resultado
SELECT 
  c.id as categoria_id,
  c.name as categoria_nombre,
  c.visual_type as categoria_visual_type,
  COUNT(mi.id) as total_items,
  COUNT(CASE WHEN mi.visual_type = 'hero' THEN 1 END) as items_hero,
  COUNT(CASE WHEN mi.visual_type = 'list' THEN 1 END) as items_list,
  COUNT(CASE WHEN mi.visual_type = 'drink' THEN 1 END) as items_drink,
  COUNT(CASE WHEN mi.visual_type IS NULL THEN 1 END) as items_sin_visual_type,
  COUNT(CASE WHEN mi.image_url IS NOT NULL AND mi.image_url != '' THEN 1 END) as items_con_imagen
FROM categories c
LEFT JOIN menu_items mi ON mi.category_id = c.id
WHERE c.slug = 'acompanamientos'
GROUP BY c.id, c.name, c.visual_type;

-- 4. Ver los items individualmente
SELECT 
  mi.id,
  mi.name,
  mi.visual_type,
  mi.image_url,
  CASE 
    WHEN mi.visual_type = 'hero' THEN '✅ Hero (cards grandes)'
    WHEN mi.visual_type = 'list' THEN '📋 List (lista simple)'
    WHEN mi.visual_type = 'drink' THEN '🥤 Drink (grid)'
    WHEN mi.visual_type IS NULL AND mi.image_url IS NOT NULL THEN '⚠️ Sin visual_type pero tiene imagen (usará hero por defecto)'
    WHEN mi.visual_type IS NULL AND mi.image_url IS NULL THEN '⚠️ Sin visual_type ni imagen (usará list por defecto)'
    ELSE '❓ Desconocido'
  END as estado
FROM menu_items mi
WHERE mi.category_id = (SELECT id FROM categories WHERE slug = 'acompanamientos')
ORDER BY mi.order_num;

