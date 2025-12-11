# 🔧 Solución: Imágenes No Se Ven

## 🔍 Diagnóstico Rápido

### Paso 1: Verificar cómo están guardadas las imágenes en la BD

Ejecuta en Supabase SQL Editor:

```sql
-- Ver cómo están guardadas las image_url
SELECT 
  id,
  name,
  image_url,
  CASE 
    WHEN image_url LIKE '/%' THEN '✅ Ruta relativa (correcta)'
    WHEN image_url LIKE '%supabase.co%' THEN '🔗 URL de Supabase Storage'
    WHEN image_url IS NULL THEN '❌ Sin imagen'
    ELSE '⚠️ Formato desconocido'
  END as tipo
FROM menu_items
WHERE image_url IS NOT NULL
LIMIT 10;
```

### Paso 2: Verificar que las imágenes estén en public/

Las imágenes deben estar en:
```
app-final/public/
├── logo-cropped.png ✅
├── fondo.png ✅
├── entradas/
│   ├── hummus-pan.png
│   ├── babaGanoush-psn.png
│   └── ...
├── shawarmas/
│   ├── shawarma-mixto.png
│   └── ...
└── ...
```

### Paso 3: Probar una imagen directamente

Si un item tiene `image_url = '/entradas/hummus-pan.png'`, abre en el navegador:
```
http://localhost:4321/entradas/hummus-pan.png
```

**Si no carga:**
- La imagen no está en `app-final/public/entradas/`
- O la ruta en la BD está mal

## ✅ Soluciones

### Solución 1: Las imágenes están como rutas relativas pero no cargan

**Causa:** Las imágenes están guardadas como `/entradas/hummus-pan.png` pero no están en `public/`

**Solución:**
1. Verifica que las carpetas existan en `app-final/public/`
2. Verifica que los archivos estén dentro de esas carpetas
3. Reinicia el servidor: `npm run dev`

### Solución 2: Las imágenes están en Supabase Storage

**Causa:** Las `image_url` son URLs completas de Supabase Storage

**Solución:**
1. Verifica que el bucket `menu-images` sea público
2. Abre una URL directamente en el navegador
3. Si no carga → Problema de permisos de Storage

### Solución 3: Actualizar rutas en la BD

Si las rutas están mal, puedes actualizarlas con este script SQL:

```sql
-- Actualizar rutas relativas (si están guardadas sin el / inicial)
UPDATE menu_items
SET image_url = '/' || image_url
WHERE image_url IS NOT NULL 
  AND image_url NOT LIKE '/%'
  AND image_url NOT LIKE 'http%';
```

## 🧪 Endpoint de Verificación

Abre en el navegador:
```
http://localhost:4321/api/menu/verificar-imagenes
```

Te mostrará:
- Cuántos items tienen imagen
- Qué tipo de URLs tienen
- Lista de items con sus URLs

## 📝 Verificación Final

1. **¿Las carpetas están en `app-final/public/`?**
   - ✅ entradas/
   - ✅ shawarmas/
   - ✅ platillos/
   - ✅ etc.

2. **¿Los archivos están dentro de las carpetas?**
   - Verifica que haya archivos .png dentro de cada carpeta

3. **¿Las rutas en la BD son correctas?**
   - Deben ser: `/entradas/hummus-pan.png`
   - NO: `entradas/hummus-pan.png` (sin / inicial)
   - NO: `http://...` (a menos que sea Supabase Storage)

4. **Reinicia el servidor:**
   ```powershell
   cd app-final
   npm run dev
   ```

---

**Si después de esto las imágenes aún no se ven, ejecuta el endpoint de verificación y comparte el resultado.**


