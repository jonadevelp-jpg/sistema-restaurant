# 🔧 Solución: Error de Import TipoPedido

## ❌ Error

```
SyntaxError: The requested module '/src/lib/supabase.ts' does not provide an export named 'TipoPedido'
```

## ✅ Solución Aplicada

He corregido el import en `PedidosView.tsx`:

**Antes:**
```typescript
import { TipoPedido } from '@/lib/supabase';
```

**Después:**
```typescript
import type { TipoPedido } from '@/@types';
```

El tipo `TipoPedido` ahora se importa desde `@/@types` que es donde está correctamente definido y re-exportado desde el backend.

---

## 🚨 Error Adicional: 500 al Cargar Usuarios

También veo este error:
```
Failed to load resource: the server responded with a status of 500
/users?select=*&id=eq...
```

Esto indica que las políticas RLS de `users` también tienen recursión infinita.

---

## ✅ Solución Completa

### **Ejecuta este script SQL:**

1. **Abre Supabase Dashboard → SQL Editor**
2. **Ejecuta:** `database/FIX_TODO_DE_UNA_VEZ.sql`
3. **Recarga la página** (Ctrl+F5)

Este script corrige:
- ✅ Políticas de `users` (elimina recursión)
- ✅ Políticas de `categories` (lectura pública)
- ✅ Políticas de `menu_items` (lectura pública)
- ✅ Políticas de `ordenes_restaurante` (sin recursión)
- ✅ Políticas de `orden_items` (sin recursión)

---

## 🧪 Verificar que Funcionó

Después de ejecutar el script:

1. **Recarga la página** (Ctrl+F5)
2. **Abre la consola del navegador (F12)**
3. **NO deberías ver:**
   - ❌ `SyntaxError: The requested module... does not provide an export named 'TipoPedido'`
   - ❌ `Failed to load resource: the server responded with a status of 500`
   - ❌ `infinite recursion detected in policy for relation "users"`

4. **Deberías ver:**
   - ✅ `✅ Cliente de Supabase inicializado correctamente`
   - ✅ `✅ Usuario autenticado: [uuid]`
   - ✅ `✅ Datos procesados: { barra: X, llevar: Y }`

---

## 📁 Archivos Modificados

1. ✅ `src/react/components/PedidosView.tsx` - Import corregido
2. ✅ `database/FIX_TODO_DE_UNA_VEZ.sql` - Script SQL completo

---

**Ejecuta el script SQL y recarga la página. Ambos errores deberían desaparecer.** 🎉



