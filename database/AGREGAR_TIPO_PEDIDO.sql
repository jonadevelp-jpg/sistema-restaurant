-- =====================================================
-- SCRIPT PARA AGREGAR CAMPO tipo_pedido A ordenes_restaurante
-- =====================================================
-- Ejecutar en Supabase SQL Editor
-- Este script agrega el campo tipo_pedido si no existe

-- Agregar columna tipo_pedido a ordenes_restaurante
ALTER TABLE ordenes_restaurante
ADD COLUMN IF NOT EXISTS tipo_pedido TEXT CHECK (tipo_pedido IN ('barra', 'llevar'));

-- Crear índice para búsquedas por tipo_pedido
CREATE INDEX IF NOT EXISTS idx_ordenes_tipo_pedido ON ordenes_restaurante(tipo_pedido);

-- Agregar comentario
COMMENT ON COLUMN ordenes_restaurante.tipo_pedido IS 'Tipo de pedido: barra (consumir en barra) o llevar (para llevar). NULL para órdenes antiguas con mesa.';

-- Verificar que se agregó correctamente
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'ordenes_restaurante'
    AND column_name = 'tipo_pedido'
  ) THEN
    RAISE EXCEPTION 'Error: Columna tipo_pedido no se agregó correctamente';
  ELSE
    RAISE NOTICE '✅ Columna tipo_pedido agregada correctamente';
  END IF;
END $$;

