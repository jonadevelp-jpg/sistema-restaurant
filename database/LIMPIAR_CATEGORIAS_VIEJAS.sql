-- =====================================================
-- LIMPIAR CATEGORÍAS VIEJAS (OPCIONAL)
-- =====================================================
-- Ejecutar en Supabase SQL Editor
-- 
-- Este script desactiva las categorías viejas del restaurante árabe
-- para que no aparezcan en el menú digital
-- =====================================================

-- Desactivar categorías viejas (no eliminar, solo desactivar)
UPDATE categories 
SET is_active = false
WHERE slug NOT IN ('destacados', 'completos', 'sandwiches', 'acompanamientos', 'pollo', 'bebidas')
  AND is_active = true;

-- Verificar categorías activas
SELECT 
  id,
  name,
  slug,
  is_active,
  order_num
FROM categories
WHERE is_active = true
ORDER BY order_num;

-- Ver categorías desactivadas
SELECT 
  id,
  name,
  slug,
  is_active
FROM categories
WHERE is_active = false
ORDER BY name;

-- =====================================================
-- NOTA: Si quieres ELIMINAR completamente las categorías viejas
-- (y sus items asociados), ejecuta esto con cuidado:
-- =====================================================

-- ⚠️ CUIDADO: Esto eliminará permanentemente las categorías viejas
-- Descomenta solo si estás seguro:

-- DELETE FROM menu_items WHERE category_id IN (
--   SELECT id FROM categories 
--   WHERE slug NOT IN ('destacados', 'completos', 'sandwiches', 'acompanamientos', 'pollo', 'bebidas')
-- );
-- 
-- DELETE FROM categories 
-- WHERE slug NOT IN ('destacados', 'completos', 'sandwiches', 'acompanamientos', 'pollo', 'bebidas');




