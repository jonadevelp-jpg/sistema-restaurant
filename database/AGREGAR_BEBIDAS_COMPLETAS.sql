-- =====================================================
-- SCRIPT PARA AGREGAR TODAS LAS BEBIDAS AL MENÚ
-- =====================================================
-- Ejecutar en Supabase SQL Editor
-- 
-- Este script agrega todas las bebidas identificadas en las imágenes:
-- - Coca-Cola (varios tamaños)
-- - Pepsi (varios tamaños)
-- - Fanta (varios tamaños y sabores)
-- - Sprite (varios tamaños)
-- - Red Bull (clásico y edición verano)
-- - Fruna (varios sabores)
-- - Powerade (varios tamaños)
-- - Watts (varios sabores)
-- - Bilz, Pap, Kem
-- - Agua (con gas y sin gas)
-- =====================================================

DO $$
DECLARE
  v_bebidas_id INTEGER;
  v_order_num INTEGER;
BEGIN
  -- Obtener ID de categoría Bebidas
  SELECT id INTO v_bebidas_id
  FROM categories
  WHERE slug IN ('bebidas', 'bebestibles')
    AND is_active = true
  ORDER BY CASE WHEN slug = 'bebidas' THEN 1 ELSE 2 END
  LIMIT 1;
  
  IF v_bebidas_id IS NULL THEN
    RAISE EXCEPTION '❌ No se encontró la categoría de bebidas. Por favor crea primero la categoría "Bebidas" desde la interfaz de gestión de menú.';
  END IF;
  
  -- Obtener el siguiente order_num
  SELECT COALESCE(MAX(order_num), 0) + 1
  INTO v_order_num
  FROM menu_items
  WHERE category_id = v_bebidas_id;
  
  -- =====================================================
  -- COCA-COLA
  -- =====================================================
  INSERT INTO menu_items (name, description, price, category_id, is_available, is_featured, order_num, visual_type)
  VALUES
    ('Coca-Cola 350ml', 'Coca-Cola Sabor Original - Lata 350ml', 1500, v_bebidas_id, true, false, v_order_num, 'drink')
    ON CONFLICT DO NOTHING;
  v_order_num := v_order_num + 1;
  
  INSERT INTO menu_items (name, description, price, category_id, is_available, is_featured, order_num, visual_type)
  VALUES
    ('Coca-Cola 500ml', 'Coca-Cola Sabor Original - Botella 500ml', 1800, v_bebidas_id, true, false, v_order_num, 'drink')
    ON CONFLICT DO NOTHING;
  v_order_num := v_order_num + 1;
  
  INSERT INTO menu_items (name, description, price, category_id, is_available, is_featured, order_num, visual_type)
  VALUES
    ('Coca-Cola 591ml', 'Coca-Cola Sabor Original - Botella 591ml', 2000, v_bebidas_id, true, false, v_order_num, 'drink')
    ON CONFLICT DO NOTHING;
  v_order_num := v_order_num + 1;
  
  INSERT INTO menu_items (name, description, price, category_id, is_available, is_featured, order_num, visual_type)
  VALUES
    ('Coca-Cola 3L', 'Coca-Cola Sabor Original - Botella 3 Litros', 4000, v_bebidas_id, true, false, v_order_num, 'drink')
    ON CONFLICT DO NOTHING;
  v_order_num := v_order_num + 1;
  
  -- =====================================================
  -- PEPSI
  -- =====================================================
  INSERT INTO menu_items (name, description, price, category_id, is_available, is_featured, order_num, visual_type)
  VALUES
    ('Pepsi 350ml', 'Pepsi - Lata 350ml', 1500, v_bebidas_id, true, false, v_order_num, 'drink')
    ON CONFLICT DO NOTHING;
  v_order_num := v_order_num + 1;
  
  INSERT INTO menu_items (name, description, price, category_id, is_available, is_featured, order_num, visual_type)
  VALUES
    ('Pepsi 500ml', 'Pepsi - Botella 500ml', 1800, v_bebidas_id, true, false, v_order_num, 'drink')
    ON CONFLICT DO NOTHING;
  v_order_num := v_order_num + 1;
  
  INSERT INTO menu_items (name, description, price, category_id, is_available, is_featured, order_num, visual_type)
  VALUES
    ('Pepsi 591ml', 'Pepsi - Botella 591ml', 2000, v_bebidas_id, true, false, v_order_num, 'drink')
    ON CONFLICT DO NOTHING;
  v_order_num := v_order_num + 1;
  
  INSERT INTO menu_items (name, description, price, category_id, is_available, is_featured, order_num, visual_type)
  VALUES
    ('Pepsi 3L', 'Pepsi - Botella 3 Litros', 4000, v_bebidas_id, true, false, v_order_num, 'drink')
    ON CONFLICT DO NOTHING;
  v_order_num := v_order_num + 1;
  
  -- =====================================================
  -- FANTA
  -- =====================================================
  INSERT INTO menu_items (name, description, price, category_id, is_available, is_featured, order_num, visual_type)
  VALUES
    ('Fanta Naranja 350ml', 'Fanta Sabor Naranja - Lata 350ml', 1500, v_bebidas_id, true, false, v_order_num, 'drink')
    ON CONFLICT DO NOTHING;
  v_order_num := v_order_num + 1;
  
  INSERT INTO menu_items (name, description, price, category_id, is_available, is_featured, order_num, visual_type)
  VALUES
    ('Fanta Naranja 500ml', 'Fanta Sabor Naranja - Botella 500ml', 1800, v_bebidas_id, true, false, v_order_num, 'drink')
    ON CONFLICT DO NOTHING;
  v_order_num := v_order_num + 1;
  
  INSERT INTO menu_items (name, description, price, category_id, is_available, is_featured, order_num, visual_type)
  VALUES
    ('Fanta Naranja 591ml', 'Fanta Sabor Naranja - Botella 591ml', 2000, v_bebidas_id, true, false, v_order_num, 'drink')
    ON CONFLICT DO NOTHING;
  v_order_num := v_order_num + 1;
  
  -- =====================================================
  -- SPRITE
  -- =====================================================
  INSERT INTO menu_items (name, description, price, category_id, is_available, is_featured, order_num, visual_type)
  VALUES
    ('Sprite 350ml', 'Sprite Sabor Lima-Limón - Lata 350ml', 1500, v_bebidas_id, true, false, v_order_num, 'drink')
    ON CONFLICT DO NOTHING;
  v_order_num := v_order_num + 1;
  
  INSERT INTO menu_items (name, description, price, category_id, is_available, is_featured, order_num, visual_type)
  VALUES
    ('Sprite 500ml', 'Sprite Sabor Lima-Limón - Botella 500ml', 1800, v_bebidas_id, true, false, v_order_num, 'drink')
    ON CONFLICT DO NOTHING;
  v_order_num := v_order_num + 1;
  
  INSERT INTO menu_items (name, description, price, category_id, is_available, is_featured, order_num, visual_type)
  VALUES
    ('Sprite 591ml', 'Sprite Sabor Lima-Limón - Botella 591ml', 2000, v_bebidas_id, true, false, v_order_num, 'drink')
    ON CONFLICT DO NOTHING;
  v_order_num := v_order_num + 1;
  
  -- =====================================================
  -- RED BULL
  -- =====================================================
  INSERT INTO menu_items (name, description, price, category_id, is_available, is_featured, order_num, visual_type)
  VALUES
    ('Red Bull 250ml', 'Red Bull Energy Drink - Lata 250ml', 2000, v_bebidas_id, true, false, v_order_num, 'drink')
    ON CONFLICT DO NOTHING;
  v_order_num := v_order_num + 1;
  
  INSERT INTO menu_items (name, description, price, category_id, is_available, is_featured, order_num, visual_type)
  VALUES
    ('Red Bull Summer 250ml', 'Red Bull Summer Edition - Sabor Curuba & Flor de Sauco - Lata 250ml', 2000, v_bebidas_id, true, false, v_order_num, 'drink')
    ON CONFLICT DO NOTHING;
  v_order_num := v_order_num + 1;
  
  -- =====================================================
  -- FRUNA
  -- =====================================================
  INSERT INTO menu_items (name, description, price, category_id, is_available, is_featured, order_num, visual_type)
  VALUES
    ('Fruna Naranja 500ml', 'Fruna Sabor Naranja - Botella 500ml', 1000, v_bebidas_id, true, false, v_order_num, 'drink')
    ON CONFLICT DO NOTHING;
  v_order_num := v_order_num + 1;
  
  INSERT INTO menu_items (name, description, price, category_id, is_available, is_featured, order_num, visual_type)
  VALUES
    ('Fruna Limón Sour 500ml', 'Fruna Sabor Limón Sour - Botella 500ml', 1000, v_bebidas_id, true, false, v_order_num, 'drink')
    ON CONFLICT DO NOTHING;
  v_order_num := v_order_num + 1;
  
  INSERT INTO menu_items (name, description, price, category_id, is_available, is_featured, order_num, visual_type)
  VALUES
    ('Fruna Papaya 500ml', 'Fruna Sabor Papaya - Botella 500ml', 1000, v_bebidas_id, true, false, v_order_num, 'drink')
    ON CONFLICT DO NOTHING;
  v_order_num := v_order_num + 1;
  
  -- =====================================================
  -- POWERADE
  -- =====================================================
  INSERT INTO menu_items (name, description, price, category_id, is_available, is_featured, order_num, visual_type)
  VALUES
    ('Powerade 850ml', 'Powerade Frozen Blast - Hidratación Duradera - Botella 850ml', 2000, v_bebidas_id, true, false, v_order_num, 'drink')
    ON CONFLICT DO NOTHING;
  v_order_num := v_order_num + 1;
  
  -- =====================================================
  -- WATTS
  -- =====================================================
  INSERT INTO menu_items (name, description, price, category_id, is_available, is_featured, order_num, visual_type)
  VALUES
    ('Watts Naranja 1.5L', 'Watts Néctar de Fruta Natural Naranja - Reducido en Calorías - 0%% Azúcar Añadido - Botella 1.5L', 2500, v_bebidas_id, true, false, v_order_num, 'drink')
    ON CONFLICT DO NOTHING;
  v_order_num := v_order_num + 1;
  
  INSERT INTO menu_items (name, description, price, category_id, is_available, is_featured, order_num, visual_type)
  VALUES
    ('Watts Durazno 1.5L', 'Watts Néctar de Fruta Natural Durazno - Reducido en Calorías - Botella 1.5L', 2500, v_bebidas_id, true, false, v_order_num, 'drink')
    ON CONFLICT DO NOTHING;
  v_order_num := v_order_num + 1;
  
  -- =====================================================
  -- BILZ
  -- =====================================================
  INSERT INTO menu_items (name, description, price, category_id, is_available, is_featured, order_num, visual_type)
  VALUES
    ('Bilz 600ml', 'Bilz Más Sabor 100ml Extra - Botella 600ml', 1800, v_bebidas_id, true, false, v_order_num, 'drink')
    ON CONFLICT DO NOTHING;
  v_order_num := v_order_num + 1;
  
  -- =====================================================
  -- PAP
  -- =====================================================
  INSERT INTO menu_items (name, description, price, category_id, is_available, is_featured, order_num, visual_type)
  VALUES
    ('Pap 600ml', 'Pap Más Sabor 100ml Extra - Botella 600ml', 1800, v_bebidas_id, true, false, v_order_num, 'drink')
    ON CONFLICT DO NOTHING;
  v_order_num := v_order_num + 1;
  
  -- =====================================================
  -- KEM
  -- =====================================================
  INSERT INTO menu_items (name, description, price, category_id, is_available, is_featured, order_num, visual_type)
  VALUES
    ('Kem 600ml', 'Kem Tu Sabor Tropical - Más Sabor 100ml Extra - Botella 600ml', 1800, v_bebidas_id, true, false, v_order_num, 'drink')
    ON CONFLICT DO NOTHING;
  v_order_num := v_order_num + 1;
  
  -- =====================================================
  -- AGUA
  -- =====================================================
  INSERT INTO menu_items (name, description, price, category_id, is_available, is_featured, order_num, visual_type)
  VALUES
    ('Agua Sin Gas 500ml', 'Agua Premium Natural - Sin Gas - Botella 500ml', 1000, v_bebidas_id, true, false, v_order_num, 'drink')
    ON CONFLICT DO NOTHING;
  v_order_num := v_order_num + 1;
  
  INSERT INTO menu_items (name, description, price, category_id, is_available, is_featured, order_num, visual_type)
  VALUES
    ('Agua Con Gas 500ml', 'Agua Premium Natural - Con Gas - Botella 500ml', 1000, v_bebidas_id, true, false, v_order_num, 'drink')
    ON CONFLICT DO NOTHING;
  v_order_num := v_order_num + 1;
  
  INSERT INTO menu_items (name, description, price, category_id, is_available, is_featured, order_num, visual_type)
  VALUES
    ('Agua Cachantún Grande', 'Agua Cachantún - Botella Grande', 2500, v_bebidas_id, true, false, v_order_num, 'drink')
    ON CONFLICT DO NOTHING;
  v_order_num := v_order_num + 1;
  
  -- =====================================================
  -- 7UP (si existe)
  -- =====================================================
  INSERT INTO menu_items (name, description, price, category_id, is_available, is_featured, order_num, visual_type)
  VALUES
    ('7UP 350ml', '7UP - Lata 350ml', 1500, v_bebidas_id, true, false, v_order_num, 'drink')
    ON CONFLICT DO NOTHING;
  v_order_num := v_order_num + 1;
  
  INSERT INTO menu_items (name, description, price, category_id, is_available, is_featured, order_num, visual_type)
  VALUES
    ('7UP 500ml', '7UP - Botella 500ml', 1800, v_bebidas_id, true, false, v_order_num, 'drink')
    ON CONFLICT DO NOTHING;
  v_order_num := v_order_num + 1;
  
  -- =====================================================
  -- GATORADE (si existe)
  -- =====================================================
  INSERT INTO menu_items (name, description, price, category_id, is_available, is_featured, order_num, visual_type)
  VALUES
    ('Gatorade 500ml', 'Gatorade - Botella 500ml', 2000, v_bebidas_id, true, false, v_order_num, 'drink')
    ON CONFLICT DO NOTHING;
  v_order_num := v_order_num + 1;
  
  -- =====================================================
  -- CRUSH
  -- =====================================================
  INSERT INTO menu_items (name, description, price, category_id, is_available, is_featured, order_num, visual_type)
  VALUES
    ('Crush Grande', 'Crush - Botella Grande', 4000, v_bebidas_id, true, false, v_order_num, 'drink')
    ON CONFLICT DO NOTHING;
  v_order_num := v_order_num + 1;
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ ==========================================';
  RAISE NOTICE '✅ BEBIDAS AGREGADAS EXITOSAMENTE';
  RAISE NOTICE '✅ ==========================================';
  RAISE NOTICE '✅ Total de bebidas agregadas: %', v_order_num - (SELECT COALESCE(MAX(order_num), 0) FROM menu_items WHERE category_id = v_bebidas_id);
  RAISE NOTICE '✅ Categoría: Bebidas (ID: %)', v_bebidas_id;
  
END $$;

-- Verificación: Mostrar todas las bebidas agregadas
SELECT 
  id,
  name,
  description,
  price,
  is_available,
  order_num
FROM menu_items
WHERE category_id = (
  SELECT id FROM categories 
  WHERE slug IN ('bebidas', 'bebestibles') 
    AND is_active = true 
  ORDER BY CASE WHEN slug = 'bebidas' THEN 1 ELSE 2 END 
  LIMIT 1
)
ORDER BY order_num;

