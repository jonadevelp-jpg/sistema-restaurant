-- =====================================================
-- SCRIPT PARA SINCRONIZAR BEBIDAS ENTRE STOCK Y MENÚ
-- =====================================================
-- Ejecutar en Supabase SQL Editor
-- 
-- Este script:
-- 1. Agrega campo image_url a stock_panes_bebidas
-- 2. Crea triggers para sincronizar bebidas entre stock y menú
-- 3. Cuando se crea/actualiza una bebida en stock → se crea/actualiza en menu_items
-- 4. Cuando se crea/actualiza una bebida en menu_items → se crea/actualiza en stock
-- =====================================================

-- =====================================================
-- 1. AGREGAR CAMPO IMAGE_URL A STOCK_PANES_BEBIDAS
-- =====================================================

ALTER TABLE stock_panes_bebidas 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Comentario
COMMENT ON COLUMN stock_panes_bebidas.image_url IS 'URL de la imagen de la bebida (opcional). Se sincroniza con menu_items.';

-- =====================================================
-- 2. FUNCIÓN PARA OBTENER ID DE CATEGORÍA BEBIDAS
-- =====================================================

CREATE OR REPLACE FUNCTION get_bebidas_category_id()
RETURNS INTEGER AS $$
DECLARE
  cat_id INTEGER;
BEGIN
  -- Buscar categoría "bebidas" o "bebestibles"
  SELECT id INTO cat_id
  FROM categories
  WHERE slug IN ('bebidas', 'bebestibles')
    AND is_active = true
  ORDER BY CASE WHEN slug = 'bebidas' THEN 1 ELSE 2 END
  LIMIT 1;
  
  RETURN cat_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. FUNCIÓN PARA SINCRONIZAR BEBIDA DE STOCK A MENÚ
-- =====================================================

CREATE OR REPLACE FUNCTION sincronizar_bebida_stock_a_menu()
RETURNS TRIGGER AS $$
DECLARE
  categoria_bebidas_id INTEGER;
  menu_item_id INTEGER;
BEGIN
  -- Solo procesar si es una bebida
  IF NEW.tipo = 'bebida' THEN
    -- Obtener ID de categoría bebidas
    categoria_bebidas_id := get_bebidas_category_id();
    
    IF categoria_bebidas_id IS NULL THEN
      RAISE WARNING 'No se encontró categoría de bebidas activa. La bebida no se sincronizará al menú.';
      RETURN NEW;
    END IF;
    
    -- Buscar si ya existe un menu_item con el mismo nombre
    SELECT id INTO menu_item_id
    FROM menu_items
    WHERE LOWER(TRIM(name)) = LOWER(TRIM(NEW.nombre))
      AND category_id = categoria_bebidas_id
    LIMIT 1;
    
    IF TG_OP = 'INSERT' THEN
      -- Crear nuevo item en menú si no existe
      IF menu_item_id IS NULL THEN
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
          NEW.nombre,
          'Bebida: ' || NEW.nombre,
          NEW.precio_unitario,
          categoria_bebidas_id,
          NEW.image_url,
          NEW.cantidad > 0, -- Disponible solo si hay stock
          false,
          (SELECT COALESCE(MAX(order_num), 0) + 1 FROM menu_items WHERE category_id = categoria_bebidas_id),
          'drink'
        )
        RETURNING id INTO menu_item_id;
        
        RAISE NOTICE '✅ Bebida "%" creada en menú (ID: %)', NEW.nombre, menu_item_id;
      ELSE
        -- Si existe, actualizar
        UPDATE menu_items
        SET 
          price = NEW.precio_unitario,
          image_url = NEW.image_url,
          is_available = NEW.cantidad > 0,
          updated_at = NOW()
        WHERE id = menu_item_id;
        
        RAISE NOTICE '✅ Bebida "%" actualizada en menú (ID: %)', NEW.nombre, menu_item_id;
      END IF;
    ELSIF TG_OP = 'UPDATE' THEN
      -- Actualizar item en menú
      IF menu_item_id IS NOT NULL THEN
        UPDATE menu_items
        SET 
          name = NEW.nombre,
          price = NEW.precio_unitario,
          image_url = NEW.image_url,
          is_available = NEW.cantidad > 0,
          updated_at = NOW()
        WHERE id = menu_item_id;
        
        RAISE NOTICE '✅ Bebida "%" actualizada en menú (ID: %)', NEW.nombre, menu_item_id;
      ELSE
        -- Si no existe, crear
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
          NEW.nombre,
          'Bebida: ' || NEW.nombre,
          NEW.precio_unitario,
          categoria_bebidas_id,
          NEW.image_url,
          NEW.cantidad > 0,
          false,
          (SELECT COALESCE(MAX(order_num), 0) + 1 FROM menu_items WHERE category_id = categoria_bebidas_id),
          'drink'
        )
        RETURNING id INTO menu_item_id;
        
        RAISE NOTICE '✅ Bebida "%" creada en menú (ID: %)', NEW.nombre, menu_item_id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. FUNCIÓN PARA SINCRONIZAR BEBIDA DE MENÚ A STOCK
