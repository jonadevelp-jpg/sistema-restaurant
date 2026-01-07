# 🎨 Plan de Rediseño UI/UX Premium + Reorganización de Imágenes

## 📊 Análisis de la Estructura Actual

### Estructura Actual de `/public`:
```
public/
├── acompañamientos/     (8 imágenes)
├── bebestibles/         (12 imágenes)
├── entradas/            (8 imágenes)
├── menu-del.dia/        (13 imágenes)
├── menu-fin-de-ano/     (5 imágenes)
├── platillos/           (20 imágenes)
├── postres/             (3 imágenes)
├── shawarmas/           (5 imágenes)
├── fondo.png
├── logo-cropped.png
├── desayuno.png
├── sandwich.png
└── salsas-*.png (7 en raíz)
```

**Problemas identificados:**
- Organización por categorías de negocio (no visual)
- Imágenes duplicadas (salsas en raíz y en acompañamientos)
- No hay separación entre hero/standard/placeholder
- No es claro qué imágenes son reutilizables
- Mapeo hardcodeado en código

## 🎯 Nueva Estructura Propuesta

```
public/
├── images/
│   ├── hero/
│   │   ├── products/        # Imágenes grandes para cards hero
│   │   ├── sections/        # Banners y headers de secciones
│   │   └── promos/          # Promociones destacadas
│   │
│   ├── products/
│   │   ├── featured/        # Productos destacados (is_featured=true)
│   │   ├── standard/        # Productos normales
│   │   └── drinks/          # Bebidas (visual_type="drink")
│   │
│   ├── ui/
│   │   ├── placeholders/    # Placeholders elegantes
│   │   ├── icons/            # Iconos del sistema
│   │   └── patterns/        # Texturas y patrones
│   │
│   └── brand/
│       ├── logo/            # Logos y variantes
│       └── textures/        # Fondos y texturas
│
└── legacy/                  # Carpeta de respaldo (copia de estructura antigua)
```

## 🔄 Estrategia de Migración

### Fase 1: Crear Nueva Estructura (Sin Romper)
1. Crear carpetas nuevas en `public/images/`
2. Mantener estructura antigua intacta
3. Crear sistema de mapeo/alias

### Fase 2: Migración Controlada
1. Analizar cada imagen y categorizarla según uso visual
2. Mover imágenes a nueva estructura
3. Crear archivo de mapeo para compatibilidad

### Fase 3: Actualizar Referencias
1. Actualizar componentes para usar nueva estructura
2. Mantener fallback a estructura antigua
3. Actualizar BD gradualmente

## 🎨 Rediseño UI Premium Minimalista

### Principios de Diseño:
- **Espacio en blanco**: Generoso padding y margins
- **Sombras suaves**: `shadow-sm` a `shadow-lg` sutiles
- **Sin bordes**: Solo en hover states
- **Bordes redondeados**: `rounded-xl` a `rounded-2xl`
- **Tipografía**: Moderna, clara, jerarquía clara
- **Colores**: Paleta minimalista, acentos sutiles
- **Animaciones**: Suaves, `transition-all duration-300`

### Componentes a Rediseñar:
1. `MenuHeroCard` - Cards premium sin bordes
2. `MenuListItem` - Lista minimalista
3. `MenuDrinkCard` - Grid elegante
4. `CategoryHero` - Hero sections premium
5. Dashboard Admin - Inputs y previews mejorados

## 📝 Sistema de Placeholders

Crear placeholders elegantes para:
- Productos sin imagen
- Categorías sin imagen
- Bebidas genéricas

## 🔧 Herramientas de Migración

1. Script de análisis de imágenes
2. Helper para mapear rutas antiguas → nuevas
3. Componente de preview mejorado en admin




