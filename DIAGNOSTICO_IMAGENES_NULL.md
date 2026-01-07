# 🔍 Diagnóstico: Imágenes Null en Base de Datos

## ❌ Problema

Los items tienen `imageUrl: null` en la base de datos, por lo que no se muestran las imágenes en:
- Cards del menú digital
- Miniatura en gestión de menú
- Modal de detalle

## 🔍 Pasos para Diagnosticar

### 1. Verificar qué se está enviando al guardar

Abre la consola del navegador (F12) y busca:
```
📤 Enviando datos: { method: 'PUT', body: {...}, image_url: '...', hasImage: true/false }
```

**Si `hasImage: false` o `image_url: null`:**
- La imagen no se está guardando en `formData.image_url`
- Verifica que después de subir la imagen, el `ImageUpload` llame a `onImageChange(result.url)`

### 2. Verificar qué recibe el backend

En la consola del servidor (terminal donde corre `npm run dev`), busca:
```
📥 PUT menu-items-v2 - Datos recibidos: { image_url: '...', has_image: true/false }
```

**Si `has_image: false` o `image_url: null`:**
- El `image_url` no se está enviando en el body
- Verifica que `formData.image_url` tenga valor antes de enviar

### 3. Verificar qué se guarda en la BD

En la consola del servidor, busca:
```
💾 Datos a actualizar en BD: { image_url: '...', ... }
✅ Item actualizado exitosamente: { image_url: '...', has_image: true/false }
```

**Si `has_image: false` después de actualizar:**
- El `image_url` no se está guardando en la BD
- Puede ser un problema de RLS o de la columna en la BD

### 4. Verificar directamente en la BD

Ejecuta en Supabase SQL Editor:
```sql
SELECT 
  id,
  name,
  image_url,
  updated_at,
  CASE 
    WHEN image_url IS NULL THEN '❌ Sin imagen'
    WHEN image_url LIKE 'http%' THEN '✅ URL de Supabase Storage'
    WHEN image_url LIKE '/%' THEN '✅ Ruta relativa'
    ELSE '⚠️ Formato desconocido'
  END as tipo_imagen
FROM menu_items
WHERE id IN (SELECT id FROM menu_items ORDER BY updated_at DESC LIMIT 5)
ORDER BY updated_at DESC;
```

## ✅ Soluciones

### Solución 1: La imagen no se está guardando en formData

**Síntoma:** `hasImage: false` en el log de "Enviando datos"

**Causa:** El `ImageUpload` no está llamando a `onImageChange` o el valor no se está guardando

**Solución:**
1. Verifica que después de subir la imagen, aparezca el preview
2. Verifica en la consola: `✅ Imagen subida correctamente: [URL]`
3. Si no aparece, hay un problema con la subida de la imagen

### Solución 2: El image_url se envía como null

**Síntoma:** `image_url: null` en el log de "Enviando datos"

**Causa:** El `formData.image_url` se está reseteando o nunca se actualizó

**Solución:**
1. Verifica que `ImageUpload` tenga `onImageChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}`
2. Agrega un `console.log` en `onImageChange` para ver si se está llamando
3. Verifica que `formData.image_url` tenga valor antes de enviar

### Solución 3: El backend no recibe el image_url

**Síntoma:** `has_image: false` en el log del servidor

**Causa:** El `image_url` no se está incluyendo en el body del request

**Solución:**
1. Verifica que el body incluya `image_url` antes de hacer `JSON.stringify`
2. Verifica que no haya un filtro que elimine campos `null` o `undefined`

### Solución 4: El image_url no se guarda en la BD

**Síntoma:** `has_image: false` después de actualizar

**Causa:** Problema con RLS o con la columna `image_url` en la BD

**Solución:**
1. Verifica que la columna `image_url` exista y permita valores `NULL`
2. Verifica las políticas RLS de `menu_items`
3. Ejecuta el script SQL para verificar permisos

## 🧪 Test Rápido

1. **Edita un item existente**
2. **Sube una imagen nueva**
3. **Verifica en la consola:**
   - `✅ Imagen subida correctamente: [URL]`
   - `📤 Enviando datos: { image_url: '[URL]', hasImage: true }`
   - `📥 PUT menu-items-v2 - Datos recibidos: { has_image: true }`
   - `💾 Datos a actualizar en BD: { image_url: '[URL]' }`
   - `✅ Item actualizado exitosamente: { has_image: true }`

4. **Recarga la página del menú digital**
5. **Verifica que la imagen se muestre**

Si todos los logs muestran `hasImage: true` pero la imagen no se muestra, el problema está en el renderizado o en el cache busting.




