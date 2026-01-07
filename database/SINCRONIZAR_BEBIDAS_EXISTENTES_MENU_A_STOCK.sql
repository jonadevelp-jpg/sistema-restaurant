-- =====================================================
-- SINCRONIZAR BEBIDAS EXISTENTES DEL MENÚ AL STOCK
-- =====================================================
-- Este script sincroniza todas las bebidas que ya existen
-- en el menú (menu_items) hacia la tabla de stock (stock_panes_bebidas)
-- para que aparezcan en la página de gestión de stock.
--
-- Ejecutar en Supabase SQL Editor
-- =====================================================

DO $$
DECLARE
  categoria_bebidas_id UUID;
  categoria_bebestibles_id UUID;
  bebida_item RECORD;
  stock_existente_id UUID;
  bebidas_sincronizadas INTEGER := 0;
  bebidas_actualizadas INTEGER := 0;
BEGIN
  -- Obtener IDs de categorías de bebidas
  SELECT id INTO categoria_bebidas_id
  FROM categories
  WHERE slug = 'bebidas'
  LIMIT 1;
  
  SELECT id INTO categoria_bebestibles_id
  FROM categories
  WHERE slug = 'bebestibles'
  LIMIT 1;
  
  -- Verificar que las categorías existen
  IF categoria_bebidas_id IS NULL AND categoria_bebestibles_id IS NULL THEN
    RAISE EXCEPTION 'No se encontraron las categorías "bebidas" o "bebestibles". Asegúrate de que existan en la tabla categories.';
  END IF;
  
  RAISE NOTICE '🔄 Iniciando sincronización de bebidas del menú al stock...';
  RAISE NOTICE '📋 Categoría bebidas ID: %', categoria_bebidas_id;
  RAISE NOTICE '📋 Categoría bebestibles ID: %', categoria_bebestibles_id;
  
  -- Iterar sobre todas las bebidas en el menú
  FOR bebida_item IN
    SELECT 
      mi.id,
      mi.name,
      mi.price,
      mi.image_url,
      mi.category_id,
      mi.is_available,
      mi.visual_type,
      c.slug as categoria_slug
    FROM menu_items mi
    INNER JOIN categories c ON c.id = mi.category_id
    WHERE 
      (mi.category_id = categoria_bebidas_id OR mi.category_id = categoria_bebestibles_id)
      AND (mi.visual_type = 'drink' OR mi.visual_type IS NULL)
    ORDER BY mi.name
  LOOP
    -- Verificar si ya existe en stock
    SELECT id INTO stock_existente_id
    FROM stock_panes_bebidas
    WHERE tipo = 'bebida'
      AND LOWER(TRIM(nombre)) = LOWER(TRIM(bebida_item.name));
    
    IF stock_existente_id IS NULL THEN
      -- Insertar nueva bebida en stock
      INSERT INTO stock_panes_bebidas (
        tipo,
        nombre,
        cantidad,
        precio_unitario,
        unidad_medida,
        stock_minimo,
        image_url
      )
      VALUES (
        'bebida',
        bebida_item.name,
        0, -- Cantidad inicial en 0
        bebida_item.price,
        'un',
        0, -- Stock mínimo en 0
        bebida_item.image_url
      )
      ON CONFLICT (tipo, nombre) DO UPDATE SET
        precio_unitario = EXCLUDED.precio_unitario,
        image_url = COALESCE(EXCLUDED.image_url, stock_panes_bebidas.image_url);
      
      bebidas_sincronizadas := bebidas_sincronizadas + 1;
      RAISE NOTICE '✅ Bebida "%" agregada al stock (ID menú: %)', bebida_item.name, bebida_item.id;
    ELSE
      -- Actualizar bebida existente (precio e imagen si han cambiado)
      UPDATE stock_panes_bebidas
      SET 
        precio_unitario = bebida_item.price,
        image_url = COALESCE(bebida_item.image_url, image_url)
      WHERE id = stock_existente_id
        AND (precio_unitario != bebida_item.price OR image_url IS DISTINCT FROM bebida_item.image_url);
      
      IF FOUND THEN
        bebidas_actualizadas := bebidas_actualizadas + 1;
        RAISE NOTICE '🔄 Bebida "%" actualizada en stock (precio: %, imagen: %)', 
          bebida_item.name, 
          bebida_item.price,
          CASE WHEN bebida_item.image_url IS NOT NULL THEN 'Sí' ELSE 'No' END;
      END IF;
    END IF;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Sincronización completada:';
  RAISE NOTICE '   - Bebidas nuevas agregadas: %', bebidas_sincronizadas;
  RAISE NOTICE '   - Bebidas existentes actualizadas: %', bebidas_actualizadas;
  RAISE NOTICE '========================================';
  
  -- Mostrar resumen final
  RAISE NOTICE '';
  RAISE NOTICE '📊 Resumen de stock de bebidas:';
  PERFORM (
    SELECT COUNT(*) 
    FROM stock_panes_bebidas 
    WHERE tipo = 'bebida'
  ) INTO bebidas_sincronizadas;
  RAISE NOTICE '   - Total de bebidas en stock: %', bebidas_sincronizadas;
  
END $$;

-- Verificación final: Mostrar todas las bebidas en stock
SELECT 
  'Bebidas en stock después de sincronización' as estado,
  COUNT(*) as total_bebidas,
  SUM(CASE WHEN cantidad > 0 THEN 1 ELSE 0 END) as con_stock,
  SUM(CASE WHEN cantidad = 0 THEN 1 ELSE 0 END) as sin_stock
FROM stock_panes_bebidas
WHERE tipo = 'bebida';

-- Listar todas las bebidas sincronizadas
SELECT 
  id,
  nombre,
  cantidad,
  precio_unitario,
  CASE WHEN image_url IS NOT NULL THEN 'Sí' ELSE 'No' END as tiene_imagen
FROM stock_panes_bebidas
WHERE tipo = 'bebida'
ORDER BY nombre;

