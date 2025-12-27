-- =====================================================
-- FORZAR ACTUALIZACIÓN DE IMAGEN DE CATEGORÍA
-- =====================================================
-- Ejecutar en Supabase SQL Editor
-- Este script actualiza manualmente el image_url de una categoría
-- ⚠️ REEMPLAZA LOS VALORES DE EJEMPLO CON LOS REALES

-- Ejemplo: Actualizar imagen de categoría con ID 1
-- UPDATE categories
-- SET image_url = 'https://tu-proyecto.supabase.co/storage/v1/object/public/menu-images/1234567890-abc123.jpg'
-- WHERE id = 1;

-- Para ver todas las categorías y sus IDs:
SELECT id, name, slug, image_url
FROM categories
ORDER BY id;

-- Para actualizar una categoría específica, descomenta y modifica:
-- UPDATE categories
-- SET image_url = 'TU_URL_AQUI'
-- WHERE id = TU_ID_AQUI;

-- Verificar que se actualizó:
-- SELECT id, name, image_url, created_at
-- FROM categories
-- WHERE id = TU_ID_AQUI;

