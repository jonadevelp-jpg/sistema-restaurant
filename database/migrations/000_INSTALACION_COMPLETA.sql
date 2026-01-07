-- =====================================================
-- MIGRACIÓN 000: INSTALACIÓN COMPLETA DESDE CERO
-- =====================================================
-- Para base de datos nueva sin tablas
-- Ejecutar en Supabase SQL Editor
-- 
-- Esta migración crea todas las tablas necesarias para el sistema POS
-- adaptado a restaurante sin mesas (completos/churrascos/pollo asado)
-- 
-- INCLUYE desde el inicio:
-- - tipo_pedido en órdenes (barra/llevar)
-- - visual_type en categories y menu_items (hero/list/drink)
-- - NO incluye tabla de mesas (sistema sin mesas)
-- =====================================================

-- =====================================================
-- 1. TABLAS BASE
-- =====================================================

-- Tabla de sucursales
CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  address TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'mesero', 'encargado')),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  sucursal_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de proveedores
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. TABLAS DE MENÚ (con visual_type desde el inicio)
-- =====================================================

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  order_num INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  visual_type TEXT CHECK (visual_type IN ('hero', 'list', 'drink')), -- Tipo de visualización en menú digital
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de items del menú
CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  order_num INTEGER NOT NULL DEFAULT 0,
  visual_type TEXT CHECK (visual_type IN ('hero', 'list', 'drink')), -- Hereda de categoría si es NULL
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. TABLAS DE INGREDIENTES Y RECETAS
-- =====================================================

-- Tabla de ingredientes
CREATE TABLE IF NOT EXISTS ingredientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  unidad_medida TEXT NOT NULL CHECK (unidad_medida IN ('kg', 'gr', 'lt', 'ml', 'un')),
  precio_unitario NUMERIC NOT NULL DEFAULT 0,
  stock_actual NUMERIC NOT NULL DEFAULT 0,
  stock_minimo NUMERIC DEFAULT 0,
  proveedor_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de recetas
CREATE TABLE IF NOT EXISTS recetas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id INTEGER REFERENCES menu_items(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  porciones INTEGER DEFAULT 1,
  costo_total NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla pivote receta_ingredientes
CREATE TABLE IF NOT EXISTS receta_ingredientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receta_id UUID REFERENCES recetas(id) ON DELETE CASCADE,
  ingrediente_id UUID REFERENCES ingredientes(id) ON DELETE CASCADE,
  cantidad NUMERIC NOT NULL,
  unidad_medida TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(receta_id, ingrediente_id)
);

-- =====================================================
-- 4. TABLAS DE ÓRDENES (con tipo_pedido desde el inicio)
-- =====================================================

-- Tabla de órdenes (SIN dependencia de mesas)
CREATE TABLE IF NOT EXISTS ordenes_restaurante (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_orden TEXT NOT NULL UNIQUE,
  tipo_pedido TEXT CHECK (tipo_pedido IN ('barra', 'llevar')), -- Tipo de pedido: barra o llevar
  mesa_id UUID, -- OPCIONAL: Solo para compatibilidad con datos antiguos, sin FK
  mesero_id UUID REFERENCES users(id) ON DELETE SET NULL,
  estado TEXT NOT NULL DEFAULT 'pending' CHECK (estado IN ('pending', 'preparing', 'ready', 'served', 'paid', 'cancelled')),
  total NUMERIC NOT NULL DEFAULT 0,
  propina_mesero NUMERIC DEFAULT 0,
  propina_calculada NUMERIC DEFAULT 0, -- 10% del total
  metodo_pago TEXT CHECK (metodo_pago IN ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA')),
  nota TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  payout_week INTEGER,
  payout_year INTEGER
);

-- Tabla pivote orden_items
CREATE TABLE IF NOT EXISTS orden_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orden_id UUID REFERENCES ordenes_restaurante(id) ON DELETE CASCADE,
  menu_item_id INTEGER REFERENCES menu_items(id) ON DELETE CASCADE,
  cantidad INTEGER NOT NULL DEFAULT 1,
  precio_unitario NUMERIC NOT NULL,
  subtotal NUMERIC NOT NULL,
  notas TEXT, -- JSON con personalización
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. TABLAS DE COMPRAS Y STOCK
-- =====================================================

-- Tabla de compras
CREATE TABLE IF NOT EXISTS compras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_factura TEXT,
  proveedor_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  fecha DATE NOT NULL,
  total NUMERIC NOT NULL DEFAULT 0,
  metodo_pago TEXT CHECK (metodo_pago IN ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'CREDITO')),
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagada', 'cancelada')),
  notas TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla pivote compra_items
