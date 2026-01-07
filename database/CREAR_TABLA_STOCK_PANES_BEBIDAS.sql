-- =====================================================
-- CREAR TABLA DE STOCK DE PANES Y BEBIDAS
-- =====================================================
-- Ejecutar en Supabase SQL Editor
-- Este script crea la tabla si no existe y configura todo lo necesario

-- Tabla de stock de panes y bebidas
CREATE TABLE IF NOT EXISTS stock_panes_bebidas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('pan', 'bebida')),
  nombre TEXT NOT NULL,
  categoria_slug TEXT, -- Para panes: 'completos', 'sandwiches', etc. NULL para bebidas
  cantidad NUMERIC NOT NULL DEFAULT 0,
  precio_unitario NUMERIC NOT NULL DEFAULT 0,
  stock_minimo NUMERIC DEFAULT 0,
  unidad_medida TEXT NOT NULL DEFAULT 'un' CHECK (unidad_medida IN ('un', 'lt', 'ml')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tipo, nombre, categoria_slug) -- Evitar duplicados
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_stock_panes_bebidas_tipo ON stock_panes_bebidas(tipo);
CREATE INDEX IF NOT EXISTS idx_stock_panes_bebidas_categoria ON stock_panes_bebidas(categoria_slug);
CREATE INDEX IF NOT EXISTS idx_stock_panes_bebidas_nombre ON stock_panes_bebidas(nombre);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_stock_panes_bebidas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_stock_panes_bebidas_updated_at ON stock_panes_bebidas;

CREATE TRIGGER trigger_update_stock_panes_bebidas_updated_at
    BEFORE UPDATE ON stock_panes_bebidas
    FOR EACH ROW
    EXECUTE FUNCTION update_stock_panes_bebidas_updated_at();

-- Tabla de movimientos de stock de panes y bebidas
CREATE TABLE IF NOT EXISTS movimientos_stock_panes_bebidas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_id UUID REFERENCES stock_panes_bebidas(id) ON DELETE CASCADE,
  tipo_movimiento TEXT NOT NULL CHECK (tipo_movimiento IN ('entrada', 'salida', 'ajuste')),
  cantidad NUMERIC NOT NULL,
  motivo TEXT,
  referencia_id UUID, -- Puede ser orden_id, etc.
  referencia_tipo TEXT, -- 'orden', 'ajuste', 'compra'
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para movimientos
CREATE INDEX IF NOT EXISTS idx_movimientos_stock_id ON movimientos_stock_panes_bebidas(stock_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_fecha ON movimientos_stock_panes_bebidas(created_at);
CREATE INDEX IF NOT EXISTS idx_movimientos_tipo ON movimientos_stock_panes_bebidas(tipo_movimiento);
CREATE INDEX IF NOT EXISTS idx_movimientos_referencia ON movimientos_stock_panes_bebidas(referencia_id, referencia_tipo);

-- RLS para stock_panes_bebidas
ALTER TABLE stock_panes_bebidas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "stock_panes_bebidas_select_all" ON stock_panes_bebidas;
DROP POLICY IF EXISTS "stock_panes_bebidas_insert_admin" ON stock_panes_bebidas;
DROP POLICY IF EXISTS "stock_panes_bebidas_update_admin" ON stock_panes_bebidas;
DROP POLICY IF EXISTS "stock_panes_bebidas_delete_admin" ON stock_panes_bebidas;

CREATE POLICY "stock_panes_bebidas_select_all"
  ON stock_panes_bebidas FOR SELECT
  USING (true);

CREATE POLICY "stock_panes_bebidas_insert_admin"
  ON stock_panes_bebidas FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'encargado')
    )
  );

CREATE POLICY "stock_panes_bebidas_update_admin"
  ON stock_panes_bebidas FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'encargado')
    )
  );

CREATE POLICY "stock_panes_bebidas_delete_admin"
  ON stock_panes_bebidas FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'encargado')
    )
  );

-- RLS para movimientos_stock_panes_bebidas
ALTER TABLE movimientos_stock_panes_bebidas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "movimientos_stock_panes_bebidas_select_admin" ON movimientos_stock_panes_bebidas;
DROP POLICY IF EXISTS "movimientos_stock_panes_bebidas_insert_admin" ON movimientos_stock_panes_bebidas;

CREATE POLICY "movimientos_stock_panes_bebidas_select_admin"
  ON movimientos_stock_panes_bebidas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'encargado')
    )
  );

CREATE POLICY "movimientos_stock_panes_bebidas_insert_admin"
  ON movimientos_stock_panes_bebidas FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'encargado', 'mesero')
    )
  );