-- =====================================================

CREATE OR REPLACE FUNCTION sincronizar_bebida_menu_a_stock()
RETURNS TRIGGER AS $$
DECLARE
  categoria_slug_item TEXT;
  stock_item_id UUID;
BEGIN
  -- Obtener slug de la categoría
  SELECT c.slug INTO categoria_slug_item
  FROM categories c
  WHERE c.id = NEW.category_id;
  
  -- Solo procesar si es categoría de bebidas
  IF categoria_slug_item IN ('bebidas', 'bebestibles') THEN
    -- Buscar si ya existe en stock
    SELECT id INTO stock_item_id
    FROM stock_panes_bebidas
    WHERE tipo = 'bebida'
      AND LOWER(TRIM(nombre)) = LOWER(TRIM(NEW.name))
    LIMIT 1;
    
    IF TG_OP = 'INSERT' THEN
      -- Crear en stock si no existe
      IF stock_item_id IS NULL THEN
        INSERT INTO stock_panes_bebidas (
          tipo,
          nombre,
          categoria_slug,
          cantidad,
          precio_unitario,
          stock_minimo,
          unidad_medida,
          image_url
        )
        VALUES (
          'bebida',
          NEW.name,
          NULL, -- Las bebidas no tienen categoria_slug en stock
          CASE WHEN NEW.is_available THEN 1 ELSE 0 END, -- Stock inicial basado en disponibilidad
          NEW.price,
          0, -- Stock mínimo por defecto
          'un',
          NEW.image_url
        );
        
        RAISE NOTICE '✅ Bebida "%" creada en stock', NEW.name;
      ELSE
        -- Si existe, actualizar
        UPDATE stock_panes_bebidas
        SET 
          precio_unitario = NEW.price,
          image_url = NEW.image_url,
          updated_at = NOW()
        WHERE id = stock_item_id;
        
        RAISE NOTICE '✅ Bebida "%" actualizada en stock', NEW.name;
      END IF;
    ELSIF TG_OP = 'UPDATE' THEN
      -- Actualizar en stock
      IF stock_item_id IS NOT NULL THEN
        UPDATE stock_panes_bebidas
        SET 
          nombre = NEW.name,
          precio_unitario = NEW.price,
          image_url = NEW.image_url,
          cantidad = CASE WHEN NEW.is_available THEN GREATEST(cantidad, 1) ELSE cantidad END, -- Mantener stock si está disponible
          updated_at = NOW()
        WHERE id = stock_item_id;
        
        RAISE NOTICE '✅ Bebida "%" actualizada en stock', NEW.name;
      ELSE
        -- Si no existe, crear
        INSERT INTO stock_panes_bebidas (
          tipo,
          nombre,
          categoria_slug,
          cantidad,
          precio_unitario,
          stock_minimo,
          unidad_medida,
          image_url
        )
        VALUES (
          'bebida',
          NEW.name,
          NULL,
          CASE WHEN NEW.is_available THEN 1 ELSE 0 END,
          NEW.price,
          0,
          'un',
          NEW.image_url
        );
        
        RAISE NOTICE '✅ Bebida "%" creada en stock', NEW.name;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. CREAR TRIGGERS
