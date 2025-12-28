-- =====================================================
-- MIGRACIÓN 014: AGREGAR TIPO_PEDIDO Y VISUAL_TYPE
-- =====================================================
-- Ejecutar en Supabase SQL Editor
-- Esta migración adapta el sistema para restaurante sin mesas obligatorias
-- y agrega tipos visuales para el menú digital simplificado

-- =====================================================
-- 1. AGREGAR CAMPO TIPO_PEDIDO A ÓRDENES
-- =====================================================

-- Agregar columna tipo_pedido a ordenes_restaurante
ALTER TABLE ordenes_restaurante 
ADD COLUMN IF NOT EXISTS tipo_pedido TEXT CHECK (tipo_pedido IN ('barra', 'llevar'));

-- Crear índice para búsquedas por tipo_pedido
CREATE INDEX IF NOT EXISTS idx_ordenes_tipo_pedido ON ordenes_restaurante(tipo_pedido);

-- Comentario explicativo
COMMENT ON COLUMN ordenes_restaurante.tipo_pedido IS 'Tipo de pedido: barra (consumir en barra) o llevar (para llevar). NULL para órdenes antiguas con mesa.';

-- =====================================================
-- 2. AGREGAR CAMPO VISUAL_TYPE A CATEGORIES
-- =====================================================

-- Agregar columna visual_type a categories
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS visual_type TEXT CHECK (visual_type IN ('hero', 'list', 'drink'));

-- Crear índice para búsquedas por visual_type
CREATE INDEX IF NOT EXISTS idx_categories_visual_type ON categories(visual_type);

-- Comentario explicativo
COMMENT ON COLUMN categories.visual_type IS 'Tipo de visualización en menú digital: hero (cards grandes con imagen), list (lista simple), drink (grid de bebidas). NULL usa comportamiento por defecto.';

-- =====================================================
-- 3. AGREGAR CAMPO VISUAL_TYPE A MENU_ITEMS
-- =====================================================

-- Agregar columna visual_type a menu_items
ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS visual_type TEXT CHECK (visual_type IN ('hero', 'list', 'drink'));

-- Crear índice para búsquedas por visual_type
CREATE INDEX IF NOT EXISTS idx_menu_items_visual_type ON menu_items(visual_type);

-- Comentario explicativo
COMMENT ON COLUMN menu_items.visual_type IS 'Tipo de visualización en menú digital. Si es NULL, hereda de la categoría. hero (cards grandes), list (lista simple), drink (grid de bebidas).';

-- =====================================================
-- 4. ACTUALIZAR VALORES POR DEFECTO (OPCIONAL)
-- =====================================================

-- Establecer tipo_pedido = 'barra' para órdenes nuevas sin mesa_id
-- (No actualizamos órdenes existentes para mantener compatibilidad)
-- Esto se hará en el código de la aplicación al crear nuevas órdenes

-- =====================================================
-- 5. FUNCIÓN HELPER PARA OBTENER VISUAL_TYPE
-- =====================================================

-- Función para obtener el visual_type de un item (heredado de categoría si es NULL)
CREATE OR REPLACE FUNCTION get_item_visual_type(item_id INTEGER)
RETURNS TEXT AS $$
DECLARE
  item_visual_type TEXT;
  category_visual_type TEXT;
BEGIN
  -- Obtener visual_type del item
  SELECT visual_type INTO item_visual_type
  FROM menu_items
  WHERE id = item_id;
  
  -- Si el item tiene visual_type, retornarlo
  IF item_visual_type IS NOT NULL THEN
    RETURN item_visual_type;
  END IF;
  
  -- Si no, obtener visual_type de la categoría
  SELECT c.visual_type INTO category_visual_type
  FROM menu_items mi
  JOIN categories c ON mi.category_id = c.id
  WHERE mi.id = item_id;
  
  -- Retornar el visual_type de la categoría (puede ser NULL)
  RETURN category_visual_type;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. VERIFICACIÓN
-- =====================================================

-- Verificar que las columnas se agregaron correctamente
DO $$
BEGIN
  -- Verificar tipo_pedido
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ordenes_restaurante' 
    AND column_name = 'tipo_pedido'
  ) THEN
    RAISE EXCEPTION 'Error: Columna tipo_pedido no se agregó correctamente';
  END IF;
  
  -- Verificar visual_type en categories
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' 
    AND column_name = 'visual_type'
  ) THEN
    RAISE EXCEPTION 'Error: Columna visual_type en categories no se agregó correctamente';
  END IF;
  
  -- Verificar visual_type en menu_items
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'menu_items' 
    AND column_name = 'visual_type'
  ) THEN
    RAISE EXCEPTION 'Error: Columna visual_type en menu_items no se agregó correctamente';
  END IF;
  
  RAISE NOTICE '✅ Migración 014 completada exitosamente';
END $$;