CREATE TABLE IF NOT EXISTS compra_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  compra_id UUID REFERENCES compras(id) ON DELETE CASCADE,
  ingrediente_id UUID REFERENCES ingredientes(id) ON DELETE CASCADE,
  cantidad NUMERIC NOT NULL,
  precio_unitario NUMERIC NOT NULL,
  subtotal NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de movimientos de stock
CREATE TABLE IF NOT EXISTS movimientos_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingrediente_id UUID REFERENCES ingredientes(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'salida', 'ajuste')),
  cantidad NUMERIC NOT NULL,
  motivo TEXT,
  referencia_id UUID, -- ID de compra, receta, etc.
  referencia_tipo TEXT, -- 'compra', 'receta', 'ajuste', etc.
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. TABLAS DE EMPLEADOS Y PROPINAS
-- =====================================================

-- Tabla de empleados
CREATE TABLE IF NOT EXISTS empleados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  funcion TEXT NOT NULL, -- 'mesero', 'cocina', 'delivery', etc.
  sueldo NUMERIC NOT NULL DEFAULT 0,
  propina_habilitada BOOLEAN DEFAULT false,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para rastrear distribución de propinas
CREATE TABLE IF NOT EXISTS propinas_distribucion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empleado_id UUID REFERENCES empleados(id) ON DELETE CASCADE,
  orden_id UUID REFERENCES ordenes_restaurante(id) ON DELETE CASCADE,
  monto NUMERIC NOT NULL,
  periodo_semana INTEGER,
  periodo_mes INTEGER,
  periodo_anio INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. TABLAS DE GASTOS (opcional)
-- =====================================================

-- Tabla de gastos pequeños
CREATE TABLE IF NOT EXISTS small_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  descripcion TEXT NOT NULL,
  monto NUMERIC NOT NULL,
  categoria TEXT,
  fecha DATE NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de gastos generales
CREATE TABLE IF NOT EXISTS general_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  descripcion TEXT NOT NULL,
  monto NUMERIC NOT NULL,
  categoria TEXT,
  fecha DATE NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. ÍNDICES
-- =====================================================

-- Índices básicos
CREATE INDEX IF NOT EXISTS idx_users_sucursal ON users(sucursal_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);

-- Índices de menú
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_visual_type ON categories(visual_type);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_menu_items_visual_type ON menu_items(visual_type);

-- Índices de ingredientes
CREATE INDEX IF NOT EXISTS idx_ingredientes_proveedor ON ingredientes(proveedor_id);
CREATE INDEX IF NOT EXISTS idx_ingredientes_stock ON ingredientes(stock_actual);
CREATE INDEX IF NOT EXISTS idx_ingredientes_nombre ON ingredientes(nombre);

