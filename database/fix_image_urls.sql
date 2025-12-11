-- =====================================================
-- CORREGIR RUTAS DE IMÁGENES
-- =====================================================
-- Ejecutar en Supabase SQL Editor
-- Este script corrige las rutas de imágenes que no tienen el / inicial

-- Ver items con rutas que necesitan corrección
SELECT 
  id,
  name,
  image_url as ruta_actual,
  CASE 
    WHEN image_url LIKE '/%' THEN '✅ Correcta'
    WHEN image_url LIKE 'http%' THEN '🔗 URL completa (Supabase Storage)'
    WHEN image_url IS NOT NULL AND image_url NOT LIKE '/%' THEN '⚠️ Necesita corrección'
    ELSE '❌ Sin imagen'
  END as estado
FROM menu_items
WHERE image_url IS NOT NULL
ORDER BY 
  CASE 
    WHEN image_url LIKE '/%' THEN 1
    WHEN image_url LIKE 'http%' THEN 2
    ELSE 3
  END;

-- Corregir rutas que no empiezan con / (solo si no son URLs completas)
UPDATE menu_items
SET image_url = '/' || image_url
WHERE image_url IS NOT NULL 
  AND image_url NOT LIKE '/%'
  AND image_url NOT LIKE 'http%'
  AND image_url NOT LIKE 'https%';

-- Verificar resultado
SELECT 
  id,
  name,
  image_url,
  '✅ Corregida' as estado
FROM menu_items
WHERE image_url IS NOT NULL
  AND image_url LIKE '/%'
ORDER BY updated_at DESC
LIMIT 10;


