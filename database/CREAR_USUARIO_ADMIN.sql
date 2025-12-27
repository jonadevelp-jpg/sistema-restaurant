-- =====================================================
-- CREAR USUARIO ADMIN - PASO A PASO
-- =====================================================
-- Ejecutar en Supabase SQL Editor
-- 
-- IMPORTANTE: Primero debes crear el usuario en Authentication
-- =====================================================

-- PASO 1: Crear usuario en Authentication (hacer desde Dashboard)
-- 1. Ve a Supabase Dashboard > Authentication > Users
-- 2. Haz clic en "Add User" > "Create new user"
-- 3. Ingresa:
--    - Email: admin@completos.com (o el que prefieras)
--    - Password: (elige una contraseña segura)
-- 4. Haz clic en "Create User"
-- 5. COPIA EL UUID del usuario (aparece en la lista de usuarios)

-- PASO 2: Obtener el UUID del usuario que acabas de crear
-- Ejecuta esto para ver todos los usuarios y encontrar tu UUID:
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- PASO 3: Insertar el usuario en la tabla users con rol admin
-- ⚠️ REEMPLAZA 'TU_UUID_AQUI' con el UUID que copiaste en el PASO 1
-- ⚠️ REEMPLAZA 'admin@completos.com' con el email que usaste

INSERT INTO users (id, role, name, email)
VALUES (
  '865b1535-0688-49f7-94fb-dba5d0d060a2',  -- ⚠️ PEGA AQUÍ EL UUID DEL USUARIO
  'admin',
  'Administrador',
  'admin@completos.com'  -- ⚠️ CAMBIA POR TU EMAIL
)
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', name = 'Administrador';

-- PASO 4: Verificar que se creó correctamente
SELECT id, email, name, role, created_at 
FROM users 
WHERE role = 'admin';

-- =====================================================
-- ¡LISTO! Ahora puedes iniciar sesión en /admin/login
-- =====================================================

