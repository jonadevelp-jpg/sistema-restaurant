-- MIGRACIÓN 018: TABLA DE COLA DE IMPRESIÓN (PRINT_JOBS)
-- Ejecutar en Supabase SQL Editor

-- Crear tabla print_jobs
CREATE TABLE IF NOT EXISTS print_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orden_id UUID NOT NULL REFERENCES ordenes_restaurante(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('kitchen', 'receipt', 'payment')),
  printer_target TEXT NOT NULL CHECK (printer_target IN ('kitchen', 'cashier')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'printing', 'printed', 'error')),
  error_message TEXT,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  printed_at TIMESTAMP WITH TIME ZONE,
  requested_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Índices para mejorar performance del polling
CREATE INDEX IF NOT EXISTS idx_print_jobs_status ON print_jobs(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_print_jobs_orden ON print_jobs(orden_id);
CREATE INDEX IF NOT EXISTS idx_print_jobs_created ON print_jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_print_jobs_type ON print_jobs(type);

-- Índice compuesto para el polling
CREATE INDEX IF NOT EXISTS idx_print_jobs_pending 
  ON print_jobs(status, created_at) 
  WHERE status = 'pending';

-- RLS (Row Level Security)
ALTER TABLE print_jobs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "print_jobs_select_all" ON print_jobs;
DROP POLICY IF EXISTS "print_jobs_insert_authenticated" ON print_jobs;
DROP POLICY IF EXISTS "print_jobs_update_service" ON print_jobs;
DROP POLICY IF EXISTS "print_jobs_delete_admin" ON print_jobs;

-- SELECT: Todos pueden ver los trabajos de impresión
CREATE POLICY "print_jobs_select_all"
  ON print_jobs FOR SELECT
  USING (true);

-- INSERT: Usuarios autenticados pueden crear trabajos de impresión
-- Versión simplificada: cualquier usuario autenticado puede crear print_jobs
CREATE POLICY "print_jobs_insert_authenticated"
  ON print_jobs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: Usuarios autenticados pueden actualizar sus propios trabajos o admin/encargado
CREATE POLICY "print_jobs_update_service"
  ON print_jobs FOR UPDATE
  USING (
    requested_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'encargado')
    )
  );

-- DELETE: Solo admins pueden eliminar
CREATE POLICY "print_jobs_delete_admin"
  ON print_jobs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
    )
  );

-- Comentarios para documentación
COMMENT ON TABLE print_jobs IS 'Cola de trabajos de impresión. Separa la impresión del estado de las órdenes.';
COMMENT ON COLUMN print_jobs.type IS 'Tipo de impresión: kitchen (comanda), receipt (boleta), payment (pago)';
COMMENT ON COLUMN print_jobs.printer_target IS 'Impresora destino: kitchen (cocina) o cashier (caja)';
COMMENT ON COLUMN print_jobs.status IS 'Estado: pending (pendiente), printing (imprimiendo), printed (impreso), error (error)';
COMMENT ON COLUMN print_jobs.requested_by IS 'Usuario que solicitó la impresión (para auditoría)';

