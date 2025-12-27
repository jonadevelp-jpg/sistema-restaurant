# 🔧 Solución: Imágenes No Se Actualizan

## ❌ Problema

- La imagen se sube correctamente a Supabase Storage
- Pero no se actualiza la miniatura en el admin
- Y no se actualiza en el menú digital (ni en cards ni en modal de detalle)

## ✅ Solución Implementada

### **1. Cache Busting en URLs de Imágenes**

He agregado cache busting usando `updated_at` a todas las URLs de imágenes:

```typescript
// Antes
src={item.image_url}

// Ahora
src={`${item.image_url}?v=${item.updated_at || Date.now()}`}
```

Esto fuerza al navegador a recargar la imagen cuando cambia `updated_at`.

### **2. Key Prop para Forzar Recarga**

He agregado un `key` prop que cambia cuando cambia `image_url`:

```typescript
<img
  key={imageKey}
  src={imageUrl}
  ...
/>
```

Esto fuerza a React a recrear el elemento `<img>` cuando cambia la imagen.

### **3. Auto-refresh en Menú Digital**

He agregado auto-refresh cada 30 segundos en `MenuSectionSimplified` para mantener los datos actualizados.

### **4. Verificación de `updated_at`**

El backend ya actualiza `updated_at` automáticamente cuando se modifica un item, incluyendo cuando se cambia `image_url`.

---

## 🧪 Verificar que Funcionó

### **1. Verificar que la imagen se guardó en la BD:**

Ejecuta en Supabase SQL Editor:
```sql
SELECT id, name, image_url, updated_at
FROM menu_items
WHERE id = [ID_DEL_ITEM]
ORDER BY updated_at DESC
LIMIT 1;
```

Deberías ver:
- ✅ `image_url` con la URL de Supabase Storage
- ✅ `updated_at` con la fecha/hora actual

### **2. Verificar en el Admin:**

1. Ve a `/admin/menu`
2. Edita un item y sube una imagen
3. Guarda el item
4. **Recarga la página** (Ctrl+F5)
5. ✅ La miniatura debería mostrar la nueva imagen

### **3. Verificar en el Menú Digital:**

1. Ve a la página principal del menú
2. **Recarga la página** (Ctrl+F5) para limpiar caché
3. Abre la categoría del item
4. ✅ El card debería mostrar la nueva imagen
5. Haz click en el card
6. ✅ El modal de detalle debería mostrar la nueva imagen

---

## 🔍 Si Aún No Funciona

### **1. Verificar que `image_url` se está guardando:**

Abre la consola del navegador (F12) y busca:
```
📤 Enviando datos: { method: 'PUT', body: { ..., image_url: '...' } }
```

Deberías ver que `image_url` tiene la URL de Supabase Storage.

### **2. Verificar que el backend está actualizando:**

En la consola del servidor, deberías ver:
```
✅ Item actualizado
```

### **3. Limpiar caché del navegador:**

1. Presiona **Ctrl+Shift+Delete**
2. Selecciona "Imágenes y archivos en caché"
3. Haz clic en "Borrar datos"
4. Recarga la página (Ctrl+F5)

### **4. Verificar la URL de la imagen:**

Abre la consola del navegador (F12) → Network → Img
1. Busca la imagen del item
2. Verifica que la URL tenga el parámetro `?v=...`
3. Si no lo tiene, el cache busting no está funcionando

---

## 📝 Cambios Realizados

### **Componentes Actualizados:**

1. ✅ `MenuHeroCard.tsx` - Cache busting + key prop
2. ✅ `ProductDetailModal.tsx` - Cache busting + key prop
3. ✅ `MenuDrinkCard.tsx` - Cache busting + key prop
4. ✅ `MenuItemManager.tsx` - Cache busting en miniatura
5. ✅ `MenuSectionSimplified.tsx` - Auto-refresh cada 30 segundos

### **Backend:**

- ✅ `updated_at` se actualiza automáticamente cuando se modifica un item
- ✅ `image_url` se guarda correctamente en la base de datos

---

## ✅ Resultado Esperado

Después de subir una imagen:

1. ✅ La imagen se sube a Supabase Storage
2. ✅ El `image_url` se guarda en la base de datos
3. ✅ El `updated_at` se actualiza
4. ✅ La miniatura en el admin se actualiza (después de recargar)
5. ✅ El card en el menú digital se actualiza (después de recargar o esperar 30 segundos)
6. ✅ El modal de detalle muestra la nueva imagen

---

## 💡 Recomendación

**Después de subir una imagen:**

1. **Guarda el item** en el admin
2. **Recarga la página del admin** (Ctrl+F5) para ver la miniatura actualizada
3. **Recarga la página del menú digital** (Ctrl+F5) para ver el card actualizado

O simplemente **espera 30 segundos** - el menú digital se actualizará automáticamente.

---

**Las imágenes ahora deberían actualizarse correctamente con cache busting y auto-refresh.** 🎉

