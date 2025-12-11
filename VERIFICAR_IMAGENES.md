# 🔍 Verificar Por Qué No Se Ven Las Imágenes

## 📋 Pasos para Diagnosticar

### 1. Verificar que las imágenes estén en public/

Las imágenes deben estar en `app-final/public/` con esta estructura:
```
app-final/public/
├── logo-cropped.png
├── fondo.png
├── entradas/
│   ├── hummus-pan.png
│   ├── babaGanoush-psn.png
│   └── ...
├── shawarmas/
│   ├── shawarma-mixto.png
│   └── ...
└── ...
```

### 2. Verificar cómo están guardadas en la BD

Ejecuta en Supabase SQL Editor:

```sql
-- Ver items con sus imágenes
SELECT 
  id,
  name,
  image_url,
  CASE 
    WHEN image_url LIKE '/%' THEN 'Ruta relativa (correcta para public/)'
    WHEN image_url LIKE '%supabase.co%' THEN 'URL de Supabase Storage'
    WHEN image_url IS NULL THEN 'Sin imagen'
    ELSE 'Formato desconocido'
  END as tipo_url
FROM menu_items
WHERE image_url IS NOT NULL
LIMIT 20;
```

### 3. Verificar en el navegador

1. Abre `http://localhost:4321`
2. Presiona **F12** (herramientas de desarrollador)
3. Ve a la pestaña **Console**
4. Busca errores 404 (imagen no encontrada)
5. Ve a la pestaña **Network** > **Img**
6. Recarga la página
7. Verifica qué imágenes están fallando

### 4. Probar una imagen directamente

Si un item tiene `image_url = '/entradas/hummus-pan.png'`, prueba abrir:
```
http://localhost:4321/entradas/hummus-pan.png
```

Si no carga, la imagen no está en `public/entradas/`

## 🔧 Soluciones

### Solución 1: Las imágenes están en Supabase Storage

Si las `image_url` son URLs de Supabase Storage (como `https://xxx.supabase.co/storage/...`):

1. Verifica que el bucket `menu-images` sea público
2. Verifica las políticas de acceso en Supabase Storage
3. Las URLs deberían funcionar directamente

### Solución 2: Las imágenes están como rutas relativas pero no en public/

Si las `image_url` son rutas relativas (como `/entradas/hummus-pan.png`):

1. **Copia las imágenes desde menu-qr-original:**
   ```powershell
   # Desde la raíz del proyecto
   xcopy /E /I /Y "menu-qr-original\public\*" "app-final\public\"
   ```

2. O manualmente copia:
   - `logo-cropped.png`
   - `fondo.png`
   - Todas las carpetas: `entradas/`, `shawarmas/`, `platillos/`, etc.

### Solución 3: Convertir rutas relativas a URLs de Supabase Storage

Si quieres usar Supabase Storage en lugar de archivos estáticos:

1. Sube las imágenes a Supabase Storage (bucket `menu-images`)
2. Actualiza las `image_url` en la base de datos con las URLs de Storage

## 🧪 Script de Verificación

Ejecuta este endpoint para ver el estado de las imágenes:

```
http://localhost:4321/api/menu/verificar-imagenes
```

Te mostrará:
- Cuántos items tienen imagen
- Qué tipo de URLs tienen (relativas, Supabase, etc.)
- Lista de items con sus URLs

## ✅ Verificación Rápida

1. **¿Las imágenes están en `app-final/public/`?**
   - Si NO → Cópialas desde `menu-qr-original/public/`

2. **¿Las rutas en la BD son relativas (`/entradas/...`)?**
   - Si SÍ → Deben estar en `public/entradas/`
   - Si NO → Son URLs de Supabase Storage

3. **¿Las URLs de Supabase Storage funcionan?**
   - Abre una URL directamente en el navegador
   - Si no carga → Problema de permisos de Storage

---

**Ejecuta el script de verificación primero para ver qué está pasando.**


