# ⚡ Solución Rápida: Pedidos No Cargan

## 🚨 Problema Actual

- Los pedidos están en **loading infinito**
- Los botones "Nueva Orden" no funcionan
- La página `/admin/mesas` no carga datos

## ✅ Solución en 2 Pasos (5 minutos)

### **Paso 1: Ejecutar Script de Diagnóstico**

1. **Abre Supabase Dashboard → SQL Editor**
2. **Ejecuta:** `database/DIAGNOSTICO_ORDENES.sql`
3. **Revisa los resultados** - Te dirá qué está mal

### **Paso 2: Aplicar Solución**

**Opción A: Solución Temporal (MÁS RÁPIDO - 30 segundos)**

1. **Ejecuta:** `database/DESACTIVAR_RLS_ORDENES_TEMPORAL.sql`
2. **Recarga la página** (Ctrl+F5)
3. **Los pedidos deberían cargar inmediatamente**

⚠️ **Nota:** Esto desactiva RLS solo en `ordenes_restaurante` y `orden_items`. Es seguro para desarrollo.

---

**Opción B: Solución Permanente (2 minutos)**

1. **Ejecuta:** `database/FIX_POLITICAS_ORDENES.sql`
2. **Recarga la página** (Ctrl+F5)
3. **Los pedidos deberían cargar correctamente**

✅ **Nota:** Esto corrige las políticas RLS sin desactivarlas, usando funciones `SECURITY DEFINER`.

---

## 🔍 Verificar en la Consola del Navegador

Después de ejecutar cualquiera de los scripts:

1. **Abre la consola del navegador (F12)**
2. **Busca estos mensajes:**

   ✅ **Si funciona:**
   ```
   ✅ Usuario autenticado: [uuid]
   ✅ Datos procesados: { barra: X, llevar: Y }
   ```

   ❌ **Si NO funciona:**
   ```
   ❌ Error cargando órdenes: infinite recursion detected...
   ```
   o
   ```
   ❌ Error de permisos: No tienes acceso...
   ```

---

## 📋 Checklist de Verificación

Después de ejecutar el script, verifica:

- [ ] El script se ejecutó sin errores en Supabase SQL Editor
- [ ] La página se recargó (Ctrl+F5)
- [ ] La consola del navegador NO muestra errores de recursión
- [ ] Los pedidos cargan (o muestran "No hay pedidos" en lugar de "Cargando...")
- [ ] Los botones "Nueva Orden" abren el modal

---

## 🆘 Si Aún No Funciona

### **1. Verificar que el script se ejecutó:**

Ejecuta en Supabase SQL Editor:
```sql
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'ordenes_restaurante';
```

- Si `relrowsecurity = false` → RLS está desactivado (Opción A funcionó)
- Si `relrowsecurity = true` → RLS está activado (debe tener políticas correctas)

### **2. Verificar políticas:**

```sql
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'ordenes_restaurante';
```

Deberías ver 4 políticas si usaste Opción B.

### **3. Verificar tu usuario:**

```sql
SELECT id, role, email
FROM users
WHERE id = auth.uid();
```

Tu usuario debe tener `role = 'admin'` o `role = 'encargado'`.

### **4. Revisar la consola del navegador:**

- Abre F12 → Console
- Busca el mensaje de error específico
- Comparte el mensaje completo si persiste

---

## 📁 Archivos Creados

1. `DIAGNOSTICO_ORDENES.sql` - Script de diagnóstico
2. `DESACTIVAR_RLS_ORDENES_TEMPORAL.sql` - Solución temporal (ejecuta este primero)
3. `FIX_POLITICAS_ORDENES.sql` - Solución permanente
4. `SOLUCION_RAPIDA_PEDIDOS.md` - Esta guía

---

## ✅ Resultado Esperado

Después de ejecutar cualquiera de los scripts:

1. ✅ Los pedidos cargan correctamente (sin loading infinito)
2. ✅ Se muestran "Pedidos en Barra" y "Pedidos Para Llevar" (aunque estén vacíos)
3. ✅ Los botones "Nueva Orden Barra" y "Nueva Orden Para Llevar" abren el modal
4. ✅ Al confirmar en el modal, se crea la orden y redirige a `/admin/ordenes/[id]`

---

**💡 Recomendación:** Ejecuta primero `DESACTIVAR_RLS_ORDENES_TEMPORAL.sql` para que funcione inmediatamente, luego ejecuta `FIX_POLITICAS_ORDENES.sql` para una solución permanente.




