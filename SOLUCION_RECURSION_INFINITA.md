# 🚨 Solución: Recursión Infinita en Políticas RLS

## ❌ Error Detectado

```
infinite recursion detected in policy for relation "users"
```

Este error ocurre porque las políticas RLS están consultando la tabla `users` dentro de sí mismas, creando un bucle infinito.

## ✅ Solución Rápida (2 minutos)

### Paso 1: Ejecutar Script SQL

1. **Abre Supabase Dashboard:**
   - Ve a https://app.supabase.com
   - Selecciona tu proyecto
   - Ve a **SQL Editor**

2. **Ejecuta el script:**
   - Abre el archivo: `database/FIX_TODAS_RECURSIONES.sql`
   - Copia TODO el contenido
   - Pégalo en el SQL Editor de Supabase
   - Haz clic en **RUN** o presiona `Ctrl+Enter`

3. **Verifica que se ejecutó correctamente:**
   - Deberías ver mensajes: `✅ Funciones creadas`
   - No debería haber errores

### Paso 2: Recargar la Aplicación

1. **Recarga la página principal** (Ctrl+F5 o Cmd+Shift+R)
2. **Verifica que el menú digital carga correctamente**

---

## 🔍 ¿Qué Hace Este Script?

El script crea funciones `SECURITY DEFINER` que pueden leer la tabla `users` sin pasar por RLS, evitando la recursión:

- `is_admin()` - Verifica si el usuario es admin
- `is_admin_or_encargado()` - Verifica si el usuario es admin o encargado

Luego actualiza TODAS las políticas RLS para usar estas funciones en lugar de consultar `users` directamente.

---

## 🧪 Verificar que Funcionó

1. **Abre la consola del navegador (F12)**
2. **Recarga la página**
3. **No deberías ver más el error:**
   ```
   infinite recursion detected in policy for relation "users"
   ```

4. **Deberías ver:**
   - ✅ Categorías cargando
   - ✅ Items del menú mostrándose
   - ✅ Sin errores en consola

---

## 📝 Archivos Relacionados

- `database/FIX_TODAS_RECURSIONES.sql` - Script completo (RECOMENDADO)
- `database/FIX_RECURSION_USERS.sql` - Solo corrige users (si el anterior no funciona)

---

## 🆘 Si Sigue Sin Funcionar

1. **Verifica que ejecutaste el script completo**
2. **Verifica que no hay errores en el SQL Editor de Supabase**
3. **Comparte los mensajes de error de la consola del navegador**

