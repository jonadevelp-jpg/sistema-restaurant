-- =====================================================
-- SCRIPT PARA AGREGAR "PAPAS FRITAS GRANDES" AL MENÚ
-- =====================================================
-- Ejecutar en Supabase SQL Editor
-- 
-- Este script:
-- 1. Busca el item "Papas Fritas" (pequeñas)
-- 2. Obtiene su imagen y categoría
-- 3. Crea un nuevo item "Papas Fritas Grandes" a $5000
-- 4. Usa la misma imagen que las papas fritas pequeñas
-- =====================================================

DO $$
DECLARE
  v_papas_pequenas_id INTEGER;
  v_papas_pequenas_image_url TEXT;
  v_papas_pequenas_category_id INTEGER;
  v_papas_pequenas_order_num INTEGER;
  v_papas_grandes_id INTEGER;
BEGIN
  -- Buscar el item "Papas Fritas" (pequeñas)
  SELECT id, image_url, category_id, order_num
  INTO v_papas_pequenas_id, v_papas_pequenas_image_url, v_papas_pequenas_category_id, v_papas_pequenas_order_num
  FROM menu_items
  WHERE LOWER(TRIM(name)) LIKE '%papas fritas%'
    AND LOWER(TRIM(name)) NOT LIKE '%grandes%'
  ORDER BY 
    CASE WHEN LOWER(TRIM(name)) = 'papas fritas' THEN 1 ELSE 2 END,
    id
  LIMIT 1;
  
  -- Si no se encuentra, intentar buscar solo "Papas Fritas"
  IF v_papas_pequenas_id IS NULL THEN
    SELECT id, image_url, category_id, order_num
    INTO v_papas_pequenas_id, v_papas_pequenas_image_url, v_papas_pequenas_category_id, v_papas_pequenas_order_num
    FROM menu_items
    WHERE LOWER(TRIM(name)) = 'papas fritas'
    LIMIT 1;
  END IF;
  
  -- Verificar si ya existe "Papas Fritas Grandes"
  SELECT id INTO v_papas_grandes_id
  FROM menu_items
  WHERE LOWER(TRIM(name)) LIKE '%papas fritas%grandes%'
     OR LOWER(TRIM(name)) = 'papas fritas grandes';
  
  IF v_papas_grandes_id IS NOT NULL THEN
    RAISE NOTICE '⚠️ El item "Papas Fritas Grandes" ya existe (ID: %). Se actualizará el precio a $5000.', v_papas_grandes_id;
    
    -- Actualizar precio y asegurar que tenga la misma imagen
    UPDATE menu_items
    SET 
      price = 5000,
      image_url = COALESCE(image_url, v_papas_pequenas_image_url),
      is_available = true,
      updated_at = NOW()
    WHERE id = v_papas_grandes_id;
    
    RAISE NOTICE '✅ Item "Papas Fritas Grandes" actualizado correctamente (ID: %)', v_papas_grandes_id;
  ELSIF v_papas_pequenas_id IS NULL THEN
    RAISE EXCEPTION '❌ No se encontró el item "Papas Fritas" en el menú. Por favor crea primero "Papas Fritas" (pequeñas) desde la interfaz de gestión de menú.';
  ELSE
    -- Obtener el siguiente order_num para la categoría
    SELECT COALESCE(MAX(order_num), 0) + 1
    INTO v_papas_pequenas_order_num
    FROM menu_items
    WHERE category_id = v_papas_pequenas_category_id;
    
    -- Crear el nuevo item "Papas Fritas Grandes"
    INSERT INTO menu_items (
      name,
      description,
      price,
      category_id,
      image_url,
      is_available,
      is_featured,
      order_num,
      visual_type
    )
    VALUES (
      'Papas Fritas Grandes',
      'Papas fritas crujientes - Porción grande',
      5000,
      v_papas_pequenas_category_id,
      v_papas_pequenas_image_url, -- Misma imagen que las pequeñas
      true,
      false,
      v_papas_pequenas_order_num,
      COALESCE(
        (SELECT visual_type FROM menu_items WHERE id = v_papas_pequenas_id),
        'list'
      )
    )
    RETURNING id INTO v_papas_grandes_id;
    
    RAISE NOTICE '✅ Item "Papas Fritas Grandes" creado correctamente (ID: %)', v_papas_grandes_id;
    RAISE NOTICE '   - Precio: $5.000';
    RAISE NOTICE '   - Categoría ID: %', v_papas_pequenas_category_id;
    RAISE NOTICE '   - Imagen: %', COALESCE(v_papas_pequenas_image_url, 'Sin imagen');
  END IF;
  
  -- Verificación final (comentada - solo para mostrar información)
  -- El item ya fue creado/actualizado arriba
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ ==========================================';
  RAISE NOTICE '✅ PROCESO COMPLETADO EXITOSAMENTE';
  RAISE NOTICE '✅ ==========================================';
  RAISE NOTICE '✅ Item "Papas Fritas Grandes" disponible en el menú';
  RAISE NOTICE '✅ Precio: $5.000';
  RAISE NOTICE '✅ Usa la misma imagen que "Papas Fritas" (pequeñas)';
  
END $$;

-- Verificación: Mostrar el item creado
SELECT 
  id,
  name,
  price,
  category_id,
  image_url,
  is_available,
  visual_type
FROM menu_items
WHERE LOWER(TRIM(name)) LIKE '%papas fritas%grandes%'
   OR LOWER(TRIM(name)) = 'papas fritas grandes'
ORDER BY created_at DESC
LIMIT 1;

