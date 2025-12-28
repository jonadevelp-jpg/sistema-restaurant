# 📸 Guía: Crear Bucket de Imágenes en Supabase

## ❌ Problema

Error al subir imágenes: **"bucket not found"**

## ✅ Solución

El bucket `menu-images` no existe en Supabase Storage. Debes crearlo manualmente.

---

## 📋 Pasos para Crear el Bucket (5 minutos)

### **Paso 1: Abrir Supabase Dashboard**

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto

### **Paso 2: Ir a Storage**

1. En el menú lateral, haz clic en **"Storage"**
2. Verás una lista de buckets (probablemente esté vacía)

### **Paso 3: Crear Nuevo Bucket**

1. Haz clic en el botón **"New bucket"** (o "Crear bucket")
2. Completa el formulario:
   - **Name (Nombre):** `menu-images`
   - **Public bucket:** ✅ **MARCAR ESTA OPCIÓN** (importante para que las imágenes sean accesibles)
   - **File size limit:** Dejar en blanco o poner `52428800` (50MB)
   - **Allowed MIME types:** Dejar en blanco (permite todos los tipos de imagen)
3. Haz clic en **"Create bucket"** (o "Crear bucket")

### **Paso 4: Configurar Políticas RLS (Opcional pero Recomendado)**

1. Después de crear el bucket, haz clic en el nombre del bucket (`menu-images`)
2. Ve a la pestaña **"Policies"**
3. Ejecuta el script SQL: `database/CREAR_BUCKET_IMAGENES.sql` en el SQL Editor de Supabase

Este script configura:
- ✅ Lectura pública (todos pueden ver las imágenes)
- ✅ Escritura solo para admin/encargado
- ✅ Eliminación solo para admin/encargado

---

## 🧪 Verificar que Funcionó

### **1. Verificar que el bucket existe:**

1. Ve a Storage en Supabase Dashboard
2. Deberías ver el bucket `menu-images` en la lista
3. Debería tener un ícono de "globo" o "público" indicando que es público

### **2. Probar subir una imagen:**

1. Ve a `/admin/menu` en tu aplicación
2. Haz clic en "Editar" en cualquier item
3. Haz clic en "Seleccionar imagen"
4. Elige una imagen
5. Debería subirse sin errores

---

## 📝 Notas Importantes

### **Bucket Público vs Privado**

- ✅ **Público:** Las imágenes son accesibles sin autenticación (recomendado para menú digital)
- ❌ **Privado:** Requiere autenticación para ver las imágenes (no recomendado para menú público)

### **Tamaño de Archivo**

- Por defecto, Supabase permite hasta 50MB por archivo
- Para imágenes de productos, recomiendo máximo 5MB
- El componente `ImageUpload` ya valida esto

### **Tipos de Archivo Permitidos**

- JPG/JPEG
- PNG
- WebP
- GIF

---

## 🆘 Si Aún No Funciona

### **1. Verificar que el bucket es público:**

```sql
-- Ejecutar en Supabase SQL Editor
SELECT id, name, public
FROM storage.buckets
WHERE id = 'menu-images';
```

Deberías ver `public = true`

### **2. Verificar políticas RLS:**

```sql
-- Ejecutar en Supabase SQL Editor
SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND policyname LIKE '%menu-images%';
```

Deberías ver al menos una política de SELECT pública.

### **3. Verificar permisos de tu usuario:**

Asegúrate de que tu usuario tenga rol `admin` o `encargado` en la tabla `users`:

```sql
-- Ejecutar en Supabase SQL Editor (reemplaza TU_UUID)
SELECT id, role, email
FROM users
WHERE id = 'TU_UUID_AQUI';
```

---

## 📁 Archivos Relacionados

- `database/CREAR_BUCKET_IMAGENES.sql` - Script SQL para políticas RLS
- `src/react/components/ImageUpload.tsx` - Componente de subida de imágenes
- `src/pages/api/upload-image.ts` - API route para subir imágenes
- `GUIA_CREAR_BUCKET_IMAGENES.md` - Esta guía

---

## ✅ Resultado Esperado

Después de crear el bucket:

1. ✅ Puedes subir imágenes desde "Gestión de menú"
2. ✅ Puedes subir imágenes desde "Gestión de categorías" (cuando lo implementes)
3. ✅ Las imágenes se muestran correctamente en el menú digital
4. ✅ Las imágenes son accesibles públicamente (sin autenticación)

---

**Crea el bucket desde el Dashboard de Supabase y las imágenes funcionarán correctamente.** 🎉



