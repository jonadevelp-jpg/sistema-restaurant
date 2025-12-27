-- =====================================================
-- SOLUCIÓN TEMPORAL: Desactivar RLS en categories y menu_items
-- =====================================================
-- ⚠️ SOLO PARA DESARROLLO - Permite que el menú digital funcione
-- Ejecutar en Supabase SQL Editor

-- PASO 1: Desactivar RLS temporalmente en categories
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- PASO 2: Desactivar RLS temporalmente en menu_items
ALTER TABLE menu_items DISABLE ROW LEVEL SECURITY;

-- PASO 3: Verificación
DO $$
BEGIN
  RAISE NOTICE '✅ RLS desactivado temporalmente en categories y menu_items';
  RAISE NOTICE '⚠️  Esto es solo para desarrollo - el menú digital debería funcionar ahora';
  RAISE NOTICE '';
  RAISE NOTICE '🧪 Prueba: Recarga la página y verifica que el menú carga';
  RAISE NOTICE '';
  RAISE NOTICE '📝 IMPORTANTE: Después de que funcione, ejecuta FIX_RECURSION_DEFINITIVO.sql';
  RAISE NOTICE '   para reactivar RLS con políticas correctas';
END $$;

