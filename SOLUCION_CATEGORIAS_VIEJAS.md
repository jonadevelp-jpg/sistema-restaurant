# 🔧 Solución: Categorías Viejas en Index y Navbar

## 📋 Problema

Las categorías viejas del restaurante árabe (entradas, shawarmas, platillos, etc.) seguían apareciendo en:
- La página principal (`index.astro`)
- El navbar de navegación (`NavigationMenu`)

## ✅ Solución Implementada

### 1. **Filtro de Categorías en `index.astro`**

Se agregó un filtro para **solo mostrar las categorías válidas**:

```typescript
// Categorías válidas para completos/churrascos
const validCategorySlugs = ['destacados', 'completos', 'sandwiches', 'acompanamientos', 'pollo', 'bebidas'];

// Obtener solo las categorías válidas y activas
const { data: cats, error: catsError } = await supabase
  .from('categories')
  .select('*')
  .eq('is_active', true)
  .in('slug', validCategorySlugs)  // ← FILTRO CLAVE
  .order('order_num', { ascending: true });
```

### 2. **Limpieza de Código**

- ✅ Eliminado `categoryImageMap` con categorías viejas
- ✅ Simplificado `getCategoryImage()` para usar placeholder
- ✅ Eliminado código hardcodeado de categorías viejas (shawarmas, entradas, etc.)
- ✅ Simplificado `onError` handler de imágenes

### 3. **Script SQL para Desactivar Categorías Viejas**

Se creó el archivo `database/LIMPIAR_CATEGORIAS_VIEJAS.sql` que:
- Desactiva todas las categorías que NO están en la lista válida
- No las elimina (solo las desactiva con `is_active = false`)
- Permite verificar qué categorías están activas/inactivas

## 🚀 Pasos para Aplicar la Solución

### **Paso 1: Ejecutar Script SQL**

Ejecuta en Supabase SQL Editor:

```sql
-- Archivo: database/LIMPIAR_CATEGORIAS_VIEJAS.sql
```

Esto desactivará todas las categorías viejas.

### **Paso 2: Verificar Categorías Activas**

```sql
SELECT id, name, slug, is_active, order_num
FROM categories
WHERE is_active = true
ORDER BY order_num;
```

**Deberías ver solo:**
- Destacados
- Completos
- Sandwiches
- Acompañamientos
- Pollo
- Bebidas

### **Paso 3: Verificar en la Aplicación**

1. Recarga la página principal (`/`)
2. Verifica que solo aparezcan las 6 categorías nuevas
3. Verifica que el navbar solo muestre las categorías nuevas
4. Verifica que los links funcionen correctamente

## 📝 Archivos Modificados

### **`src/pages/index.astro`**
- ✅ Filtro de categorías válidas agregado
- ✅ `categoryImageMap` actualizado
- ✅ `getCategoryImage()` simplificado
- ✅ Código de categorías viejas eliminado
- ✅ Estilos de cards actualizados a premium

### **`database/LIMPIAR_CATEGORIAS_VIEJAS.sql`** (NUEVO)
- Script SQL para desactivar categorías viejas

## ⚠️ Notas Importantes

1. **El filtro en código es suficiente** - Aunque las categorías viejas estén activas en la BD, el código ya las filtra
2. **Desactivar en BD es recomendable** - Para limpieza y evitar confusión
3. **No se eliminan datos** - Solo se desactivan, pueden reactivarse si es necesario

## 🔍 Verificación

Después de ejecutar el script SQL, verifica:

```sql
-- Categorías activas (deberían ser solo 6)
SELECT COUNT(*) FROM categories WHERE is_active = true;
-- Resultado esperado: 6

-- Categorías desactivadas
SELECT name, slug FROM categories WHERE is_active = false;
```

---

¡Listo! Ahora solo se mostrarán las categorías correctas en el menú digital y el navbar. 🎉

