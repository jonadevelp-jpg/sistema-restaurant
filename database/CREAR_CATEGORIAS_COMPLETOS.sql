-- =====================================================
-- CREAR CATEGORÍAS PARA RESTAURANTE DE COMPLETOS/CHURRASCOS
-- =====================================================
-- Ejecutar en Supabase SQL Editor
-- 
-- Este script crea las categorías apropiadas para un restaurante
-- de completos, churrascos y pollo asado
-- =====================================================

-- Eliminar categorías antiguas (opcional - solo si quieres empezar de cero)
-- ⚠️ CUIDADO: Esto eliminará todas las categorías existentes
-- DELETE FROM categories;

-- Crear categorías nuevas para completos/churrascos
INSERT INTO categories (name, slug, description, order_num, is_active, visual_type)
VALUES
  -- Completos (hero - cards grandes con imagen)
  ('Completos', 'completos', 'Completos tradicionales y especiales', 1, true, 'hero'),
  
  -- Churrascos (hero - cards grandes)
  ('Churrascos', 'churrascos', 'Churrascos de carne, pollo y mixtos', 2, true, 'hero'),
  
  -- Pollo Asado (hero - destacado)
  ('Pollo Asado', 'pollo-asado', 'Pollo asado entero y porciones', 3, true, 'hero'),
  
  -- Papas (list - lista simple)
  ('Papas', 'papas', 'Papas fritas y acompañamientos', 4, true, 'list'),
  
  -- Bebidas (drink - grid simple)
  ('Bebidas', 'bebidas', 'Bebidas frías y calientes', 5, true, 'drink'),
  
  -- Salsas y Acompañamientos (list - lista simple)
  ('Salsas', 'salsas', 'Salsas y aderezos', 6, true, 'list')
ON CONFLICT (slug) DO UPDATE 
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  order_num = EXCLUDED.order_num,
  is_active = EXCLUDED.is_active,
  visual_type = EXCLUDED.visual_type;

-- Verificar categorías creadas
SELECT 
  id,
  name,
  slug,
  visual_type,
  order_num,
  is_active
FROM categories
ORDER BY order_num;

-- =====================================================
-- CATEGORÍAS CREADAS:
-- =====================================================
-- 1. Completos (hero) - Cards grandes con imagen
-- 2. Churrascos (hero) - Cards grandes con imagen
-- 3. Pollo Asado (hero) - Cards grandes con imagen
-- 4. Papas (list) - Lista simple texto + precio
-- 5. Bebidas (drink) - Grid simple para bebidas
-- 6. Salsas (list) - Lista simple texto + precio
-- =====================================================



