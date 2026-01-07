# 🚨 Solución: Pedidos No Cargan y Botones No Funcionan

## ❌ Problema

1. **Los pedidos no dejan de cargar** (loading infinito)
2. **Los botones "Nueva Orden Barra" y "Nueva Orden Para Llevar" no hacen nada**

## 🔍 Causa

Las políticas RLS (Row Level Security) de `ordenes_restaurante` están consultando la tabla `users` directamente, causando **recursión infinita** similar al problema del menú digital.

## ✅ Solución (2 minutos)

### **Paso 1: Ejecutar Script SQL**

1. **Abre Supabase Dashboard → SQL Editor**
2. **Ejecuta:** `database/FIX_POLITICAS_ORDENES.sql`
3. **Espera a que termine** (deberías ver un mensaje de éxito)

Este script:
- ✅ Crea funciones `is_admin()` e `is_admin_or_encargado()` con `SECURITY DEFINER`
- ✅ Corrige TODAS las políticas de `ordenes_restaurante` para usar estas funciones
- ✅ Corrige TODAS las políticas de `orden_items`
- ✅ Elimina la recursión infinita

### **Paso 2: Recargar la Página**

1. **Recarga la página** `/admin/mesas` (Ctrl+F5)
2. **Los pedidos deberían cargar correctamente**
3. **Los botones "Nueva Orden" deberían funcionar**

---

## 🧪 Verificar que Funcionó

Después de ejecutar el script:

1. **Abre la consola del navegador (F12)**
2. **NO deberías ver:**
   ```
   infinite recursion detected in policy for relation "users"
   ```
3. **Deberías ver:**
   ```
   ✅ Usuario autenticado: [uuid]
   ✅ Datos procesados: { barra: X, llevar: Y }
   ```

---

## 📝 Qué Hace el Script

### **Antes (Problemático):**
```sql
-- Política que consulta users directamente → recursión
EXISTS (
  SELECT 1 FROM users u
  WHERE u.id = auth.uid()
  AND u.role IN ('admin', 'encargado')
)
```

### **Después (Corregido):**
```sql
-- Política que usa función SECURITY DEFINER → sin recursión
is_admin_or_encargado()
```

---

## 🆘 Si Aún No Funciona

### **1. Verificar que el script se ejecutó:**
```sql
-- Ejecuta en Supabase SQL Editor
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'ordenes_restaurante';
```

Deberías ver 4 políticas:
- `ordenes_select_own_or_admin`
- `ordenes_insert_mesero_or_admin`
- `ordenes_update_own_or_admin`
- `ordenes_delete_admin`

### **2. Verificar que las funciones existen:**
```sql
-- Ejecuta en Supabase SQL Editor
SELECT proname 
FROM pg_proc 
WHERE proname IN ('is_admin', 'is_admin_or_encargado');
```

Deberías ver ambas funciones.

### **3. Verificar tu rol de usuario:**
```sql
-- Ejecuta en Supabase SQL Editor (reemplaza TU_UUID)
SELECT id, role, email 
FROM users 
WHERE id = 'TU_UUID_AQUI';
```

Tu usuario debe tener `role = 'admin'` o `role = 'encargado'`.

### **4. Revisar la consola del navegador:**
- Abre F12 → Console
- Busca errores relacionados con `ordenes_restaurante`
- Comparte los mensajes de error si persisten

---

## 📁 Archivos Relacionados

- `database/FIX_POLITICAS_ORDENES.sql` - Script SQL para corregir políticas
- `src/react/components/PedidosView.tsx` - Componente de pedidos
- `src/pages/admin/mesas.astro` - Página de pedidos

---

## ✅ Resultado Esperado

Después de ejecutar el script:

1. ✅ Los pedidos cargan correctamente (sin loading infinito)
2. ✅ Se muestran "Pedidos en Barra" y "Pedidos Para Llevar"
3. ✅ Los botones "Nueva Orden Barra" y "Nueva Orden Para Llevar" abren el modal
4. ✅ Al confirmar en el modal, se crea la orden y redirige a `/admin/ordenes/[id]`

---

**Ejecuta el script SQL y recarga la página. El problema debería resolverse inmediatamente.** 🎉




