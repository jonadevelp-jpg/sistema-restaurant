-- =====================================================
-- CORREGIR VISUAL_TYPE DE ITEMS EN CATEGORÍA 'ACOMPAÑAMIENTOS'
-- =====================================================
-- Este script asegura que los items en la categoría 'acompanamientos'
-- que tienen una imagen, tengan su visual_type configurado como 'hero'.
-- Esto es necesario para que se rendericen como cards grandes con imagen.
-- =====================================================

DO $$
DECLARE
  v_acompanamientos_id INTEGER;
BEGIN
  -- Obtener el ID de la categoría 'acompanamientos'
  SELECT id INTO v_acompanamientos_id FROM categories WHERE slug = 'acompanamientos';

  IF v_acompanamientos_id IS NOT NULL THEN
    RAISE NOTICE '✅ Categoría "acompanamientos" encontrada con ID: %', v_acompanamientos_id;

    -- Actualizar los items de la categoría 'acompanamientos' que tienen imagen
    -- para que su visual_type sea 'hero'
    UPDATE menu_items
    SET visual_type = 'hero'
    WHERE category_id = v_acompanamientos_id
      AND image_url IS NOT NULL
      AND visual_type IS DISTINCT FROM 'hero'; -- Solo actualizar si es diferente

    RAISE NOTICE '✅ Items de "acompanamientos" con imagen actualizados a visual_type = "hero".';

    -- Opcional: Actualizar items de "acompanamientos" sin imagen a "list" si se desea un comportamiento específico
    -- UPDATE menu_items
    -- SET visual_type = 'list'
    -- WHERE category_id = v_acompanamientos_id
    --   AND image_url IS NULL
    --   AND visual_type IS DISTINCT FROM 'list';
    -- RAISE NOTICE '✅ Items de "acompanamientos" sin imagen actualizados a visual_type = "list".';

  ELSE
    RAISE WARNING '⚠️ Categoría "acompanamientos" no encontrada. No se realizaron actualizaciones de items.';
  END IF;
END $$;

-- Verificar los cambios
SELECT 
  mi.id,
  mi.name,
  mi.visual_type,
  mi.image_url,
  c.name as category_name,
  c.slug as category_slug
FROM menu_items mi
JOIN categories c ON mi.category_id = c.id
WHERE c.slug = 'acompanamientos'
ORDER BY mi.order_num;