-- Índices de recetas
CREATE INDEX IF NOT EXISTS idx_recetas_menu_item ON recetas(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_receta_ingredientes_receta ON receta_ingredientes(receta_id);
CREATE INDEX IF NOT EXISTS idx_receta_ingredientes_ingrediente ON receta_ingredientes(ingrediente_id);

-- Índices de órdenes
CREATE INDEX IF NOT EXISTS idx_ordenes_tipo_pedido ON ordenes_restaurante(tipo_pedido);
CREATE INDEX IF NOT EXISTS idx_ordenes_mesero ON ordenes_restaurante(mesero_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_estado ON ordenes_restaurante(estado);
CREATE INDEX IF NOT EXISTS idx_ordenes_fecha ON ordenes_restaurante(created_at);
CREATE INDEX IF NOT EXISTS idx_ordenes_paid ON ordenes_restaurante(paid_at);
CREATE INDEX IF NOT EXISTS idx_orden_items_orden ON orden_items(orden_id);
CREATE INDEX IF NOT EXISTS idx_orden_items_menu_item ON orden_items(menu_item_id);

-- Índices de compras
CREATE INDEX IF NOT EXISTS idx_compras_proveedor ON compras(proveedor_id);
CREATE INDEX IF NOT EXISTS idx_compras_fecha ON compras(fecha);
CREATE INDEX IF NOT EXISTS idx_compras_estado ON compras(estado);
CREATE INDEX IF NOT EXISTS idx_compra_items_compra ON compra_items(compra_id);
CREATE INDEX IF NOT EXISTS idx_compra_items_ingrediente ON compra_items(ingrediente_id);

-- Índices de stock
CREATE INDEX IF NOT EXISTS idx_movimientos_ingrediente ON movimientos_stock(ingrediente_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_fecha ON movimientos_stock(created_at);

-- Índices de empleados
CREATE INDEX IF NOT EXISTS idx_empleados_user ON empleados(user_id);
CREATE INDEX IF NOT EXISTS idx_empleados_activo ON empleados(activo);
CREATE INDEX IF NOT EXISTS idx_empleados_propina ON empleados(propina_habilitada);
CREATE INDEX IF NOT EXISTS idx_propinas_empleado ON propinas_distribucion(empleado_id);
CREATE INDEX IF NOT EXISTS idx_propinas_orden ON propinas_distribucion(orden_id);
CREATE INDEX IF NOT EXISTS idx_propinas_periodo ON propinas_distribucion(periodo_anio, periodo_mes, periodo_semana);

-- =====================================================
-- 9. TRIGGERS Y FUNCIONES
-- =====================================================

-- Función para updated_at genérico
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at en branches
DROP TRIGGER IF EXISTS trigger_update_branches_updated_at ON branches;
CREATE TRIGGER trigger_update_branches_updated_at
    BEFORE UPDATE ON branches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Trigger para updated_at en ingredientes
DROP TRIGGER IF EXISTS trigger_update_ingredientes_updated_at ON ingredientes;
CREATE TRIGGER trigger_update_ingredientes_updated_at
    BEFORE UPDATE ON ingredientes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Trigger para updated_at en recetas
DROP TRIGGER IF EXISTS trigger_update_recetas_updated_at ON recetas;
CREATE TRIGGER trigger_update_recetas_updated_at
    BEFORE UPDATE ON recetas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Trigger para updated_at en menu_items
DROP TRIGGER IF EXISTS trigger_update_menu_items_updated_at ON menu_items;
CREATE TRIGGER trigger_update_menu_items_updated_at
    BEFORE UPDATE ON menu_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Trigger para updated_at en ordenes_restaurante
DROP TRIGGER IF EXISTS trigger_update_ordenes_updated_at ON ordenes_restaurante;
CREATE TRIGGER trigger_update_ordenes_updated_at
    BEFORE UPDATE ON ordenes_restaurante
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Trigger para updated_at en empleados
DROP TRIGGER IF EXISTS trigger_update_empleados_updated_at ON empleados;
CREATE TRIGGER trigger_update_empleados_updated_at
    BEFORE UPDATE ON empleados
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Función para actualizar total de orden
CREATE OR REPLACE FUNCTION actualizar_total_orden()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ordenes_restaurante
  SET total = (
    SELECT COALESCE(SUM(subtotal), 0)
    FROM orden_items
    WHERE orden_id = COALESCE(NEW.orden_id, OLD.orden_id)
  ),
  updated_at = NOW()
  WHERE id = COALESCE(NEW.orden_id, OLD.orden_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_actualizar_total_orden ON orden_items;
CREATE TRIGGER trigger_actualizar_total_orden
  AFTER INSERT OR UPDATE OR DELETE ON orden_items
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_total_orden();

-- Función para actualizar total de compra
CREATE OR REPLACE FUNCTION actualizar_total_compra()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE compras
  SET total = (
    SELECT COALESCE(SUM(subtotal), 0)
    FROM compra_items
    WHERE compra_id = COALESCE(NEW.compra_id, OLD.compra_id)
  )
  WHERE id = COALESCE(NEW.compra_id, OLD.compra_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_actualizar_total_compra ON compra_items;
CREATE TRIGGER trigger_actualizar_total_compra
  AFTER INSERT OR UPDATE OR DELETE ON compra_items
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_total_compra();

-- Función para actualizar costo_total de receta
CREATE OR REPLACE FUNCTION actualizar_costo_receta()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE recetas
  SET costo_total = (
    SELECT COALESCE(SUM(ri.cantidad * i.precio_unitario), 0)
    FROM receta_ingredientes ri
    JOIN ingredientes i ON ri.ingrediente_id = i.id
    WHERE ri.receta_id = COALESCE(NEW.receta_id, OLD.receta_id)
  )
  WHERE id = COALESCE(NEW.receta_id, OLD.receta_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_actualizar_costo_receta ON receta_ingredientes;
CREATE TRIGGER trigger_actualizar_costo_receta
  AFTER INSERT OR UPDATE OR DELETE ON receta_ingredientes
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_costo_receta();

-- Función helper para obtener visual_type de un item (heredado de categoría si es NULL)
CREATE OR REPLACE FUNCTION get_item_visual_type(item_id INTEGER)
RETURNS TEXT AS $$
DECLARE
  item_visual_type TEXT;
  category_visual_type TEXT;
BEGIN
  -- Obtener visual_type del item
  SELECT visual_type INTO item_visual_type
  FROM menu_items
  WHERE id = item_id;
  
  -- Si el item tiene visual_type, retornarlo
  IF item_visual_type IS NOT NULL THEN
    RETURN item_visual_type;
  END IF;
  
  -- Si no, obtener visual_type de la categoría
  SELECT c.visual_type INTO category_visual_type
  FROM menu_items mi
  JOIN categories c ON mi.category_id = c.id
  WHERE mi.id = item_id;
  
  -- Retornar el visual_type de la categoría (puede ser NULL)
  RETURN category_visual_type;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 10. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- RLS para branches
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "branches_select_all" ON branches;
DROP POLICY IF EXISTS "branches_insert_admin" ON branches;
DROP POLICY IF EXISTS "branches_update_admin" ON branches;
DROP POLICY IF EXISTS "branches_delete_admin" ON branches;

CREATE POLICY "branches_select_all" ON branches FOR SELECT USING (true);
CREATE POLICY "branches_insert_admin" ON branches FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
    OR NOT EXISTS (SELECT 1 FROM users LIMIT 1)
  );
CREATE POLICY "branches_update_admin" ON branches FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
    OR NOT EXISTS (SELECT 1 FROM users LIMIT 1)
  );
CREATE POLICY "branches_delete_admin" ON branches FOR DELETE
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'));

-- RLS para users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_select_own_or_admin" ON users;
CREATE POLICY "users_select_own_or_admin" ON users FOR SELECT
  USING (
    auth.uid() = id
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
    OR NOT EXISTS (SELECT 1 FROM users LIMIT 1)
  );

-- RLS para suppliers
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "suppliers_select_all" ON suppliers;
DROP POLICY IF EXISTS "suppliers_insert_admin" ON suppliers;
DROP POLICY IF EXISTS "suppliers_update_admin" ON suppliers;
DROP POLICY IF EXISTS "suppliers_delete_admin" ON suppliers;

CREATE POLICY "suppliers_select_all" ON suppliers FOR SELECT USING (true);
CREATE POLICY "suppliers_insert_admin" ON suppliers FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'encargado'))
    OR NOT EXISTS (SELECT 1 FROM users LIMIT 1)
  );
CREATE POLICY "suppliers_update_admin" ON suppliers FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
    OR NOT EXISTS (SELECT 1 FROM users LIMIT 1)
  );