-- =====================================================

-- Trigger: Cuando se crea/actualiza bebida en stock → sincronizar a menú
DROP TRIGGER IF EXISTS trigger_sincronizar_bebida_stock_a_menu ON stock_panes_bebidas;

CREATE TRIGGER trigger_sincronizar_bebida_stock_a_menu
  AFTER INSERT OR UPDATE ON stock_panes_bebidas
  FOR EACH ROW
  WHEN (NEW.tipo = 'bebida')
  EXECUTE FUNCTION sincronizar_bebida_stock_a_menu();

-- Trigger: Cuando se crea/actualiza bebida en menú → sincronizar a stock
DROP TRIGGER IF EXISTS trigger_sincronizar_bebida_menu_a_stock ON menu_items;

CREATE TRIGGER trigger_sincronizar_bebida_menu_a_stock
  AFTER INSERT OR UPDATE ON menu_items
  FOR EACH ROW
  EXECUTE FUNCTION sincronizar_bebida_menu_a_stock();

-- =====================================================
-- 6. SINCRONIZAR BEBIDAS EXISTENTES
-- =====================================================

-- Sincronizar bebidas existentes en stock hacia menú
DO $$
DECLARE
  bebida_record RECORD;
  categoria_bebidas_id INTEGER;
BEGIN
  categoria_bebidas_id := get_bebidas_category_id();
  
  IF categoria_bebidas_id IS NULL THEN
    RAISE WARNING 'No se encontró categoría de bebidas. No se sincronizarán bebidas existentes.';
  ELSE
    FOR bebida_record IN 
      SELECT * FROM stock_panes_bebidas WHERE tipo = 'bebida'
    LOOP
      -- Verificar si ya existe en menú
      IF NOT EXISTS (
        SELECT 1 FROM menu_items 
        WHERE LOWER(TRIM(name)) = LOWER(TRIM(bebida_record.nombre))
          AND category_id = categoria_bebidas_id
      ) THEN
        -- Crear en menú
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
          bebida_record.nombre,
          'Bebida: ' || bebida_record.nombre,
          bebida_record.precio_unitario,
          categoria_bebidas_id,
          bebida_record.image_url,
          bebida_record.cantidad > 0,
          false,
          (SELECT COALESCE(MAX(order_num), 0) + 1 FROM menu_items WHERE category_id = categoria_bebidas_id),
          'drink'
        );
        
        RAISE NOTICE '✅ Bebida "%" sincronizada al menú', bebida_record.nombre;
      END IF;
    END LOOP;
  END IF;
END $$;

-- =====================================================
-- 7. VERIFICACIÓN
-- =====================================================

DO $$
BEGIN
  -- Verificar que el campo image_url existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stock_panes_bebidas' 
    AND column_name = 'image_url'
  ) THEN
    RAISE EXCEPTION 'Error: Columna image_url no se agregó correctamente';
  END IF;
  
  -- Verificar que las funciones existen
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'sincronizar_bebida_stock_a_menu'
  ) THEN
    RAISE EXCEPTION 'Error: Función sincronizar_bebida_stock_a_menu no se creó correctamente';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'sincronizar_bebida_menu_a_stock'
  ) THEN
    RAISE EXCEPTION 'Error: Función sincronizar_bebida_menu_a_stock no se creó correctamente';
  END IF;
  
  RAISE NOTICE '✅ Sistema de sincronización de bebidas configurado correctamente';
  RAISE NOTICE '   - Campo image_url agregado a stock_panes_bebidas';
  RAISE NOTICE '   - Triggers creados para sincronización bidireccional';
  RAISE NOTICE '   - Bebidas existentes sincronizadas';
END $$;

