-- =====================================================
-- VERIFICAR IMÁGENES DE CATEGORÍAS
-- =====================================================
-- Ejecutar en Supabase SQL Editor
-- Este script verifica el estado de las imágenes de categorías

-- 1. Ver todas las categorías con sus imágenes
SELECT 
  id,
  name,
  slug,
  image_url,
  CASE 
    WHEN image_url IS NULL THEN '❌ Sin imagen'
    WHEN image_url = '' THEN '⚠️ URL vacía'
    WHEN LENGTH(image_url) > 500 THEN '⚠️ URL muy larga (' || LENGTH(image_url) || ' caracteres)'
    WHEN image_url LIKE 'http%' THEN '✅ URL completa (Supabase Storage)'
    WHEN image_url LIKE '/%' THEN '✅ Ruta relativa'
    ELSE '⚠️ Formato desconocido'
  END as estado_imagen,
  LENGTH(image_url) as longitud_url
FROM categories
ORDER BY id;

-- 2. Verificar el tipo de dato del campo image_url
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'categories'
  AND column_name = 'image_url';

-- 3. Ver categorías que deberían tener imagen pero no la tienen
SELECT 
  id,
  name,
  slug,
  '⚠️ Categoría activa sin imagen' as problema
FROM categories
WHERE is_active = true
  AND (image_url IS NULL OR image_url = '');

-- 4. Ver las últimas categorías (ordenadas por created_at ya que no hay updated_at)
SELECT 
  id,
  name,
  slug,
  image_url,
  created_at,
  CASE 
    WHEN image_url IS NOT NULL AND image_url != '' THEN '✅ Tiene imagen'
    ELSE '❌ Sin imagen'
  END as estado
FROM categories
ORDER BY created_at DESC
LIMIT 10;

