-- =====================================================
-- CREAR BUCKET DE IMÁGENES EN SUPABASE STORAGE
-- =====================================================
-- Este script crea el bucket 'menu-images' para almacenar imágenes
-- de productos del menú y categorías
-- Ejecutar en Supabase SQL Editor

-- =====================================================
-- NOTA IMPORTANTE:
-- =====================================================
-- Los buckets de Storage en Supabase NO se pueden crear con SQL.
-- Debes crearlos manualmente desde el Dashboard de Supabase.
--
-- Pasos:
-- 1. Ve a tu proyecto en Supabase Dashboard
-- 2. Ve a Storage (en el menú lateral)
-- 3. Haz clic en "New bucket"
-- 4. Nombre: menu-images
-- 5. Marca "Public bucket" (para que las imágenes sean accesibles públicamente)
-- 6. Haz clic en "Create bucket"
--
-- =====================================================
-- POLÍTICAS RLS PARA EL BUCKET (ejecutar después de crear el bucket)
-- =====================================================

-- Política para permitir lectura pública (todos pueden ver las imágenes)
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Política para permitir que usuarios autenticados suban imágenes
CREATE POLICY "Usuarios autenticados pueden subir imágenes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'menu-images'
  AND (
    -- Admin y encargado pueden subir cualquier imagen
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'encargado')
    )
  )
);

-- Política para permitir que usuarios autenticados actualicen sus propias imágenes
CREATE POLICY "Usuarios autenticados pueden actualizar imágenes"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'menu-images'
  AND (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'encargado')
    )
  )
);

-- Política para permitir que usuarios autenticados eliminen imágenes
CREATE POLICY "Usuarios autenticados pueden eliminar imágenes"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'menu-images'
  AND (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'encargado')
    )
  )
);

-- Política para lectura pública (todos pueden ver las imágenes)
CREATE POLICY "Lectura pública de imágenes"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'menu-images');

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ POLÍTICAS DE STORAGE CONFIGURADAS';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANTE:';
  RAISE NOTICE '   El bucket "menu-images" debe crearse manualmente desde';
  RAISE NOTICE '   el Dashboard de Supabase → Storage → New bucket';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Pasos:';
  RAISE NOTICE '   1. Ve a Supabase Dashboard → Storage';
  RAISE NOTICE '   2. Haz clic en "New bucket"';
  RAISE NOTICE '   3. Nombre: menu-images';
  RAISE NOTICE '   4. Marca "Public bucket"';
  RAISE NOTICE '   5. Haz clic en "Create bucket"';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Después de crear el bucket, las políticas RLS ya estarán';
  RAISE NOTICE '   configuradas y podrás subir imágenes desde el admin.';
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
END $$;

