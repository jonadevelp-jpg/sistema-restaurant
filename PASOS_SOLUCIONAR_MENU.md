# 🚀 Pasos para Solucionar: Menú No Se Ve

## ⚡ Solución Rápida (5 minutos)

### Paso 1: Ejecutar Scripts SQL en Supabase

**Abre Supabase Dashboard → SQL Editor** y ejecuta estos scripts **EN ORDEN**:

#### 1️⃣ Primero: Corregir Recursión
```
database/FIX_TODAS_RECURSIONES.sql
```
**¿Por qué?** Corrige el error "infinite recursion detected in policy for relation users"

#### 2️⃣ Segundo: Corregir Permisos
```
database/FIX_PERMISOS_PEDIDOS.sql
```
**¿Por qué?** Asegura que las políticas RLS permitan leer categories y menu_items

#### 3️⃣ Tercero: Crear Categorías e Items
```
database/SEED_MENU_COMPLETOS.sql
```
**¿Por qué?** Crea las categorías (Destacados, Completos, Sandwiches, etc.) e items del menú

### Paso 2: Verificar que Funcionó

1. **Ejecuta este script de diagnóstico:**
   ```
   database/VERIFICAR_MENU.sql
   ```
   
2. **Revisa el resumen al final** - debería decir:
   ```
   ✅ Categorías válidas y activas: 6
   ✅ Items del menú: [número mayor a 0]
   ✅ Funciones creadas correctamente
   ```

### Paso 3: Recargar la Página

1. **Recarga la página principal** (Ctrl+F5 o Cmd+Shift+R)
2. **Abre la consola del navegador (F12)**
3. **Deberías ver:**
   ```
   ✅ Categorías encontradas: 6 ["Destacados", "Completos", ...]
   ```

---

## 🔍 Si Sigue Sin Funcionar

### Verificar Conexión

Abre en tu navegador:
```
http://localhost:4321/api/test-supabase
```

**Si dice `"success": false`**:
- Ve a `CREAR_ENV_AHORA.md` y crea el archivo `.env`

**Si dice `"success": true` pero `"count": 0`**:
- Ejecuta `SEED_MENU_COMPLETOS.sql` de nuevo

### Verificar en Consola del Navegador

Abre F12 → Console y busca:

**❌ Si ves:**
```
infinite recursion detected in policy for relation "users"
```
→ Ejecuta `FIX_TODAS_RECURSIONES.sql` de nuevo

**❌ Si ves:**
```
No se encontraron categorías activas
```
→ Ejecuta `SEED_MENU_COMPLETOS.sql`

**❌ Si ves:**
```
Variables de entorno no configuradas
```
→ Crea el archivo `.env` (ver `CREAR_ENV_AHORA.md`)

---

## 📋 Checklist Final

- [ ] Ejecuté `FIX_TODAS_RECURSIONES.sql`
- [ ] Ejecuté `FIX_PERMISOS_PEDIDOS.sql`
- [ ] Ejecuté `SEED_MENU_COMPLETOS.sql`
- [ ] Ejecuté `VERIFICAR_MENU.sql` y vi que hay 6 categorías
- [ ] Recargué la página (Ctrl+F5)
- [ ] Abrí la consola (F12) y no veo errores
- [ ] El menú se muestra correctamente

---

## 🆘 Si Nada Funciona

Comparte:
1. El resultado de `http://localhost:4321/api/test-supabase`
2. El resumen de `VERIFICAR_MENU.sql`
3. Los mensajes de la consola del navegador (F12)




