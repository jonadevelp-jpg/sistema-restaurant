# 🔍 Diagnóstico: No se Cambia el Estado a "Preparing"

## ⚠️ Problema

Al hacer clic en el botón "⏳ Preparación", el estado no cambia a `'preparing'`.

---

## 🔍 Pasos para Diagnosticar

### Paso 1: Verificar que el Botón NO Está Deshabilitado

El botón se deshabilita si:
- ✅ El estado actual NO es `'pending'` (ya está en otro estado)
- ✅ Está guardando (`saving === true`)
- ✅ No hay items en la orden (`items.length === 0`)

**Verifica:**
1. ¿El botón está gris/deshabilitado?
2. ¿La orden tiene items agregados?
3. ¿El estado actual es `'pending'`?

---

### Paso 2: Abrir Consola del Navegador

1. Abre tu aplicación en el navegador
2. Presiona **F12** (o clic derecho → Inspeccionar)
3. Ve a la pestaña **"Console"**

---

### Paso 3: Intentar Cambiar el Estado

1. Abre una orden con items
2. Haz clic en **"⏳ Preparación"**
3. **Observa la consola** - deberías ver mensajes como:

```
[OrdenForm] ========== INICIANDO CAMBIO DE ESTADO ==========
[OrdenForm] Estado actual: pending
[OrdenForm] Estado nuevo: preparing
[OrdenForm] Orden ID: xxx-xxx-xxx
[OrdenForm] Items en orden: 2
```

**Si NO ves estos mensajes:**
- El botón está deshabilitado o el clic no se está registrando
- Verifica las condiciones del botón (línea 746)

**Si ves estos mensajes pero hay error:**
- Copia el mensaje de error completo
- Busca líneas que empiecen con `[OrdenForm] ❌`

---

### Paso 4: Verificar Errores de RLS (Row Level Security)

Si ves un error como:
```
new row violates row-level security policy
```

**Solución:**
1. Ejecuta la migración `016_fix_ordenes_update_rls.sql` en Supabase
2. Verifica que el usuario tenga el rol correcto en la tabla `users`

---

### Paso 5: Verificar Autenticación

Si ves un error como:
```
No estás autenticado
```

**Solución:**
1. Cierra sesión y vuelve a iniciar sesión
2. Verifica que la sesión esté activa

---

## 🔧 Soluciones Comunes

### Solución 1: El Botón Está Deshabilitado

**Causa:** El estado actual no es `'pending'`

**Verificación:**
- Abre la consola (F12)
- Escribe: `document.querySelector('button[aria-label="Marcar orden en preparación"]')`
- Verifica si tiene la clase `disabled` o el atributo `disabled`

**Solución:**
- Asegúrate de que la orden esté en estado `'pending'`
- Si ya está en otro estado, no puedes cambiarla a `'preparing'`

---

### Solución 2: Error de RLS (Row Level Security)

**Causa:** Las políticas de seguridad están bloqueando la actualización

**Solución:**
1. Ve a Supabase Dashboard → SQL Editor
2. Ejecuta la migración `016_fix_ordenes_update_rls.sql`
3. Verifica que el usuario tenga rol `'mesero'`, `'admin'` o `'encargado'` en la tabla `users`

```sql
-- Verificar tu rol
SELECT id, email, role FROM users WHERE id = auth.uid();

-- Si no tienes rol, actualízalo
UPDATE users SET role = 'mesero' WHERE id = auth.uid();
```

---

### Solución 3: Error de Autenticación

**Causa:** La sesión expiró o no está activa

**Solución:**
1. Cierra sesión
2. Vuelve a iniciar sesión
3. Intenta cambiar el estado nuevamente

---

### Solución 4: Error en la API Route

**Causa:** La API route está fallando

**Verificación:**
- Abre la consola (F12)
- Ve a la pestaña **"Network"** (Red)
- Filtra por **"Fetch/XHR"**
- Busca una petición a `/api/ordenes/[id]`
- Haz clic en ella y revisa la respuesta

**Si hay error 500:**
- Revisa los logs de Vercel
- Verifica que la API route esté funcionando

---

## 📋 Checklist de Diagnóstico

- [ ] El botón NO está deshabilitado (no está gris)
- [ ] La orden tiene items agregados
- [ ] El estado actual es `'pending'`
- [ ] Abriste la consola del navegador (F12)
- [ ] Viste los mensajes `[OrdenForm]` en la consola
- [ ] Copiaste el mensaje de error completo (si hay)
- [ ] Verificaste que el usuario esté autenticado
- [ ] Verificaste que el usuario tenga el rol correcto

---

## 🆘 Si Nada Funciona

1. **Abre la consola del navegador (F12 → Console)**
2. **Haz clic en "⏳ Preparación"**
3. **Copia TODOS los mensajes** que aparecen en la consola
4. **Comparte esos mensajes** conmigo

**Con esa información podremos identificar exactamente dónde está fallando.** 🔍

---

## 📝 Notas

- El botón "🖨️ Comanda" NO cambia el estado, solo muestra vista previa
- Para cambiar el estado, debes hacer clic en "⏳ Preparación"
- El estado solo se puede cambiar de `'pending'` a `'preparing'`
- Si la orden ya está en otro estado, no puedes cambiarla a `'preparing'`



