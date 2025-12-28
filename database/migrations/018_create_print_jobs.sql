-- =====================================================
-- MIGRACIÓN 018: TABLA DE COLA DE IMPRESIÓN (PRINT_JOBS)
-- =====================================================
-- Ejecutar en Supabase SQL Editor
-- 
-- Esta migración crea una tabla de cola de impresión que separa
-- completamente la impresión del estado de las órdenes.
-- 
-- CONCEPTO: Imprimir NO es un estado, es una ACCIÓN solicitada por el usuario.

-- Crear tabla print_jobs
CREATE TABLE IF NOT EXISTS print_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orden_id UUID NOT NULL REFERENCES ordenes_restaurante(id) ON DELETE CASCADE,
  
  -- Tipo de impresión solicitada
  type TEXT NOT NULL CHECK (type IN ('kitchen', 'receipt', 'payment')),
  
  -- Impresora destino
  printer_target TEXT NOT NULL CHECK (printer_target IN ('kitchen', 'cashier')),
  
  -- Estado del trabajo de impresión
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'printing', 'printed', 'error')),
  
  -- Información de error (si status = 'error')
  error_message TEXT,
  
  -- Intentos de impresión
  attempts INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  printed_at TIMESTAMP WITH TIME ZONE,
  
  -- Usuario que solicitó la impresión
  requested_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Índices para mejorar performance del polling
CREATE INDEX IF NOT EXISTS idx_print_jobs_status ON print_jobs(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_print_jobs_orden ON print_jobs(orden_id);
CREATE INDEX IF NOT EXISTS idx_print_jobs_created ON print_jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_print_jobs_type ON print_jobs(type);

-- Índice compuesto para el polling (más eficiente)
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
CREATE POLICY "print_jobs_insert_authenticated"
  ON print_jobs FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      -- El usuario es el mesero de la orden
      EXISTS (
        SELECT 1 FROM ordenes_restaurante o
        WHERE o.id = print_jobs.orden_id
        AND o.mesero_id = auth.uid()
      )
      OR
      -- El usuario es admin, encargado o mesero
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND u.role IN ('admin', 'encargado', 'mesero')
      )
    )
  );

-- UPDATE: Solo el servicio de impresión puede actualizar (usando service_role)
-- O usuarios autenticados pueden actualizar sus propios trabajos
CREATE POLICY "print_jobs_update_service"
  ON print_jobs FOR UPDATE
  USING (
    -- Permitir si es el usuario que lo creó
    requested_by = auth.uid()
    OR
    -- Permitir a admin/encargado
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'encargado')
    )
    -- Nota: El servicio local usa service_role, que bypass RLS
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
COMMENT ON TABLE print_jobs IS 
  'Cola de trabajos de impresión. Separa la impresión del estado de las órdenes.';

COMMENT ON COLUMN print_jobs.type IS 
  'Tipo de impresión: kitchen (comanda), receipt (boleta), payment (pago)';

COMMENT ON COLUMN print_jobs.printer_target IS 
  'Impresora destino: kitchen (cocina) o cashier (caja)';

COMMENT ON COLUMN print_jobs.status IS 
  'Estado: pending (pendiente), printing (imprimiendo), printed (impreso), error (error)';

COMMENT ON COLUMN print_jobs.requested_by IS 
  'Usuario que solicitó la impresión (para auditoría)';

-- Verificación
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'print_jobs'
ORDER BY ordinal_position;


