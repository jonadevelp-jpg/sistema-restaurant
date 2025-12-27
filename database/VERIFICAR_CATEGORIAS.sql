-- =====================================================
-- VERIFICAR CATEGORÍAS - DIAGNÓSTICO
-- =====================================================
-- Ejecutar en Supabase SQL Editor
-- 
-- Este script te ayuda a diagnosticar por qué no aparecen
-- las categorías en el menú digital
-- =====================================================

-- 1. Ver TODAS las categorías (activas e inactivas)
SELECT 
  id,
  name,
  slug,
  is_active,
  order_num,
  visual_type
FROM categories
ORDER BY order_num;

-- 2. Ver solo categorías ACTIVAS
SELECT 
  id,
  name,
  slug,
  is_active,
  order_num
FROM categories
WHERE is_active = true
ORDER BY order_num;

-- 3. Ver categorías con slugs válidos (las que deberían aparecer)
SELECT 
  id,
  name,
  slug,
  is_active,
  order_num
FROM categories
WHERE slug IN ('destacados', 'completos', 'sandwiches', 'acompanamientos', 'pollo', 'bebidas')
ORDER BY order_num;

-- 4. Ver categorías válidas Y activas (las que DEBERÍAN aparecer)
SELECT 
  id,
  name,
  slug,
  is_active,
  order_num,
  visual_type
FROM categories
WHERE slug IN ('destacados', 'completos', 'sandwiches', 'acompanamientos', 'pollo', 'bebidas')
  AND is_active = true
ORDER BY order_num;

-- 5. Contar categorías por estado
SELECT 
  CASE 
    WHEN is_active = true THEN 'Activas'
    ELSE 'Inactivas'
  END as estado,
  COUNT(*) as cantidad
FROM categories
GROUP BY is_active;

-- 6. Verificar si hay categorías con slugs incorrectos
SELECT 
  id,
  name,
  slug,
  is_active
FROM categories
WHERE slug NOT IN ('destacados', 'completos', 'sandwiches', 'acompanamientos', 'pollo', 'bebidas')
  AND is_active = true;

-- =====================================================
-- RESULTADO ESPERADO
-- =====================================================
-- Deberías ver 6 categorías activas con estos slugs:
-- 1. destacados
-- 2. completos
-- 3. sandwiches
-- 4. acompanamientos
-- 5. pollo
-- 6. bebidas
-- =====================================================

-- Si NO ves estas categorías, ejecuta:
-- database/SEED_MENU_COMPLETOS.sql

