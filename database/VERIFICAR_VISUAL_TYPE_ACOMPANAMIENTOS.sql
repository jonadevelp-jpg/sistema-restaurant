-- =====================================================
-- VERIFICAR VISUAL_TYPE DE CATEGORÍA Y ITEMS 'ACOMPAÑAMIENTOS'
-- =====================================================
-- Este script verifica el visual_type de la categoría 'acompanamientos'
-- y de todos sus items para diagnosticar problemas de visualización.
-- =====================================================

-- Verificar categoría
SELECT 
  id,
  name,
  slug,
  visual_type,
  is_active,
  order_num
FROM categories
WHERE slug = 'acompanamientos';

-- Verificar items de la categoría
SELECT 
  mi.id,
  mi.name,
  mi.visual_type,
  mi.image_url,
  mi.is_available,
  mi.is_featured,
  mi.order_num,
  CASE 
    WHEN mi.image_url IS NOT NULL AND mi.visual_type = 'hero' THEN '✅ Correcto (tiene imagen y es hero)'
    WHEN mi.image_url IS NOT NULL AND mi.visual_type != 'hero' THEN '⚠️ Tiene imagen pero visual_type no es hero'
    WHEN mi.image_url IS NULL AND mi.visual_type = 'list' THEN '✅ Correcto (sin imagen y es list)'
    WHEN mi.image_url IS NULL AND mi.visual_type != 'list' THEN '⚠️ Sin imagen pero visual_type no es list'
    ELSE '❓ Estado desconocido'
  END as estado_visual
FROM menu_items mi
JOIN categories c ON mi.category_id = c.id
WHERE c.slug = 'acompanamientos'
ORDER BY mi.order_num;

-- Resumen
SELECT 
  mi.visual_type,
  COUNT(*) as cantidad,
  COUNT(CASE WHEN mi.image_url IS NOT NULL THEN 1 END) as con_imagen,
  COUNT(CASE WHEN mi.image_url IS NULL THEN 1 END) as sin_imagen
FROM menu_items mi
JOIN categories c ON mi.category_id = c.id
WHERE c.slug = 'acompanamientos'
GROUP BY mi.visual_type
ORDER BY mi.visual_type;