-- =====================================================
-- ACTUALIZAR FUNCIÓN PARA DESCONTAR PANES Y BEBIDAS
-- =====================================================

CREATE OR REPLACE FUNCTION actualizar_stock_orden()
RETURNS TRIGGER AS $$
DECLARE
  receta_ing RECORD;
  cantidad_necesaria NUMERIC;
  categoria_slug_item TEXT;
  stock_pan RECORD;
BEGIN
  -- Obtener receta del menu_item (descuento de ingredientes)
  FOR receta_ing IN 
    SELECT ri.ingrediente_id, ri.cantidad, ri.unidad_medida
    FROM receta_ingredientes ri
    JOIN recetas r ON r.id = ri.receta_id
    WHERE r.menu_item_id = NEW.menu_item_id
  LOOP
    -- Calcular cantidad necesaria (cantidad del item * cantidad en receta)
    cantidad_necesaria := NEW.cantidad * receta_ing.cantidad;
    
    -- Actualizar stock
    UPDATE ingredientes
    SET stock_actual = stock_actual - cantidad_necesaria,
        updated_at = NOW()
    WHERE id = receta_ing.ingrediente_id;
    
    -- Registrar movimiento
    INSERT INTO movimientos_stock (ingrediente_id, tipo, cantidad, motivo, referencia_id, referencia_tipo, created_by)
    VALUES (receta_ing.ingrediente_id, 'salida', cantidad_necesaria, 'Orden restaurante', NEW.orden_id, 'orden', auth.uid());
  END LOOP;
  
  -- Obtener categoría del menu_item para descontar pan
  SELECT c.slug INTO categoria_slug_item
  FROM menu_items mi
  JOIN categories c ON c.id = mi.category_id
  WHERE mi.id = NEW.menu_item_id;
  
  -- Descontar pan según la categoría (solo para completos y sandwiches)
  IF categoria_slug_item IN ('completos', 'sandwiches') THEN
    -- Buscar el pan correspondiente a la categoría
    SELECT * INTO stock_pan
    FROM stock_panes_bebidas
    WHERE tipo = 'pan'
      AND categoria_slug = categoria_slug_item
    LIMIT 1;
    
    IF FOUND THEN
      -- Descontar pan (1 pan por item vendido)
      UPDATE stock_panes_bebidas
      SET cantidad = cantidad - NEW.cantidad,
          updated_at = NOW()
      WHERE id = stock_pan.id;
      
      -- Registrar movimiento
      INSERT INTO movimientos_stock_panes_bebidas (
        stock_id, tipo_movimiento, cantidad, motivo, referencia_id, referencia_tipo, created_by
      )
      VALUES (
        stock_pan.id, 'salida', NEW.cantidad, 
        'Orden restaurante - ' || categoria_slug_item, 
        NEW.orden_id, 'orden', auth.uid()
      );
    END IF;
  END IF;
  
  -- Descontar bebidas si el item es de la categoría bebidas
  IF categoria_slug_item = 'bebidas' THEN
    -- Buscar la bebida por nombre del menu_item
    SELECT * INTO stock_pan
    FROM stock_panes_bebidas
    WHERE tipo = 'bebida'
      AND LOWER(nombre) = LOWER((SELECT name FROM menu_items WHERE id = NEW.menu_item_id))
    LIMIT 1;
    
    IF FOUND THEN
      -- Descontar bebida
      UPDATE stock_panes_bebidas
      SET cantidad = cantidad - NEW.cantidad,
          updated_at = NOW()
      WHERE id = stock_pan.id;
      
      -- Registrar movimiento
      INSERT INTO movimientos_stock_panes_bebidas (
        stock_id, tipo_movimiento, cantidad, motivo, referencia_id, referencia_tipo, created_by
      )
      VALUES (
        stock_pan.id, 'salida', NEW.cantidad, 
        'Orden restaurante - bebida', 
        NEW.orden_id, 'orden', auth.uid()
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Insertar panes básicos si no existen
INSERT INTO stock_panes_bebidas (tipo, nombre, categoria_slug, cantidad, precio_unitario, stock_minimo, unidad_medida)
VALUES
  ('pan', 'Pan de Completo', 'completos', 0, 0, 10, 'un'),
  ('pan', 'Pan de Sandwich', 'sandwiches', 0, 0, 10, 'un')
ON CONFLICT (tipo, nombre, categoria_slug) DO NOTHING;

-- Verificar que la tabla se creó correctamente
SELECT '✅ Tabla stock_panes_bebidas creada correctamente' AS resultado;

