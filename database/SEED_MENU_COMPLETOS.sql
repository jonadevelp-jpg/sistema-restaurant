-- =====================================================
-- SEED: MENÚ PARA RESTAURANTE DE COMPLETOS/CHURRASCOS
-- =====================================================
-- Ejecutar en Supabase SQL Editor
-- 
-- Este script crea las categorías e ítems del menú
-- para un restaurante de completos, churrascos y pollo asado
-- =====================================================

-- =====================================================
-- 1. CATEGORÍAS
-- =====================================================

INSERT INTO categories (name, slug, description, order_num, is_active, visual_type)
VALUES
  -- Destacados (hero - cards grandes con imagen)
  ('Destacados', 'destacados', 'Nuestros productos más populares', 1, true, 'hero'),
  
  -- Completos (hero - cards grandes)
  ('Completos', 'completos', 'Completos tradicionales y especiales', 2, true, 'hero'),
  
  -- Sandwiches (hero - cards grandes)
  ('Sandwiches', 'sandwiches', 'Sandwiches de carne, pollo y mixtos', 3, true, 'hero'),
  
  -- Acompañamientos (list - lista simple)
  ('Acompañamientos', 'acompanamientos', 'Papas, salchichas y más', 4, true, 'list'),
  
  -- Pollo (hero - destacado)
  ('Pollo', 'pollo', 'Pollo asado entero y porciones', 5, true, 'hero'),
  
  -- Bebidas (drink - grid simple)
  ('Bebidas', 'bebidas', 'Bebidas frías y calientes', 6, true, 'drink')
ON CONFLICT (slug) DO UPDATE 
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  order_num = EXCLUDED.order_num,
  is_active = EXCLUDED.is_active,
  visual_type = EXCLUDED.visual_type;

-- =====================================================
-- 2. OBTENER IDs DE CATEGORÍAS (para usar en items)
-- =====================================================

DO $$
DECLARE
  v_destacados_id INTEGER;
  v_completos_id INTEGER;
  v_sandwiches_id INTEGER;
  v_acompanamientos_id INTEGER;
  v_pollo_id INTEGER;
  v_bebidas_id INTEGER;
BEGIN
  -- Obtener IDs de categorías
  SELECT id INTO v_destacados_id FROM categories WHERE slug = 'destacados';
  SELECT id INTO v_completos_id FROM categories WHERE slug = 'completos';
  SELECT id INTO v_sandwiches_id FROM categories WHERE slug = 'sandwiches';
  SELECT id INTO v_acompanamientos_id FROM categories WHERE slug = 'acompanamientos';
  SELECT id INTO v_pollo_id FROM categories WHERE slug = 'pollo';
  SELECT id INTO v_bebidas_id FROM categories WHERE slug = 'bebidas';

  -- =====================================================
  -- 3. ÍTEMS DEL MENÚ
  -- =====================================================

  -- DESTACADOS (productos más populares)
  INSERT INTO menu_items (name, description, price, category_id, is_available, is_featured, order_num, visual_type)
  VALUES
    ('Completo Italiano', 'Completo con palta, tomate y mayonesa', 3500, v_completos_id, true, true, 1, 'hero'),
    ('Churrasco', 'Churrasco de carne con tomate, palta y mayonesa', 4500, v_sandwiches_id, true, true, 1, 'hero'),
    ('Pollo Asado Entero', 'Pollo asado completo para compartir', 12000, v_pollo_id, true, true, 1, 'hero')
  ON CONFLICT DO NOTHING;

  -- COMPLETOS
  INSERT INTO menu_items (name, description, price, category_id, is_available, is_featured, order_num, visual_type)
  VALUES
    ('Completo', 'Completo tradicional con tomate, palta y mayonesa', 3000, v_completos_id, true, false, 1, 'hero'),
    ('Completo Italiano', 'Completo con palta, tomate y mayonesa', 3500, v_completos_id, true, false, 2, 'hero')
  ON CONFLICT DO NOTHING;

  -- SANDWICHES
  INSERT INTO menu_items (name, description, price, category_id, is_available, is_featured, order_num, visual_type)
  VALUES
    ('Churrasco', 'Churrasco de carne con tomate, palta y mayonesa', 4500, v_sandwiches_id, true, false, 1, 'hero'),
    ('Churrasco Italiano', 'Churrasco con palta, tomate y mayonesa', 4800, v_sandwiches_id, true, false, 2, 'hero'),
    ('Ass Italiano', 'Sandwich Ass con palta, tomate y mayonesa', 4200, v_sandwiches_id, true, false, 3, 'hero'),
    ('Filete de Carne', 'Filete de carne a la plancha con verduras', 5000, v_sandwiches_id, true, false, 4, 'hero')
  ON CONFLICT DO NOTHING;

  -- ACOMPAÑAMIENTOS
  INSERT INTO menu_items (name, description, price, category_id, is_available, is_featured, order_num, visual_type)
  VALUES
    ('Papas Fritas', 'Papas fritas crujientes', 2500, v_acompanamientos_id, true, false, 1, 'list'),
    ('Salchichas', 'Salchichas a la parrilla (2 unidades)', 3000, v_acompanamientos_id, true, false, 2, 'list')
  ON CONFLICT DO NOTHING;

  -- POLLO
  INSERT INTO menu_items (name, description, price, category_id, is_available, is_featured, order_num, visual_type)
  VALUES
    ('Pollo Asado Entero', 'Pollo asado completo para compartir', 12000, v_pollo_id, true, false, 1, 'hero'),
    ('Pollo Asado Porción', 'Porción de pollo asado con papas', 4500, v_pollo_id, true, false, 2, 'hero')
  ON CONFLICT DO NOTHING;

  -- BEBIDAS
  INSERT INTO menu_items (name, description, price, category_id, is_available, is_featured, order_num, visual_type)
  VALUES
    ('Coca-Cola', 'Coca-Cola 350ml', 1500, v_bebidas_id, true, false, 1, 'drink'),
    ('Pepsi', 'Pepsi 350ml', 1500, v_bebidas_id, true, false, 2, 'drink'),
    ('Bilz', 'Bilz 350ml', 1500, v_bebidas_id, true, false, 3, 'drink'),
    ('Pap', 'Pap 350ml', 1500, v_bebidas_id, true, false, 4, 'drink'),
    ('7up', '7up 350ml', 1500, v_bebidas_id, true, false, 5, 'drink'),
    ('Gatorade', 'Gatorade 500ml', 2000, v_bebidas_id, true, false, 6, 'drink')
  ON CONFLICT DO NOTHING;

END $$;

-- =====================================================
-- 4. VERIFICAR DATOS INSERTADOS
-- =====================================================

-- Ver categorías
SELECT 
  id,
  name,
  slug,
  visual_type,
  order_num,
  is_active
FROM categories
WHERE slug IN ('destacados', 'completos', 'sandwiches', 'acompanamientos', 'pollo', 'bebidas')
ORDER BY order_num;

-- Ver ítems por categoría
SELECT 
  c.name as categoria,
  mi.name as item,
  mi.price,
  mi.visual_type,
  mi.is_featured,
  mi.is_available
FROM menu_items mi
JOIN categories c ON mi.category_id = c.id
WHERE c.slug IN ('destacados', 'completos', 'sandwiches', 'acompanamientos', 'pollo', 'bebidas')
ORDER BY c.order_num, mi.order_num;

-- =====================================================
-- ¡LISTO! Menú poblado correctamente
-- =====================================================




