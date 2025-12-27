# 🔧 Solución: Imágenes de Categorías No Se Muestran

## 📋 Pasos para Diagnosticar

### 1. Verificar que el campo `image_url` existe en la BD

Ejecuta en Supabase SQL Editor:

```sql
-- Verificar que el campo existe
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'categories'
  AND column_name = 'image_url';
```

Si no existe, ejecuta:
```sql
ALTER TABLE categories ADD COLUMN image_url TEXT;
```

### 2. Verificar qué categorías tienen imágenes

Ejecuta:
```sql
SELECT id, name, slug, image_url, LENGTH(image_url) as url_length
FROM categories
ORDER BY id;
```

### 3. Verificar que el `image_url` se está guardando

1. Abre la consola del navegador (F12)
2. Abre la consola del servidor (terminal donde corre `npm run dev`)
3. Edita una categoría y sube una imagen
4. Busca estos logs en orden:

**En el navegador:**
- `📤 ImageUpload - Respuesta del servidor:` - ¿Tiene `url`?
- `🖼️ ImageUpload callback - URL recibida:` - ¿Se recibe la URL?
- `🖼️ Actualizando formData.image_url:` - ¿Se actualiza el formData?
- `📤 Enviando datos de categoría:` - ¿Tiene `image_url` en el body?

**En el servidor:**
- `📥 PUT categories-v2 - Datos recibidos:` - ¿Tiene `image_url`?
- `📥 MenuController.updateCategory - Datos recibidos:` - ¿Tiene `image_url`?
- `🖼️ Guardando image_url de categoría:` - ¿Se está guardando?
- `💾 Datos a actualizar en BD (categoría):` - ¿Tiene `image_url`?
- `✅ Categoría actualizada exitosamente:` - ¿Tiene `image_url` en la respuesta?

### 4. Verificar directamente en la BD

Después de subir una imagen, ejecuta:

```sql
SELECT id, name, image_url, created_at
FROM categories
WHERE id = TU_CATEGORIA_ID
ORDER BY created_at DESC;
```

Reemplaza `TU_CATEGORIA_ID` con el ID de la categoría que editaste.

### 5. Verificar que el SELECT incluye `image_url`

El servicio debe incluir `image_url` en el SELECT. Verifica que en `backend/src/services/menu.service.ts` la función `getCategories` incluya `image_url`:

```typescript
.select('id, name, slug, description, order_num, is_active, visual_type, image_url')
```

## 🔧 Soluciones Comunes

### Solución 1: El campo no existe

Ejecuta:
```sql
ALTER TABLE categories ADD COLUMN image_url TEXT;
```

### Solución 2: El campo existe pero está vacío

Verifica que el `image_url` se esté enviando correctamente desde el frontend. Revisa los logs del navegador.

### Solución 3: RLS está bloqueando la lectura

Verifica que las políticas RLS permitan leer `image_url`. Ejecuta:

```sql
-- Ver políticas RLS de categories
SELECT * FROM pg_policies WHERE tablename = 'categories';
```

### Solución 4: El SELECT no incluye `image_url`

Asegúrate de que el SELECT en `getCategories` incluya `image_url`:

```typescript
.select('id, name, slug, description, order_num, is_active, visual_type, image_url')
```

### Solución 5: Cache del navegador

1. Limpia la caché del navegador (Ctrl+Shift+Delete)
2. Recarga la página con Ctrl+F5
3. Intenta subir la imagen nuevamente

## 📝 Scripts SQL Útiles

### Ver todas las categorías con sus imágenes

```sql
SELECT 
  id,
  name,
  slug,
  image_url,
  CASE 
    WHEN image_url IS NULL THEN '❌ Sin imagen'
    WHEN image_url = '' THEN '⚠️ URL vacía'
    WHEN LENGTH(image_url) > 500 THEN '⚠️ URL muy larga'
    WHEN image_url LIKE 'http%' THEN '✅ URL completa'
    ELSE '✅ Tiene imagen'
  END as estado
FROM categories
ORDER BY id;
```

### Actualizar manualmente una categoría

```sql
UPDATE categories
SET image_url = 'TU_URL_AQUI'
WHERE id = TU_ID_AQUI;
```

### Verificar el tipo de dato del campo

```sql
SELECT 
  column_name,
  data_type,
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'categories'
  AND column_name = 'image_url';
```

