# 📋 PLAN DE REFACTORIZACIÓN - Sistema POS para Completos/Churrascos

## 📊 ANÁLISIS DEL SISTEMA ACTUAL

### Estructura Actual
```
sistema-restaurant/
├── src/
│   ├── pages/          # Rutas Astro (frontend + API routes)
│   │   ├── api/        # Endpoints API mezclados con frontend
│   │   ├── admin/      # Panel administrativo
│   │   └── [category].astro  # Menú público
│   ├── lib/            # Utilidades (Supabase, printer, etc.)
│   ├── react/          # Componentes React
│   └── components/     # Componentes Astro/React
├── database/           # Migraciones SQL
└── servicio-impresion-local/  # Servicio de impresión
```

### Funcionalidades Existentes
✅ Sistema de mesas (a eliminar como obligatorio)
✅ Órdenes con items personalizables
✅ Impresión automática (comandas y boletas)
✅ Sistema de propinas
✅ Pagos (efectivo, tarjeta, transferencia)
✅ Menú digital público
✅ Panel admin completo
✅ Autenticación con Supabase

### Problemas Identificados
1. ❌ Frontend y backend mezclados (API routes en `src/pages/api/`)
2. ❌ Dependencia obligatoria de mesas (aunque ya soporta `mesa_id: null`)
3. ❌ Menú digital complejo para un local simple
4. ❌ Falta separación clara de responsabilidades

---

## 🎯 OBJETIVOS DE LA REFACTORIZACIÓN

### 1. Modelo de Negocio
- **Eliminar mesas obligatorias**
- **Agregar `tipo_pedido`: "barra" | "llevar"**
- **Mantener número de orden autoincremental visible**
- **Simplificar flujo: Seleccionar → Confirmar → Imprimir → Pagar**

### 2. Menú Digital Simplificado
- **3 tipos visuales:**
  - `hero`: Cards grandes con imagen (completos, churrascos destacados)
  - `list`: Lista simple texto + precio (papas, acompañamientos)
  - `drink`: Grid simple (bebidas)
- **Mobile-first, rápido de leer**

### 3. Separación Backend/Frontend
- **Backend independiente** en `/backend`
- **Frontend limpio** en `/frontend`
- **Comunicación vía API REST**

### 4. Base de Datos
- **Agregar campos:**
  - `tipo_pedido` en `ordenes_restaurante`
  - `visual_type` en `categories` y `menu_items`
- **Mantener compatibilidad con datos existentes**

---

## 📐 ESTRUCTURA PROPUESTA

### Backend (`/backend`)
```
backend/
├── src/
│   ├── routes/         # Rutas Express/Astro API
│   │   ├── orders.ts
│   │   ├── menu.ts
│   │   └── auth.ts
│   ├── controllers/    # Lógica HTTP
│   ├── services/       # Lógica de negocio
│   ├── database/         # Supabase client
│   ├── validators/    # Validaciones Zod
│   ├── helpers/       # Utilidades
│   └── @types/        # TypeScript types
├── .env
└── package.json
```

### Frontend (`/frontend`)
```
frontend/
├── src/
│   ├── components/     # Componentes React
│   ├── pages/          # Páginas Astro
│   ├── hooks/          # Custom hooks
│   ├── services/      # API clients
│   ├── utils/          # Utilidades
│   └── @types/         # TypeScript types
├── astro.config.mjs
└── package.json
```

---

## 🔄 PLAN DE IMPLEMENTACIÓN

### Fase 1: Base de Datos ✅
1. Crear migración para agregar `tipo_pedido`
2. Crear migración para agregar `visual_type`
3. Actualizar triggers y funciones relacionadas

### Fase 2: Backend 🔄
1. Crear estructura `/backend`
2. Mover API routes a backend
3. Implementar controllers y services
4. Configurar Supabase en backend

### Fase 3: Frontend 🔄
1. Limpiar estructura frontend
2. Actualizar componentes de órdenes
3. Implementar nuevo menú digital con `visual_type`
4. Actualizar flujo de pedidos (sin mesas)

### Fase 4: Integración 🔄
1. Conectar frontend con backend
2. Actualizar sistema de impresión
3. Probar flujo completo
4. Documentar cambios

---

## ⚠️ CONSIDERACIONES IMPORTANTES

### No Eliminar
- ✅ Sistema de propinas
- ✅ Impresión automática
- ✅ Pagos múltiples
- ✅ Autenticación
- ✅ Panel admin

### Mantener Compatibilidad
- ✅ Datos existentes en Supabase
- ✅ Órdenes antiguas con `mesa_id`
- ✅ Migración gradual

### Mejoras UX
- ✅ Mobile-first
- ✅ Botones grandes
- ✅ Precios visibles
- ✅ Flujo rápido (menos clicks)

---

## 📝 NOTAS DE IMPLEMENTACIÓN

### Campo `tipo_pedido`
- Default: `"barra"` para nuevas órdenes
- Órdenes antiguas: `NULL` (compatibilidad)
- Validación: `"barra" | "llevar"`

### Campo `visual_type`
- En `categories`: `"hero" | "list" | "drink" | NULL`
- En `menu_items`: `"hero" | "list" | "drink" | NULL` (heredado de categoría si NULL)
- Default: `NULL` (comportamiento actual)

### Número de Orden
- Mantener formato actual: `ORD-{timestamp}` o `TAKE-{timestamp}`
- Agregar contador visible en UI
- Auto-incremental en backend

---

## 🚀 PRÓXIMOS PASOS

1. ✅ Análisis completo (COMPLETADO)
2. 🔄 Crear migraciones de BD
3. 🔄 Separar backend
4. 🔄 Refactorizar frontend
5. 🔄 Integrar y probar

