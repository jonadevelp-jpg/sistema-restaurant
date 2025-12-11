# 🖨️ Menú Imprimible - Guía de Uso

## 📋 Descripción

Sistema de menú imprimible que genera cartas por sección con el diseño elegante estilo Medio Oriente, similar a las imágenes de referencia.

## 🎨 Características del Diseño

- **Fondo oscuro** (negro/verde oscuro) con patrones geométricos dorados sutiles
- **Título grande** en dorado con fuente Cinzel (serif elegante)
- **Foto grande** de comida enmarcada con borde dorado de 4px
- **Lista de items** en blanco con precios en cajas doradas
- **Estilo sofisticado** y elegante

## 🚀 Cómo Usar

### Opción 1: Desde el Admin

1. Ve a `/admin/menu-imprimible`
2. Selecciona la categoría que deseas imprimir
3. Haz clic en "🖨️ Imprimir"
4. El menú se generará con el diseño completo

### Opción 2: URL Directa

1. Ve a `/menu-imprimible/[slug-categoria]`
   - Ejemplo: `/menu-imprimible/entradas`
   - Ejemplo: `/menu-imprimible/shawarmas`
2. Presiona `Ctrl+P` o `Cmd+P` para imprimir

## 📸 Imágenes

El sistema busca imágenes en este orden:

1. **Imagen de la categoría** (`categories.image_url`)
2. **Imagen del primer item destacado** de esa categoría
3. Si no hay imagen, no se muestra el contenedor de imagen

### Recomendaciones para Imágenes

- **Tamaño recomendado:** 1200x800px o similar
- **Formato:** JPG o PNG
- **Calidad:** Alta resolución para impresión
- **Contenido:** Foto apetitosa de los platos de esa categoría

## 🎯 Configuración de Impresión

### Configuración Recomendada

1. **Tamaño de papel:** A4
2. **Orientación:** Vertical (Portrait)
3. **Márgenes:** Mínimos o sin márgenes
4. **Escala:** 100%
5. **Fondo:** ✅ Incluir (Important para ver el diseño oscuro)

### En Chrome/Edge

1. Abre el menú de impresión (`Ctrl+P`)
2. Configuración:
   - Destino: "Guardar como PDF" o impresora
   - Más configuraciones:
     - ✅ Fondo de gráficos
     - ✅ Encabezados y pies de página (opcional)
3. Guarda o imprime

## 📝 Estructura del Menú

Cada menú imprimible incluye:

1. **Título de la categoría** (en mayúsculas, dorado)
2. **Descripción** (si existe, en dorado, itálica)
3. **Imagen principal** (enmarcada con borde dorado)
4. **Lista de items:**
   - Nombre del item (blanco, fuente Playfair Display)
   - Descripción (si existe, gris claro, itálica)
   - Precio (dorado, en caja con borde dorado)

## 🔧 Personalización

### Colores

Los colores están definidos en el componente:
- **Fondo:** `#0a0a0a` (negro)
- **Dorado:** `#d4af37`
- **Texto:** `#ffffff` (blanco)
- **Texto secundario:** `rgba(255, 255, 255, 0.75)`

### Fuentes

- **Títulos:** Cinzel (serif elegante)
- **Items:** Playfair Display (serif)
- **Precios:** Cinzel (serif elegante)

## 📦 Agregar Imágenes a Categorías

Para que cada categoría tenga su imagen:

1. Ve a Supabase Dashboard
2. Tabla `categories`
3. Edita la categoría
4. Agrega la URL de la imagen en `image_url`
   - Puede ser una URL externa
   - O una ruta relativa si está en `/public`

## ✅ Checklist para Imprimir

- [ ] Categoría seleccionada
- [ ] Items disponibles en esa categoría
- [ ] Imagen de categoría o item configurada
- [ ] Precios actualizados
- [ ] Configuración de impresión correcta (fondo incluido)
- [ ] Vista previa se ve correctamente

## 🐛 Solución de Problemas

### Las imágenes no se ven al imprimir

- Verifica que las URLs de las imágenes sean accesibles
- Asegúrate de que "Fondo de gráficos" esté activado en la configuración de impresión

### El fondo no se ve oscuro

- Activa "Fondo de gráficos" en la configuración de impresión
- Verifica que el navegador soporte `print-color-adjust: exact`

### Los precios no se ven bien

- Verifica que la fuente Cinzel esté cargada
- Revisa que los estilos CSS se estén aplicando correctamente

---

**¡Listo para imprimir menús profesionales!** 🎉


