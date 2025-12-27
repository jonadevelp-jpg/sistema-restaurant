-- =====================================================
-- VERIFICAR QUE EL CAMPO image_url EXISTE
-- =====================================================
-- Ejecutar en Supabase SQL Editor

-- Verificar que el campo existe
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'categories'
  AND column_name = 'image_url';

-- Si el campo NO existe, ejecuta esto:
-- ALTER TABLE categories ADD COLUMN image_url TEXT;

