-- =====================================================
-- TEST: ACTUALIZAR IMAGEN DE CATEGORÍA MANUALMENTE
-- =====================================================
-- Ejecutar en Supabase SQL Editor
-- Este script actualiza manualmente el image_url de una categoría para probar

-- 1. Ver todas las categorías
SELECT id, name, slug, image_url
FROM categories
ORDER BY id;

-- 2. Actualizar una categoría con una URL de prueba
-- ⚠️ REEMPLAZA EL ID Y LA URL CON VALORES REALES
-- Ejemplo: Actualizar categoría "Completos" (ID 2) con una URL de Supabase Storage
UPDATE categories
SET image_url = 'https://ejemplo.supabase.co/storage/v1/object/public/menu-images/test-image.jpg'
WHERE id = 2;

-- 3. Verificar que se actualizó
SELECT id, name, slug, image_url
FROM categories
WHERE id = 2;

-- 4. Si funciona, entonces el problema está en el código de la aplicación
-- Si NO funciona, entonces hay un problema con RLS o permisos

