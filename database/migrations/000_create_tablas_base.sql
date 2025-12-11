-- =====================================================
-- MIGRACIÓN 000: TABLAS BASE (DEBE EJECUTARSE PRIMERO)
-- =====================================================
-- Ejecutar en Supabase SQL Editor
-- Estas tablas son necesarias para otras migraciones

-- Tabla de sucursales (si no existe)
CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  address TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de usuarios (si no existe)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'mesero', 'encargado')),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  sucursal_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de proveedores (si no existe)
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices básicos
CREATE INDEX IF NOT EXISTS idx_users_sucursal ON users(sucursal_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);

-- RLS para branches
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "branches_select_all"
  ON branches FOR SELECT
  USING (true);

CREATE POLICY "branches_insert_admin"
  ON branches FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
    )
    OR NOT EXISTS (SELECT 1 FROM users LIMIT 1) -- Permitir si no hay usuarios aún
  );

CREATE POLICY "branches_update_admin"
  ON branches FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
    )
    OR NOT EXISTS (SELECT 1 FROM users LIMIT 1)
  );

CREATE POLICY "branches_delete_admin"
  ON branches FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
    )
  );

-- RLS para users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own_or_admin"
  ON users FOR SELECT
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
    )
    OR NOT EXISTS (SELECT 1 FROM users LIMIT 1) -- Permitir si no hay usuarios aún
  );

-- RLS para suppliers
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "suppliers_select_all"
  ON suppliers FOR SELECT
  USING (true);

CREATE POLICY "suppliers_insert_admin"
  ON suppliers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'encargado')
    )
    OR NOT EXISTS (SELECT 1 FROM users LIMIT 1) -- Permitir si no hay usuarios aún
  );

CREATE POLICY "suppliers_update_admin"
  ON suppliers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
    )
    OR NOT EXISTS (SELECT 1 FROM users LIMIT 1)
  );

CREATE POLICY "suppliers_delete_admin"
  ON suppliers FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
    )
    OR NOT EXISTS (SELECT 1 FROM users LIMIT 1)
  );


