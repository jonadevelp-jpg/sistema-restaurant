-- =====================================================
-- AGREGAR CAMPO image_url A CATEGORÍAS
-- =====================================================
-- Este script agrega el campo image_url a la tabla categories
-- para permitir subir imágenes a las categorías
-- Ejecutar en Supabase SQL Editor

-- Agregar columna image_url si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' 
    AND column_name = 'image_url'
  ) THEN
    ALTER TABLE categories 
    ADD COLUMN image_url TEXT;
    
    RAISE NOTICE '✅ Columna image_url agregada a categories';
  ELSE
    RAISE NOTICE 'ℹ️  La columna image_url ya existe en categories';
  END IF;
END $$;

-- Verificación
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ VERIFICACIÓN';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Campo image_url agregado a la tabla categories';
  RAISE NOTICE '   Ahora puedes subir imágenes para las categorías desde';
  RAISE NOTICE '   el panel de administración.';
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
END $$;