CREATE POLICY "suppliers_delete_admin" ON suppliers FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
    OR NOT EXISTS (SELECT 1 FROM users LIMIT 1)
  );

-- RLS para categories (público para menú digital)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "categories_select_all" ON categories;
DROP POLICY IF EXISTS "categories_insert_admin" ON categories;
DROP POLICY IF EXISTS "categories_update_admin" ON categories;
DROP POLICY IF EXISTS "categories_delete_admin" ON categories;

CREATE POLICY "categories_select_all" ON categories FOR SELECT USING (true);
CREATE POLICY "categories_insert_admin" ON categories FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
    OR NOT EXISTS (SELECT 1 FROM users LIMIT 1)
  );
CREATE POLICY "categories_update_admin" ON categories FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
    OR NOT EXISTS (SELECT 1 FROM users LIMIT 1)
  );
CREATE POLICY "categories_delete_admin" ON categories FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
    OR NOT EXISTS (SELECT 1 FROM users LIMIT 1)
  );

-- RLS para menu_items (público para menú digital)
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "menu_items_select_all" ON menu_items;
DROP POLICY IF EXISTS "menu_items_insert_admin" ON menu_items;
DROP POLICY IF EXISTS "menu_items_update_admin" ON menu_items;
DROP POLICY IF EXISTS "menu_items_delete_admin" ON menu_items;

