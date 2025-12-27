# Estructura del Frontend

Este documento describe la organización del frontend del sistema de restaurante.

## 📁 Estructura de Carpetas

```
src/
├── @types/              # Tipos TypeScript compartidos
│   └── index.ts         # Re-exporta tipos del backend y define tipos del frontend
│
├── components/          # Componentes React organizados
│   ├── admin/          # Componentes del panel de administración
│   │   ├── Sidebar.tsx
│   │   ├── Dashboard.tsx
│   │   ├── OrdenForm.tsx
│   │   ├── PedidosView.tsx
│   │   └── ... (otros componentes admin)
│   │
│   └── public/         # Componentes del menú público
│       ├── MenuSimplified.tsx
│       ├── MenuSectionSimplified.tsx
│       ├── MenuHeroCard.tsx      # visual_type: "hero"
│       ├── MenuListItem.tsx      # visual_type: "list"
│       └── MenuDrinkCard.tsx     # visual_type: "drink"
│
├── services/           # Clientes API y servicios
│   └── api-client.ts   # Cliente centralizado para llamadas a la API
│
├── utils/              # Utilidades y helpers
│   ├── currency.ts     # Formateo de moneda (CLP)
│   ├── date.ts         # Formateo de fechas
│   ├── tips.ts         # Distribución de propinas
│   ├── commission.ts   # Cálculo de comisiones
│   └── index.ts        # Re-exporta todas las utilidades
│
├── lib/                # Librerías y configuraciones
│   ├── supabase.ts     # Cliente de Supabase y tipos de BD
│   ├── api-helpers.ts  # Helpers para rutas API de Astro
│   └── printer-service.ts  # Servicio de impresión
│
├── pages/              # Páginas Astro (routing)
│   ├── index.astro     # Página principal
│   ├── [category].astro # Página de categoría (menú público)
│   └── admin/          # Páginas del panel admin
│
└── layouts/            # Layouts de Astro
    ├── PublicLayout.astro
    └── AdminLayout.astro
```

## 🎨 Menú Digital Simplificado

El menú digital utiliza tres tipos visuales diferentes según el campo `visual_type`:

### 1. **Hero** (`visual_type: "hero"`)
- Cards grandes con imagen destacada
- Para productos principales: completos, churrascos, pollo asado
- Componente: `MenuHeroCard.tsx`
- Grid responsivo: 1 columna (móvil) → 2 (tablet) → 3 (desktop)

### 2. **List** (`visual_type: "list"`)
- Lista simple texto + precio
- Para acompañamientos: papas, salsas
- Componente: `MenuListItem.tsx`
- Layout vertical compacto

### 3. **Drink** (`visual_type: "drink"`)
- Grid simple para bebidas
- Componente: `MenuDrinkCard.tsx`
- Grid responsivo: 2 columnas (móvil) → 3-5 (desktop)

### Herencia de `visual_type`
- Si un `menu_item` tiene `visual_type: "inherit"` o `null`, hereda el `visual_type` de su categoría
- Si la categoría tampoco tiene `visual_type`, se usa "hero" si tiene imagen, "list" si no

## 🔄 Flujo de Datos

```
Página Astro ([category].astro)
  ↓
MenuSectionSimplified (React)
  ↓
  ├─ MenuHeroCard (si visual_type = "hero")
  ├─ MenuListItem (si visual_type = "list")
  └─ MenuDrinkCard (si visual_type = "drink")
```

## 📦 Servicios API

El archivo `services/api-client.ts` centraliza todas las llamadas a la API:

```typescript
import { menuApi, ordersApi } from '@/services/api-client';

// Obtener categorías
const categories = await menuApi.getCategories(true);

// Obtener items del menú
const items = await menuApi.getMenuItems({ categoryId: 1, availableOnly: true });

// Actualizar orden
await ordersApi.updateOrder(orderId, { estado: 'paid' });
```

## 🛠️ Utilidades

Todas las utilidades están en `utils/` y se pueden importar desde `@/utils/`:

```typescript
import { formatCLP, formatDate, distribuirPropinas } from '@/utils';
```

## 📝 Convenciones

1. **Importaciones**: Usar alias `@/` para imports desde `src/`
2. **Componentes**: Organizar por contexto (admin/public)
3. **Tipos**: Centralizar en `@types/index.ts`
4. **Servicios**: Usar `services/api-client.ts` para llamadas API
5. **Utilidades**: Mantener en `utils/` con re-exports en `utils/index.ts`

## 🔗 Relación con Backend

- Los tipos se re-exportan desde `backend/src/@types`
- Las rutas API de Astro (`pages/api/`) actúan como proxy al backend Node.js
- El frontend usa Supabase directamente solo para autenticación y algunas consultas públicas

