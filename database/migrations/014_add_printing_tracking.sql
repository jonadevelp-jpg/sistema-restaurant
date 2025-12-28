-- =====================================================
-- MIGRACIÓN 014: CAMPOS DE SEGUIMIENTO DE IMPRESIÓN
-- =====================================================
-- Ejecutar en Supabase SQL Editor
-- 
-- Esta migración agrega campos para rastrear el estado de impresión
-- de comandas de cocina y boletas de cliente, permitiendo que el
-- servicio de impresión local consulte la BD periódicamente.

-- Agregar campos de tracking de impresión
ALTER TABLE ordenes_restaurante 
ADD COLUMN IF NOT EXISTS kitchen_printed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS receipt_printed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS kitchen_print_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS receipt_print_attempts INTEGER DEFAULT 0;

-- Índices para mejorar performance de consultas de polling
CREATE INDEX IF NOT EXISTS idx_ordenes_kitchen_print 
  ON ordenes_restaurante(estado, kitchen_printed_at) 
  WHERE estado = 'preparing' AND kitchen_printed_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_ordenes_receipt_print 
  ON ordenes_restaurante(estado, receipt_printed_at) 
  WHERE estado = 'paid' AND receipt_printed_at IS NULL;

-- Comentarios para documentación
COMMENT ON COLUMN ordenes_restaurante.kitchen_printed_at IS 
  'Timestamp cuando se imprimió la comanda de cocina. NULL = pendiente de impresión.';

COMMENT ON COLUMN ordenes_restaurante.receipt_printed_at IS 
  'Timestamp cuando se imprimió la boleta de cliente. NULL = pendiente de impresión.';

COMMENT ON COLUMN ordenes_restaurante.kitchen_print_attempts IS 
  'Número de intentos de impresión de comanda de cocina (para debugging).';

COMMENT ON COLUMN ordenes_restaurante.receipt_print_attempts IS 
  'Número de intentos de impresión de boleta (para debugging).';

-- Verificación
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'ordenes_restaurante'
  AND column_name IN ('kitchen_printed_at', 'receipt_printed_at', 'kitchen_print_attempts', 'receipt_print_attempts')
ORDER BY column_name;