CREATE POLICY "menu_items_select_all" ON menu_items FOR SELECT USING (true);
CREATE POLICY "menu_items_insert_admin" ON menu_items FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
    OR NOT EXISTS (SELECT 1 FROM users LIMIT 1)
  );
CREATE POLICY "menu_items_update_admin" ON menu_items FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
    OR NOT EXISTS (SELECT 1 FROM users LIMIT 1)
  );
CREATE POLICY "menu_items_delete_admin" ON menu_items FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
    OR NOT EXISTS (SELECT 1 FROM users LIMIT 1)
  );

-- RLS para ingredientes
ALTER TABLE ingredientes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ingredientes_select_all" ON ingredientes;
DROP POLICY IF EXISTS "ingredientes_insert_admin" ON ingredientes;
DROP POLICY IF EXISTS "ingredientes_update_admin" ON ingredientes;
DROP POLICY IF EXISTS "ingredientes_delete_admin" ON ingredientes;

CREATE POLICY "ingredientes_select_all" ON ingredientes FOR SELECT USING (true);
CREATE POLICY "ingredientes_insert_admin" ON ingredientes FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
    OR NOT EXISTS (SELECT 1 FROM users LIMIT 1)
  );
CREATE POLICY "ingredientes_update_admin" ON ingredientes FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
    OR NOT EXISTS (SELECT 1 FROM users LIMIT 1)
  );
CREATE POLICY "ingredientes_delete_admin" ON ingredientes FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
    OR NOT EXISTS (SELECT 1 FROM users LIMIT 1)
  );

-- RLS para ordenes_restaurante
ALTER TABLE ordenes_restaurante ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ordenes_select_own_or_admin" ON ordenes_restaurante;
DROP POLICY IF EXISTS "ordenes_insert_mesero_or_admin" ON ordenes_restaurante;
DROP POLICY IF EXISTS "ordenes_update_own_or_admin" ON ordenes_restaurante;
DROP POLICY IF EXISTS "ordenes_delete_admin" ON ordenes_restaurante;

CREATE POLICY "ordenes_select_own_or_admin" ON ordenes_restaurante FOR SELECT
  USING (
    mesero_id = auth.uid()
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'encargado'))
  );
CREATE POLICY "ordenes_insert_mesero_or_admin" ON ordenes_restaurante FOR INSERT
  WITH CHECK (
    mesero_id = auth.uid()
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'encargado'))
  );
CREATE POLICY "ordenes_update_own_or_admin" ON ordenes_restaurante FOR UPDATE
  USING (
    mesero_id = auth.uid()
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'encargado'))
  );
CREATE POLICY "ordenes_delete_admin" ON ordenes_restaurante FOR DELETE
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'));

-- RLS para orden_items
ALTER TABLE orden_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "orden_items_select_own_or_admin" ON orden_items;
DROP POLICY IF EXISTS "orden_items_insert_own_or_admin" ON orden_items;
DROP POLICY IF EXISTS "orden_items_update_own_or_admin" ON orden_items;
DROP POLICY IF EXISTS "orden_items_delete_own_or_admin" ON orden_items;

