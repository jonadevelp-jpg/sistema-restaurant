-- =====================================================
-- SCRIPT PARA CREAR TABLA DE MESAS
-- =====================================================
-- Ejecutar en Supabase SQL Editor
-- Este script crea la tabla mesas si no existe

CREATE TABLE IF NOT EXISTS mesas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero INTEGER NOT NULL UNIQUE,
  capacidad INTEGER DEFAULT 4,
  estado TEXT NOT NULL DEFAULT 'libre' CHECK (estado IN ('libre', 'ocupada', 'reservada', 'mantenimiento')),
  ubicacion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_mesas_estado ON mesas(estado);
CREATE INDEX IF NOT EXISTS idx_mesas_numero ON mesas(numero);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_mesas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_mesas_updated_at ON mesas;

CREATE TRIGGER trigger_update_mesas_updated_at
    BEFORE UPDATE ON mesas
    FOR EACH ROW
    EXECUTE FUNCTION update_mesas_updated_at();

-- RLS (Row Level Security)
ALTER TABLE mesas ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas si existen
DROP POLICY IF EXISTS "mesas_select_all" ON mesas;
DROP POLICY IF EXISTS "mesas_insert_admin" ON mesas;
DROP POLICY IF EXISTS "mesas_update_admin" ON mesas;
DROP POLICY IF EXISTS "mesas_delete_admin" ON mesas;

-- Políticas RLS
CREATE POLICY "mesas_select_all"
  ON mesas FOR SELECT
  USING (true);

CREATE POLICY "mesas_insert_admin"
  ON mesas FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'encargado')
    )
  );

CREATE POLICY "mesas_update_admin"
  ON mesas FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'encargado', 'mesero')
    )
  );

CREATE POLICY "mesas_delete_admin"
  ON mesas FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
    )
  );

-- =====================================================
-- CREAR MESAS DE EJEMPLO (OPCIONAL)
-- =====================================================
-- Descomenta las siguientes líneas si quieres crear mesas de ejemplo

-- Crear 10 mesas numeradas del 1 al 10
INSERT INTO mesas (numero, capacidad, estado, ubicacion)
SELECT 
  generate_series(1, 10) as numero,
  4 as capacidad,
  'libre' as estado,
  'Sala principal' as ubicacion
ON CONFLICT (numero) DO NOTHING;

-- Verificar que las mesas se crearon
SELECT * FROM mesas ORDER BY numero;

