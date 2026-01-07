# 🔍 Diagnóstico Completo: Imágenes de Categorías No Se Guardan

## ✅ Verificaciones Previas

### 1. Verificar que el campo existe

Ejecuta en Supabase SQL Editor:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'categories'
  AND column_name = 'image_url';
```

**Si NO existe**, ejecuta:
```sql
ALTER TABLE categories ADD COLUMN image_url TEXT;
```

### 2. Verificar el estado actual

```sql
SELECT id, name, slug, image_url
FROM categories
ORDER BY id;
```

## 🔬 Diagnóstico Paso a Paso

### Paso 1: Abrir Consolas

1. **Consola del navegador**: Presiona `F12` → Pestaña "Console"
2. **Consola del servidor**: Terminal donde corre `npm run dev`

### Paso 2: Subir una Imagen

1. Ve a `/admin/menu` (Gestión de menú)
2. Haz clic en "Editar" en cualquier categoría
3. Haz clic en "Seleccionar imagen" y elige una imagen
4. **NO cierres el modal todavía**
5. Revisa la consola del navegador

### Paso 3: Verificar Logs en el Navegador

Busca estos logs en orden:

1. **`✅ Imagen subida correctamente:`** 
   - ¿Aparece? ✅ Sí → Continúa
   - ❌ No → El problema está en la subida de la imagen

2. **`🖼️ ImageUpload callback - URL recibida:`**
   - ¿Aparece con una URL? ✅ Sí → Continúa
   - ❌ No → El problema está en el callback de ImageUpload

3. **`🖼️ Actualizando formData.image_url:`**
   - ¿Aparece con `hasNew: true`? ✅ Sí → Continúa
   - ❌ No → El problema está en la actualización del formData

4. **Haz clic en "Actualizar"** (sin cerrar el modal)

5. **`📤 Enviando datos de categoría:`**
   - ¿Aparece con `hasImage: true`? ✅ Sí → Continúa
   - ❌ No → El problema está en el envío del formulario

### Paso 4: Verificar Logs en el Servidor

Busca estos logs en orden:

1. **`📥 PUT categories-v2 - Datos recibidos:`**
   - ¿Aparece con `has_image: true`? ✅ Sí → Continúa
   - ❌ No → El problema está en la recepción del body

2. **`📥 MenuController.updateCategory - Datos recibidos:`**
   - ¿Aparece con `hasImage: true`? ✅ Sí → Continúa
   - ❌ No → El problema está en el controller

3. **`🖼️ Guardando image_url de categoría:`**
   - ¿Aparece con `isNull: false`? ✅ Sí → Continúa
   - ❌ No → El problema está en el servicio

4. **`💾 Datos a actualizar en BD (categoría):`**
   - ¿Aparece `image_url` en el objeto? ✅ Sí → Continúa
   - ❌ No → El problema está en la construcción del updateData

5. **`✅ Categoría actualizada exitosamente:`**
   - ¿Aparece con `has_image: true`? ✅ Sí → El problema está en la respuesta o en el frontend
   - ❌ No → El problema está en la actualización de la BD

### Paso 5: Verificar en la BD

Después de subir la imagen, ejecuta:

```sql
SELECT id, name, slug, image_url
FROM categories
WHERE id = TU_CATEGORIA_ID;
```

Reemplaza `TU_CATEGORIA_ID` con el ID de la categoría que editaste.

- ✅ Si tiene `image_url` → El problema está en el frontend (no se está mostrando)
- ❌ Si tiene `null` → El problema está en el backend (no se está guardando)

## 🔧 Soluciones Según el Problema

### Problema 1: La imagen no se sube

**Síntoma**: No aparece `✅ Imagen subida correctamente:` en la consola

**Solución**: 
- Verifica que el bucket `menu-images` existe en Supabase Storage
- Verifica que tienes permisos para subir imágenes
- Revisa los errores en la consola del navegador

### Problema 2: El callback no se ejecuta

**Síntoma**: No aparece `🖼️ ImageUpload callback - URL recibida:`

**Solución**: 
- Verifica que `onImageChange` se está pasando correctamente a `ImageUpload`
- Revisa que `ImageUpload` está llamando a `onImageChange(result.url)`

### Problema 3: El formData no se actualiza

**Síntoma**: No aparece `🖼️ Actualizando formData.image_url:` o aparece con `hasNew: false`

**Solución**: 
- Verifica que el callback de `ImageUpload` está actualizando correctamente el `formData`
- Revisa que `setFormData` se está ejecutando

### Problema 4: El body no incluye image_url

**Síntoma**: `📤 Enviando datos de categoría:` muestra `hasImage: false`

**Solución**: 
- Verifica que `formData.image_url` tiene un valor antes de enviar
- Revisa que `JSON.stringify(body)` incluye `image_url`

### Problema 5: El servidor no recibe image_url

**Síntoma**: `📥 PUT categories-v2 - Datos recibidos:` muestra `has_image: false`

**Solución**: 
- Verifica que el body se está parseando correctamente
- Revisa que no hay errores en la consola del servidor

### Problema 6: El image_url no se guarda en la BD

**Síntoma**: Todos los logs muestran `hasImage: true` pero en la BD está `null`

**Solución**: 
- Verifica que RLS permite actualizar `image_url`
- Ejecuta el script `TEST_ACTUALIZAR_IMAGEN.sql` para probar manualmente
- Revisa los errores de Supabase en la consola del servidor

## 📝 Script de Prueba Manual

Si todos los logs muestran que el `image_url` se está enviando correctamente pero no se guarda, prueba actualizar manualmente:

```sql
-- Actualizar manualmente una categoría
UPDATE categories
SET image_url = 'https://tu-proyecto.supabase.co/storage/v1/object/public/menu-images/test.jpg'
WHERE id = 2;

-- Verificar
SELECT id, name, image_url
FROM categories
WHERE id = 2;
```

- ✅ Si funciona → El problema está en el código de la aplicación
- ❌ Si NO funciona → El problema está en RLS o permisos

## 🚨 Solución Rápida

Si necesitas una solución inmediata, ejecuta este script SQL para actualizar manualmente las categorías:

```sql
-- Actualizar todas las categorías con URLs de ejemplo
-- ⚠️ REEMPLAZA LAS URLs CON LAS REALES DE TUS IMÁGENES

UPDATE categories SET image_url = 'TU_URL_AQUI' WHERE id = 1; -- Destacados
UPDATE categories SET image_url = 'TU_URL_AQUI' WHERE id = 2; -- Completos
UPDATE categories SET image_url = 'TU_URL_AQUI' WHERE id = 3; -- Sandwiches
UPDATE categories SET image_url = 'TU_URL_AQUI' WHERE id = 4; -- Acompañamientos
UPDATE categories SET image_url = 'TU_URL_AQUI' WHERE id = 5; -- Pollo
UPDATE categories SET image_url = 'TU_URL_AQUI' WHERE id = 6; -- Bebidas
```




