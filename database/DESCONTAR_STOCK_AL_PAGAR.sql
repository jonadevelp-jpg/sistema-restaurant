-- =====================================================
-- SCRIPT PARA DESCONTAR STOCK SOLO AL PAGAR
-- =====================================================
-- Ejecutar en Supabase SQL Editor
-- 
-- Este script modifica el sistema para que el stock de panes y bebidas
-- solo se descuente cuando la orden se PAGA (tiene metodo_pago y paid_at)
-- =====================================================

-- =====================================================
-- 1. DESACTIVAR EL TRIGGER ACTUAL QUE DESCUENTA AL CREAR ITEMS
-- =====================================================

-- Desactivar el trigger que descuenta stock al insertar items
DROP TRIGGER IF EXISTS trigger_actualizar_stock_orden ON orden_items;

-- =====================================================
-- 2. CREAR FUNCIÓN PARA DESCONTAR STOCK AL PAGAR
-- =====================================================

CREATE OR REPLACE FUNCTION descontar_stock_al_pagar()
RETURNS TRIGGER AS $$
DECLARE
  orden_item RECORD;
  categoria_slug_item TEXT;
  stock_item_record RECORD;
  nombre_bebida TEXT;
BEGIN
  -- Solo procesar si se está pagando la orden (metodo_pago y paid_at están presentes)
  -- Y antes no estaba pagada (OLD.paid_at es NULL)
  IF NEW.metodo_pago IS NOT NULL 
     AND NEW.paid_at IS NOT NULL 
     AND (OLD.paid_at IS NULL OR OLD.metodo_pago IS NULL) THEN
    
    -- Procesar cada item de la orden
    FOR orden_item IN 
      SELECT oi.*, mi.name as menu_item_name
      FROM orden_items oi
      JOIN menu_items mi ON mi.id = oi.menu_item_id
      WHERE oi.orden_id = NEW.id
    LOOP
      -- Obtener categoría del menu_item
      SELECT c.slug INTO categoria_slug_item
      FROM menu_items mi
      JOIN categories c ON c.id = mi.category_id
      WHERE mi.id = orden_item.menu_item_id;
      
      -- =====================================================
      -- DESCONTAR PAN SEGÚN CATEGORÍA
      -- =====================================================
      IF categoria_slug_item IN ('completos', 'sandwiches') THEN
        -- Buscar el pan correspondiente a la categoría
        SELECT * INTO stock_item_record
        FROM stock_panes_bebidas
        WHERE tipo = 'pan'
          AND categoria_slug = categoria_slug_item
        LIMIT 1;
        
        IF FOUND THEN
          -- Descontar pan (1 pan por item vendido)
          UPDATE stock_panes_bebidas
          SET cantidad = cantidad - orden_item.cantidad,
              updated_at = NOW()
          WHERE id = stock_item_record.id;
          
          -- Registrar movimiento
          INSERT INTO movimientos_stock_panes_bebidas (
            stock_id, tipo_movimiento, cantidad, motivo, referencia_id, referencia_tipo, created_by
          )
          VALUES (
            stock_item_record.id, 'salida', orden_item.cantidad, 
            'Orden pagada - ' || categoria_slug_item, 
            NEW.id, 'orden', auth.uid()
          );
        END IF;
      END IF;
      
      -- =====================================================
      -- DESCONTAR BEBIDAS
      -- =====================================================
      IF categoria_slug_item = 'bebidas' OR categoria_slug_item = 'bebestibles' THEN
        -- Obtener el nombre de la bebida del menu_item
        nombre_bebida := orden_item.menu_item_name;
        
        -- Buscar la bebida por nombre (búsqueda flexible, sin distinción de mayúsculas/minúsculas)
        SELECT * INTO stock_item_record
        FROM stock_panes_bebidas
        WHERE tipo = 'bebida'
          AND LOWER(TRIM(nombre)) = LOWER(TRIM(nombre_bebida))
        LIMIT 1;
        
        -- Si no se encuentra exacto, intentar búsqueda parcial
        IF NOT FOUND THEN
          SELECT * INTO stock_item_record
          FROM stock_panes_bebidas
          WHERE tipo = 'bebida'
            AND LOWER(nombre) LIKE '%' || LOWER(TRIM(nombre_bebida)) || '%'
          LIMIT 1;
        END IF;
        
        IF FOUND THEN
          -- Descontar bebida
          UPDATE stock_panes_bebidas
          SET cantidad = cantidad - orden_item.cantidad,
              updated_at = NOW()
          WHERE id = stock_item_record.id;
          
          -- Registrar movimiento
          INSERT INTO movimientos_stock_panes_bebidas (
            stock_id, tipo_movimiento, cantidad, motivo, referencia_id, referencia_tipo, created_by
          )
          VALUES (
            stock_item_record.id, 'salida', orden_item.cantidad, 
            'Orden pagada - bebida: ' || nombre_bebida, 
            NEW.id, 'orden', auth.uid()
          );
        END IF;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. CREAR TRIGGER QUE SE EJECUTE AL ACTUALIZAR ORDEN
-- =====================================================

DROP TRIGGER IF EXISTS trigger_descontar_stock_al_pagar ON ordenes_restaurante;

CREATE TRIGGER trigger_descontar_stock_al_pagar
  AFTER UPDATE ON ordenes_restaurante
  FOR EACH ROW
  EXECUTE FUNCTION descontar_stock_al_pagar();

-- =====================================================
-- 4. VERIFICACIÓN
-- =====================================================

DO $$
BEGIN
  -- Verificar que la función existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'descontar_stock_al_pagar'
  ) THEN
    RAISE EXCEPTION 'Error: Función descontar_stock_al_pagar no se creó correctamente';
  END IF;
  
  -- Verificar que el trigger existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_descontar_stock_al_pagar'
  ) THEN
    RAISE EXCEPTION 'Error: Trigger trigger_descontar_stock_al_pagar no se creó correctamente';
  END IF;
  
  RAISE NOTICE '✅ Sistema de descuento de stock al pagar configurado correctamente';
  RAISE NOTICE '   - El stock se descuenta SOLO cuando se paga la orden (metodo_pago + paid_at)';
  RAISE NOTICE '   - Completos descuentan: Pan de Completo';
  RAISE NOTICE '   - Sandwiches descuentan: Pan de Sandwich';
  RAISE NOTICE '   - Bebidas descuentan: Bebida correspondiente por nombre';
END $$;

