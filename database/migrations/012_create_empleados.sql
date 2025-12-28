-- =====================================================
-- MIGRACIÓN 012: TABLA DE EMPLEADOS Y SISTEMA DE PROPINAS
-- =====================================================
-- Ejecutar en Supabase SQL Editor

-- Tabla de empleados
CREATE TABLE IF NOT EXISTS empleados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  funcion TEXT NOT NULL, -- 'mesero', 'cocina', 'delivery', etc.
  sueldo NUMERIC NOT NULL DEFAULT 0,
  propina_habilitada BOOLEAN DEFAULT false,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Relación opcional con usuario del sistema
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar campo propina_calculada a ordenes_restaurante (el 10% del total)
ALTER TABLE ordenes_restaurante 
ADD COLUMN IF NOT EXISTS propina_calculada NUMERIC DEFAULT 0;

-- Tabla para rastrear distribución de propinas por período
CREATE TABLE IF NOT EXISTS propinas_distribucion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empleado_id UUID REFERENCES empleados(id) ON DELETE CASCADE,
  orden_id UUID REFERENCES ordenes_restaurante(id) ON DELETE CASCADE,
  monto NUMERIC NOT NULL, -- Monto de propina que le corresponde a este empleado
  periodo_semana INTEGER, -- Semana del año (1-52)
  periodo_mes INTEGER, -- Mes (1-12)
  periodo_anio INTEGER, -- Año
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_empleados_user ON empleados(user_id);
CREATE INDEX IF NOT EXISTS idx_empleados_activo ON empleados(activo);
CREATE INDEX IF NOT EXISTS idx_empleados_propina ON empleados(propina_habilitada);
CREATE INDEX IF NOT EXISTS idx_propinas_empleado ON propinas_distribucion(empleado_id);
CREATE INDEX IF NOT EXISTS idx_propinas_orden ON propinas_distribucion(orden_id);
CREATE INDEX IF NOT EXISTS idx_propinas_periodo ON propinas_distribucion(periodo_anio, periodo_mes, periodo_semana);

-- Trigger para updated_at en empleados
CREATE OR REPLACE FUNCTION update_empleados_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_empleados_updated_at ON empleados;

CREATE TRIGGER trigger_update_empleados_updated_at
    BEFORE UPDATE ON empleados
    FOR EACH ROW
    EXECUTE FUNCTION update_empleados_updated_at();

-- RLS para empleados
ALTER TABLE empleados ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "empleados_select_all" ON empleados;
DROP POLICY IF EXISTS "empleados_insert_admin" ON empleados;
DROP POLICY IF EXISTS "empleados_update_admin" ON empleados;
DROP POLICY IF EXISTS "empleados_delete_admin" ON empleados;

CREATE POLICY "empleados_select_all"
  ON empleados FOR SELECT
  USING (true);

CREATE POLICY "empleados_insert_admin"
  ON empleados FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'encargado')
    )
  );

CREATE POLICY "empleados_update_admin"
  ON empleados FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'encargado')
    )
  );

CREATE POLICY "empleados_delete_admin"
  ON empleados FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
    )
  );

-- RLS para propinas_distribucion
ALTER TABLE propinas_distribucion ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "propinas_select_all" ON propinas_distribucion;
DROP POLICY IF EXISTS "propinas_insert_system" ON propinas_distribucion;
DROP POLICY IF EXISTS "propinas_update_admin" ON propinas_distribucion;
DROP POLICY IF EXISTS "propinas_delete_admin" ON propinas_distribucion;

CREATE POLICY "propinas_select_all"
  ON propinas_distribucion FOR SELECT
  USING (true);

CREATE POLICY "propinas_insert_system"
  ON propinas_distribucion FOR INSERT
  WITH CHECK (true); -- El sistema puede insertar propinas automáticamente

CREATE POLICY "propinas_update_admin"
  ON propinas_distribucion FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'encargado')
    )
  );

CREATE POLICY "propinas_delete_admin"
  ON propinas_distribucion FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
    )
  );







