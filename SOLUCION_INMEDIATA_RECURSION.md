# 🚨 Solución Inmediata: Recursión Infinita

## ⚡ Opción 1: Desactivar RLS Temporalmente (MÁS RÁPIDO)

**Para que el menú funcione AHORA:**

1. **Abre Supabase Dashboard → SQL Editor**
2. **Ejecuta:** `database/DESACTIVAR_RLS_TEMPORAL.sql`
3. **Recarga la página** (Ctrl+F5)
4. **El menú debería aparecer inmediatamente**

⚠️ **Nota:** Esto desactiva RLS solo en `categories` y `menu_items` para que el menú digital funcione. Es seguro para desarrollo.

---

## ⚡ Opción 2: Corregir Todas las Políticas (MÁS SEGURO)

**Para una solución permanente:**

1. **Abre Supabase Dashboard → SQL Editor**
2. **Ejecuta:** `database/FIX_RECURSION_DEFINITIVO.sql`
3. **Recarga la página** (Ctrl+F5)

Este script:
- Crea funciones `SECURITY DEFINER` para evitar recursión
- Corrige TODAS las políticas que consultan `users`
- Hace `categories` y `menu_items` públicos para lectura

---

## 🔍 ¿Por Qué Sigue el Error?

El error persiste porque las políticas de `categories` y `menu_items` en `000_INSTALACION_COMPLETA.sql` consultan `users` directamente:

```sql
EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
```

Cuando Supabase evalúa estas políticas, también evalúa la política de `users`, que consulta `users` de nuevo → **recursión infinita**.

---

## ✅ Recomendación

**Ejecuta primero:** `DESACTIVAR_RLS_TEMPORAL.sql` para que funcione inmediatamente.

**Luego ejecuta:** `FIX_RECURSION_DEFINITIVO.sql` para una solución permanente.

---

## 🧪 Verificar que Funcionó

Después de ejecutar cualquiera de los scripts:

1. **Recarga la página** (Ctrl+F5)
2. **Abre la consola del navegador (F12)**
3. **NO deberías ver:**
   ```
   infinite recursion detected in policy for relation "users"
   ```
4. **Deberías ver:**
   ```
   ✅ Categorías encontradas: 6 ["Destacados", "Completos", ...]
   ```

---

## 📝 Si Aún No Funciona

1. **Verifica que ejecutaste el script completo** (todo el contenido)
2. **Verifica que no hay errores en el SQL Editor de Supabase**
3. **Ejecuta:** `database/VERIFICAR_MENU.sql` para ver el estado
4. **Comparte el resultado** del script de verificación



