# 📋 GUÍA DE INSTALACIÓN - Base de Datos Nueva

## 🎯 Para Base de Datos SIN Tablas Creadas

Esta guía es para instalar el sistema en una **base de datos completamente nueva** de Supabase.

---

## 📝 PASO 1: Preparar Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Abre el **SQL Editor**
3. Asegúrate de estar en la base de datos correcta

---

## 📝 PASO 2: Ejecutar Migración Completa

### ⚡ Instalación en un Solo Paso

Ejecuta **SOLO** este archivo SQL:

```sql
-- Archivo: database/migrations/000_INSTALACION_COMPLETA.sql
```

**Esta migración crea TODAS las tablas necesarias:**
- ✅ Tablas base (branches, users, suppliers)
- ✅ Tablas de menú (categories, menu_items) **con visual_type desde el inicio**
- ✅ Tablas de ingredientes y recetas
- ✅ Tablas de órdenes **con tipo_pedido desde el inicio** (SIN mesas)
- ✅ Tablas de compras y stock
- ✅ Tablas de empleados y propinas
- ✅ Tablas de gastos
- ✅ Todos los índices, triggers y RLS necesarios

---

## 📝 PASO 3: Verificar Instalación

Ejecuta este script para verificar que todas las tablas fueron creadas:

```sql
-- Verificar tablas principales
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

**Deberías ver estas tablas:**
- branches
- categories
- compra_items
- compras
- empleados
- general_expenses
- ingredientes
- menu_items
- movimientos_stock
- orden_items
- ordenes_restaurante
- propinas_distribucion
- receta_ingredientes
- recetas
- small_expenses
- suppliers
- users

---

## 📝 PASO 4: Verificar Campos Nuevos

### Verificar tipo_pedido en órdenes:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'ordenes_restaurante'
  AND column_name = 'tipo_pedido';
```

**Resultado esperado:**
- column_name: `tipo_pedido`
- data_type: `text`
- is_nullable: `YES` (puede ser NULL)

### Verificar visual_type en categories:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'categories'
  AND column_name = 'visual_type';
```

### Verificar visual_type en menu_items:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'menu_items'
  AND column_name = 'visual_type';
```

---

## 📝 PASO 5: Crear Datos Iniciales (Opcional)

### 5.1 Crear Sucursal por Defecto
```sql
INSERT INTO branches (name, address) 
VALUES ('Sucursal Principal', 'Dirección principal')
ON CONFLICT (name) DO NOTHING;
```

### 5.2 Crear Proveedor de Ejemplo
```sql
INSERT INTO suppliers (name, contact_info)
VALUES ('Proveedor General', 'contacto@proveedor.com')
ON CONFLICT DO NOTHING;
```

### 5.3 Crear Categorías de Ejemplo
```sql
INSERT INTO categories (name, slug, description, order_num, is_active, visual_type) VALUES
  ('Completos', 'completos', 'Completos tradicionales', 1, true, 'hero'),
  ('Sandwiches', 'sandwiches', 'Sandwiches variados', 2, true, 'hero'),
  ('Pollo Asado', 'pollo-asado', 'Pollo asado y acompañamientos', 3, true, 'hero'),
  ('Papas', 'papas', 'Papas fritas y variantes', 4, true, 'list'),
  ('Bebidas', 'bebidas', 'Bebidas frías y calientes', 5, true, 'drink')
ON CONFLICT (slug) DO NOTHING;
```

---

## ✅ INSTALACIÓN COMPLETA

Una vez ejecutada la migración, tu base de datos está lista para:

- ✅ Crear órdenes con `tipo_pedido` (barra o llevar)
- ✅ Gestionar menú con `visual_type` (hero, list, drink)
- ✅ Sistema de propinas
- ✅ Gestión de stock e ingredientes
- ✅ Sistema de compras
- ✅ Gestión de empleados

---

## 🚨 IMPORTANTE

### NO ejecutes otras migraciones
Si usas esta instalación completa, **NO necesitas** ejecutar las migraciones individuales (001, 002, 003, etc.) ya que todo está incluido.

### Si ya tienes tablas
Si tu base de datos **ya tiene tablas**, usa la migración `014_add_tipo_pedido_visual_type.sql` en su lugar.

---

## 📞 Soporte

Si encuentras algún error durante la instalación:
1. Verifica que estás en la base de datos correcta
2. Revisa los mensajes de error en el SQL Editor
3. Asegúrate de tener permisos de administrador en Supabase




