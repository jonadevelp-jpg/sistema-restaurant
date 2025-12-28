# 🚀 Guía: Crear Usuario Admin y Categorías

## 📋 Problema Actual

1. **No puedes ingresar al panel** porque no hay usuario admin
2. **Las categorías mostradas** son del restaurante árabe (entradas, shawarmas, etc.) y no tienen relación con completos/churrascos

## ✅ Solución Paso a Paso

### 1️⃣ CREAR USUARIO ADMIN

#### Opción A: Desde Supabase Dashboard (Más Fácil)

1. **Ve a Supabase Dashboard**
   - Abre tu proyecto en Supabase
   - Ve a **Authentication** > **Users**

2. **Crear Usuario**
   - Haz clic en **"Add User"** > **"Create new user"**
   - Completa:
     - **Email:** `admin@completos.com` (o el que prefieras)
     - **Password:** (elige una contraseña segura, mínimo 6 caracteres)
   - Haz clic en **"Create User"**

3. **Copiar UUID**
   - En la lista de usuarios, encuentra el usuario que acabas de crear
   - **Copia el UUID** (es un string largo como: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

4. **Insertar en tabla users**
   - Ve a **SQL Editor** en Supabase
   - Ejecuta este script (reemplaza los valores):

```sql
-- Reemplaza 'TU_UUID_AQUI' con el UUID que copiaste
-- Reemplaza 'admin@completos.com' con tu email

INSERT INTO users (id, role, name, email)
VALUES (
  'TU_UUID_AQUI',  -- ⚠️ PEGA AQUÍ EL UUID
  'admin',
  'Administrador',
  'admin@completos.com'  -- ⚠️ CAMBIA POR TU EMAIL
)
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', name = 'Administrador';
```

5. **Verificar**
```sql
SELECT id, email, name, role FROM users WHERE role = 'admin';
```

#### Opción B: Usar el Script SQL Completo

1. Abre el archivo: `database/CREAR_USUARIO_ADMIN.sql`
2. Sigue las instrucciones paso a paso
3. Ejecuta en Supabase SQL Editor

---

### 2️⃣ CREAR CATEGORÍAS CORRECTAS

Las categorías actuales son del restaurante árabe. Necesitas crear las categorías para completos/churrascos.

#### Ejecutar Script SQL

1. **Abre Supabase SQL Editor**
2. **Ejecuta el script:** `database/CREAR_CATEGORIAS_COMPLETOS.sql`

O copia y pega esto directamente:

```sql
-- Crear categorías para completos/churrascos
INSERT INTO categories (name, slug, description, order_num, is_active, visual_type)
VALUES
  ('Completos', 'completos', 'Completos tradicionales y especiales', 1, true, 'hero'),
  ('Churrascos', 'churrascos', 'Churrascos de carne, pollo y mixtos', 2, true, 'hero'),
  ('Pollo Asado', 'pollo-asado', 'Pollo asado entero y porciones', 3, true, 'hero'),
  ('Papas', 'papas', 'Papas fritas y acompañamientos', 4, true, 'list'),
  ('Bebidas', 'bebidas', 'Bebidas frías y calientes', 5, true, 'drink'),
  ('Salsas', 'salsas', 'Salsas y aderezos', 6, true, 'list')
ON CONFLICT (slug) DO UPDATE 
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  order_num = EXCLUDED.order_num,
  is_active = EXCLUDED.is_active,
  visual_type = EXCLUDED.visual_type;
```

3. **Verificar categorías creadas:**
```sql
SELECT id, name, slug, visual_type, order_num 
FROM categories 
ORDER BY order_num;
```

---

### 3️⃣ INGRESAR AL PANEL

1. **Abre tu aplicación:** `http://localhost:4321`
2. **Ve a:** `/admin/login`
3. **Inicia sesión con:**
   - Email: `admin@completos.com` (o el que usaste)
   - Password: (la contraseña que creaste)

---

## 📝 Categorías Creadas

| Categoría | Slug | Visual Type | Descripción |
|-----------|------|-------------|-------------|
| Completos | `completos` | hero | Cards grandes con imagen |
| Churrascos | `churrascos` | hero | Cards grandes con imagen |
| Pollo Asado | `pollo-asado` | hero | Cards grandes con imagen |
| Papas | `papas` | list | Lista simple texto + precio |
| Bebidas | `bebidas` | drink | Grid simple para bebidas |
| Salsas | `salsas` | list | Lista simple texto + precio |

---

## ⚠️ Notas Importantes

1. **Si ya tienes categorías antiguas:** El script usa `ON CONFLICT` para actualizarlas, no las elimina
2. **Si quieres eliminar categorías antiguas:** Ejecuta primero `DELETE FROM categories;` (¡CUIDADO!)
3. **Visual Type:**
   - `hero` = Cards grandes con imagen (para productos principales)
   - `list` = Lista simple texto + precio (para acompañamientos)
   - `drink` = Grid simple (para bebidas)

---

## ✅ Checklist

- [ ] Usuario creado en Authentication
- [ ] UUID copiado
- [ ] Usuario insertado en tabla `users` con rol `admin`
- [ ] Categorías creadas/actualizadas
- [ ] Puedo iniciar sesión en `/admin/login`
- [ ] Veo las nuevas categorías en el menú

---

## 🆘 Problemas Comunes

### "No puedo iniciar sesión"
- Verifica que el usuario esté en la tabla `users` con rol `admin`
- Verifica que el email y password sean correctos
- Revisa la consola del navegador por errores

### "Siguen apareciendo categorías antiguas"
- Verifica que las categorías nuevas tengan `is_active = true`
- Verifica que el `order_num` sea correcto
- Limpia la caché del navegador (Ctrl+Shift+R)

### "Error al insertar usuario"
- Verifica que el UUID sea correcto (debe ser de `auth.users`)
- Verifica que la tabla `users` exista
- Verifica que no haya otro usuario con ese email

---

¡Listo! Ahora deberías poder ingresar al panel y ver las categorías correctas. 🎉



