# ✅ Solución: Bucket de Imágenes

## ❌ Problema

Error al subir imágenes: **"bucket not found"**

## ✅ Solución Completa

### **Paso 1: Crear el Bucket en Supabase (MANUAL)**

1. **Abre Supabase Dashboard → Storage**
2. **Haz clic en "New bucket"**
3. **Configuración:**
   - **Name:** `menu-images`
   - **Public bucket:** ✅ **MARCAR** (importante)
   - **File size limit:** Dejar en blanco o `52428800` (50MB)
   - **Allowed MIME types:** Dejar en blanco
4. **Haz clic en "Create bucket"**

### **Paso 2: Configurar Políticas RLS (Opcional)**

1. **Ejecuta en Supabase SQL Editor:** `database/CREAR_BUCKET_IMAGENES.sql`
2. Esto configura las políticas para que:
   - ✅ Todos puedan ver las imágenes (público)
   - ✅ Solo admin/encargado puedan subir/eliminar

### **Paso 3: Agregar Campo image_url a Categorías**

1. **Ejecuta en Supabase SQL Editor:** `database/AGREGAR_IMAGEN_CATEGORIAS.sql`
2. Esto agrega el campo `image_url` a la tabla `categories`

---

## 📋 Cambios Realizados en el Código

### **1. CategoryManager.tsx**
- ✅ Agregado `ImageUpload` al formulario de categorías
- ✅ Agregado campo `image_url` al estado del formulario
- ✅ Agregada visualización de imagen en la lista de categorías
- ✅ Actualizado para guardar/editar `image_url`

### **2. supabase.ts**
- ✅ Agregado campo `image_url` a la interfaz `Category`

### **3. Scripts SQL Creados**
- ✅ `CREAR_BUCKET_IMAGENES.sql` - Políticas RLS para el bucket
- ✅ `AGREGAR_IMAGEN_CATEGORIAS.sql` - Agregar campo image_url

---

## 🧪 Verificar que Funcionó

### **1. Verificar que el bucket existe:**

En Supabase Dashboard → Storage:
- ✅ Deberías ver el bucket `menu-images`
- ✅ Debería tener un ícono indicando que es público

### **2. Probar subir imagen en Items:**

1. Ve a `/admin/menu`
2. Haz clic en "Editar" en cualquier item
3. Haz clic en "Seleccionar imagen"
4. Elige una imagen
5. ✅ Debería subirse sin errores

### **3. Probar subir imagen en Categorías:**

1. Ve a `/admin/menu`
2. Haz clic en "Editar" en cualquier categoría
3. Haz clic en "Seleccionar imagen"
4. Elige una imagen
5. ✅ Debería subirse sin errores

---

## 📁 Archivos Modificados

1. ✅ `src/react/components/CategoryManager.tsx` - Agregado soporte de imágenes
2. ✅ `src/lib/supabase.ts` - Agregado campo `image_url` a `Category`
3. ✅ `database/CREAR_BUCKET_IMAGENES.sql` - Políticas RLS
4. ✅ `database/AGREGAR_IMAGEN_CATEGORIAS.sql` - Campo image_url
5. ✅ `GUIA_CREAR_BUCKET_IMAGENES.md` - Guía completa

---

## ✅ Resultado Esperado

Después de completar los pasos:

1. ✅ Puedes subir imágenes desde "Gestión de menú" (items)
2. ✅ Puedes subir imágenes desde "Gestión de categorías"
3. ✅ Las imágenes se muestran en la lista de categorías
4. ✅ Las imágenes se guardan correctamente en Supabase Storage
5. ✅ Las imágenes son accesibles públicamente (sin autenticación)

---

**Crea el bucket desde el Dashboard de Supabase y ejecuta los scripts SQL. Las imágenes funcionarán correctamente.** 🎉