CREATE POLICY "orden_items_select_own_or_admin" ON orden_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ordenes_restaurante o
      WHERE o.id = orden_items.orden_id
      AND (
        o.mesero_id = auth.uid()
        OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'encargado'))
      )
    )
  );
CREATE POLICY "orden_items_insert_own_or_admin" ON orden_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ordenes_restaurante o
      WHERE o.id = orden_items.orden_id
      AND (
        o.mesero_id = auth.uid()
        OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'encargado'))
      )
    )
  );
CREATE POLICY "orden_items_update_own_or_admin" ON orden_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM ordenes_restaurante o
      WHERE o.id = orden_items.orden_id
      AND (
        o.mesero_id = auth.uid()
        OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'encargado'))
      )
    )
  );
CREATE POLICY "orden_items_delete_own_or_admin" ON orden_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM ordenes_restaurante o
      WHERE o.id = orden_items.orden_id
      AND (
        o.mesero_id = auth.uid()
        OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'encargado'))
      )
    )
  );

-- RLS para compras
ALTER TABLE compras ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "compras_select_all" ON compras;
DROP POLICY IF EXISTS "compras_insert_admin" ON compras;
DROP POLICY IF EXISTS "compras_update_admin" ON compras;
DROP POLICY IF EXISTS "compras_delete_admin" ON compras;

CREATE POLICY "compras_select_all" ON compras FOR SELECT USING (true);
CREATE POLICY "compras_insert_admin" ON compras FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'encargado'))
  );
CREATE POLICY "compras_update_admin" ON compras FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'encargado'))
  );
CREATE POLICY "compras_delete_admin" ON compras FOR DELETE
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'));

-- RLS para empleados
ALTER TABLE empleados ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "empleados_select_all" ON empleados;
DROP POLICY IF EXISTS "empleados_insert_admin" ON empleados;
DROP POLICY IF EXISTS "empleados_update_admin" ON empleados;
DROP POLICY IF EXISTS "empleados_delete_admin" ON empleados;

CREATE POLICY "empleados_select_all" ON empleados FOR SELECT USING (true);
CREATE POLICY "empleados_insert_admin" ON empleados FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'encargado'))
  );
CREATE POLICY "empleados_update_admin" ON empleados FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'encargado'))
  );
CREATE POLICY "empleados_delete_admin" ON empleados FOR DELETE
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'));

-- RLS para propinas_distribucion
ALTER TABLE propinas_distribucion ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "propinas_select_all" ON propinas_distribucion;
DROP POLICY IF EXISTS "propinas_insert_system" ON propinas_distribucion;
DROP POLICY IF EXISTS "propinas_update_admin" ON propinas_distribucion;
DROP POLICY IF EXISTS "propinas_delete_admin" ON propinas_distribucion;

CREATE POLICY "propinas_select_all" ON propinas_distribucion FOR SELECT USING (true);
CREATE POLICY "propinas_insert_system" ON propinas_distribucion FOR INSERT WITH CHECK (true);
CREATE POLICY "propinas_update_admin" ON propinas_distribucion FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'encargado'))
  );
CREATE POLICY "propinas_delete_admin" ON propinas_distribucion FOR DELETE
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'));

-- =====================================================
-- 11. VERIFICACIÓN FINAL
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Instalación completa finalizada exitosamente';
  RAISE NOTICE '📋 Tablas creadas:';
  RAISE NOTICE '   - branches, users, suppliers';
  RAISE NOTICE '   - categories (con visual_type)';
  RAISE NOTICE '   - menu_items (con visual_type)';
  RAISE NOTICE '   - ingredientes, recetas, receta_ingredientes';
  RAISE NOTICE '   - ordenes_restaurante (con tipo_pedido, SIN mesas)';
  RAISE NOTICE '   - orden_items';
  RAISE NOTICE '   - compras, compra_items, movimientos_stock';
  RAISE NOTICE '   - empleados, propinas_distribucion';
  RAISE NOTICE '   - small_expenses, general_expenses';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Sistema listo para restaurante sin mesas';
  RAISE NOTICE '   - tipo_pedido: barra | llevar';
  RAISE NOTICE '   - visual_type: hero | list | drink';
END $$;




