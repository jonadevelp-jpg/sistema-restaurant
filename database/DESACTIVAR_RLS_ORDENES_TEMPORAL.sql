-- =====================================================
-- SOLUCIÓN TEMPORAL: Desactivar RLS en ordenes_restaurante
-- =====================================================
-- ⚠️ SOLO PARA DESARROLLO - Permite que los pedidos funcionen
-- Ejecutar en Supabase SQL Editor

-- PASO 1: Desactivar RLS temporalmente en ordenes_restaurante
ALTER TABLE ordenes_restaurante DISABLE ROW LEVEL SECURITY;

-- PASO 2: Desactivar RLS temporalmente en orden_items
ALTER TABLE orden_items DISABLE ROW LEVEL SECURITY;

-- PASO 3: Verificación
DO $$
BEGIN
  RAISE NOTICE '✅ RLS desactivado temporalmente en ordenes_restaurante y orden_items';
  RAISE NOTICE '⚠️  Esto es solo para desarrollo - los pedidos deberían funcionar ahora';
  RAISE NOTICE '';
  RAISE NOTICE '🧪 Prueba: Recarga la página /admin/mesas y verifica que los pedidos cargan';
  RAISE NOTICE '';
  RAISE NOTICE '📝 IMPORTANTE: Después de que funcione, ejecuta FIX_POLITICAS_ORDENES.sql';
  RAISE NOTICE '   para reactivar RLS con políticas correctas';
END $$;



