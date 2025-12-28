# 📋 PLAN DE REESTRUCTURACIÓN - Sistema Restaurante

## 🎯 OBJETIVO
Reestructurar el proyecto en una arquitectura limpia, mantenible y profesional, **SIN romper ninguna funcionalidad existente**.

---

## 📊 ANÁLISIS ACTUAL

### Estructura Actual
```
sistema-restaurant/
├── src/
│   ├── pages/
│   │   ├── api/              # Rutas API (Astro)
│   │   ├── admin/            # Páginas admin
│   │   └── index.astro       # Página pública
│   ├── react/
│   │   └── components/       # Componentes React
│   ├── components/           # Componentes Astro
│   ├── layouts/              # Layouts Astro
│   └── lib/                  # Helpers y utilidades
├── servicio-impresion-local/ # ⚠️ SERVICIO CRÍTICO (aislado)
├── database/                 # Migraciones SQL
└── public/                   # Assets estáticos
```

### Flujos Críticos Identificados

#### 1. **Sistema de Impresión** (CRÍTICO - NO TOCAR LÓGICA)
- **Ubicación**: `servicio-impresion-local/`
- **Funcionamiento**:
  - Polling a Supabase cada 3 segundos
  - Consulta tabla `print_jobs` con `status='pending'`
  - Procesa e imprime (comanda/boleta/pago)
  - Marca `print_jobs` como `printed` o `error`
- **Dependencias**:
  - Tabla `print_jobs` en Supabase
  - Tabla `ordenes_restaurante` en Supabase
  - Tabla `orden_items` en Supabase
  - Variables de entorno: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- **⚠️ REGLA**: Mantener exactamente la misma lógica, solo mejorar estructura interna si es necesario

#### 2. **Flujo de Órdenes**
- **Frontend**: `OrdenForm.tsx` → crea/actualiza órdenes
- **API**: `/api/ordenes/[id]` → actualiza estado de orden
- **Impresión**: `/api/print-jobs` → crea `print_job` en cola
- **Servicio Local**: Polling detecta `print_job` → imprime

#### 3. **Rutas API Actuales**
```
/api/print-jobs          → Crea print_job (POST)
/api/ordenes/[id]        → Actualiza orden (PATCH)
/api/categories-v2       → CRUD categorías
/api/menu-items-v2       → CRUD items
/api/menu/items          → Items del menú
/api/create-user         → Crear usuario
/api/upload-image        → Subir imagen
/api/delete-image        → Eliminar imagen
/api/print               → (Legacy, posiblemente no usado)
```

---

## 🏗️ ESTRUCTURA PROPUESTA

### Estructura Final
```
sistema-restaurant/
├── src/
│   ├── backend/                    # 🆕 Backend organizado
│   │   ├── routes/                # Endpoints HTTP (Astro API Routes)
│   │   ├── controllers/           # Manejo de request/response
│   │   ├── services/              # Lógica de negocio
│   │   ├── database/              # Queries y acceso a BD
│   │   ├── validators/            # Validaciones (Zod)
│   │   ├── helpers/               # Utilidades backend
│   │   └── @types/                # Tipos TypeScript
│   ├── frontend/                  # 🆕 Frontend organizado
│   │   ├── components/            # Componentes React
│   │   ├── pages/                 # Páginas Astro
│   │   ├── layouts/               # Layouts Astro
│   │   ├── services/               # Servicios API (cliente)
│   │   ├── hooks/                  # React hooks
│   │   ├── utils/                 # Utilidades frontend
│   │   └── @types/                # Tipos TypeScript
│   └── shared/                    # 🆕 Código compartido
│       ├── types/                 # Tipos compartidos
│       ├── constants/             # Constantes
│       └── utils/                 # Utilidades compartidas
├── servicio-impresion-local/      # ⚠️ AISLADO (sin cambios funcionales)
├── database/                       # Migraciones SQL
└── public/                         # Assets estáticos
```

### ⚠️ IMPORTANTE: Compatibilidad con Astro

**Astro requiere que las rutas API estén en `src/pages/api/`**. Por lo tanto:
- **NO moveremos** las rutas API de `src/pages/api/`
- **SÍ organizaremos** la lógica detrás de esas rutas en `src/backend/`
- Las rutas API serán **delgadas** y solo llamarán a controllers/services

---

## 📝 PLAN DE EJECUCIÓN POR ETAPAS

### ETAPA 1: Preparación y Análisis ✅
- [x] Analizar estructura actual
- [x] Mapear dependencias
- [x] Identificar flujos críticos
- [x] Crear plan detallado

### ETAPA 2: Crear Estructura Base (Sin Romper Nada)
- [ ] Crear carpetas `src/backend/` y `src/frontend/`
- [ ] Crear `src/shared/` para código compartido
- [ ] Mover tipos a `src/shared/types/`
- [ ] Mover constantes a `src/shared/constants/`

### ETAPA 3: Reestructurar Backend
- [ ] Extraer lógica de negocio de rutas API a `services/`
- [ ] Crear `controllers/` que llamen a `services/`
- [ ] Mover queries de BD a `database/`
- [ ] Crear `validators/` con Zod
- [ ] Actualizar rutas API para usar controllers

### ETAPA 4: Reestructurar Frontend
- [ ] Organizar componentes React en `frontend/components/`
- [ ] Crear `frontend/services/` para llamadas API
- [ ] Crear `frontend/hooks/` para lógica reutilizable
- [ ] Mover utilidades a `frontend/utils/`

### ETAPA 5: Servicio de Impresión (Solo Documentación)
- [ ] Documentar estructura del servicio
- [ ] Mejorar comentarios en código crítico
- [ ] Crear README específico del servicio
- [ ] **NO cambiar lógica de polling ni impresión**

### ETAPA 6: Validación y Testing
- [ ] Validar que impresión sigue funcionando
- [ ] Validar flujos de órdenes
- [ ] Validar CRUD de menú
- [ ] Validar autenticación
- [ ] Validar frontend público

---

## 🔧 DETALLES DE IMPLEMENTACIÓN

### Backend: Estructura Detallada

```
src/backend/
├── routes/                    # Mantener en src/pages/api/ (requisito Astro)
│   └── (las rutas actuales)
├── controllers/
│   ├── orders.controller.ts
│   ├── print-jobs.controller.ts
│   ├── menu.controller.ts
│   ├── categories.controller.ts
│   └── users.controller.ts
├── services/
│   ├── orders.service.ts      # Lógica de órdenes
│   ├── print-jobs.service.ts  # Lógica de print jobs
│   ├── menu.service.ts        # Lógica de menú
│   └── categories.service.ts  # Lógica de categorías
├── database/
│   ├── orders.queries.ts      # Queries de órdenes
│   ├── print-jobs.queries.ts # Queries de print jobs
│   ├── menu.queries.ts        # Queries de menú
│   └── supabase.client.ts    # Cliente Supabase
├── validators/
│   ├── orders.validator.ts
│   ├── print-jobs.validator.ts
│   └── menu.validator.ts
├── helpers/
│   ├── auth.helper.ts         # requireAuth, etc.
│   ├── response.helper.ts     # jsonResponse, errorResponse
│   └── errors.helper.ts       # Manejo de errores
└── @types/
    ├── orders.types.ts
    ├── print-jobs.types.ts
    └── api.types.ts
```

### Frontend: Estructura Detallada

```
src/frontend/
├── components/
│   ├── admin/                 # Componentes admin
│   │   ├── OrdenForm.tsx
│   │   ├── ComandaCocina.tsx
│   │   ├── BoletaCliente.tsx
│   │   └── ...
│   ├── menu/                  # Componentes menú público
│   │   ├── MenuItemCard.tsx
│   │   └── MenuSection.tsx
│   └── shared/                # Componentes compartidos
│       ├── NavigationMenu.tsx
│       └── ...
├── services/
│   ├── api/
│   │   ├── orders.api.ts      # Cliente API de órdenes
│   │   ├── print-jobs.api.ts  # Cliente API de print jobs
│   │   └── menu.api.ts        # Cliente API de menú
│   └── supabase.client.ts     # Cliente Supabase frontend
├── hooks/
│   ├── useOrders.ts
│   ├── useMenu.ts
│   └── useAuth.ts
├── utils/
│   ├── currency.ts
│   ├── date.ts
│   └── format.ts
└── @types/
    └── (tipos específicos de frontend)
```

### Shared: Código Compartido

```
src/shared/
├── types/
│   ├── orders.types.ts        # Tipos de órdenes
│   ├── menu.types.ts          # Tipos de menú
│   └── print-jobs.types.ts    # Tipos de print jobs
├── constants/
│   ├── order-status.ts        # Estados de orden
│   ├── print-types.ts         # Tipos de impresión
│   └── roles.ts               # Roles de usuario
└── utils/
    └── (utilidades compartidas)
```

---

## ⚠️ REGLAS CRÍTICAS

### 1. Servicio de Impresión
- ✅ **NO cambiar** lógica de polling
- ✅ **NO cambiar** acceso a base de datos
- ✅ **NO cambiar** tablas que consume
- ✅ **SÍ mejorar** estructura interna (si está mezclado)
- ✅ **SÍ documentar** mejor

### 2. Rutas API
- ✅ **NO mover** de `src/pages/api/` (requisito Astro)
- ✅ **SÍ extraer** lógica a controllers/services
- ✅ **SÍ mantener** compatibilidad total

### 3. Base de Datos
- ✅ **NO cambiar** esquema de tablas
- ✅ **NO cambiar** nombres de campos
- ✅ **NO cambiar** relaciones

### 4. Frontend
- ✅ **NO cambiar** comportamiento de componentes
- ✅ **SÍ mejorar** organización
- ✅ **SÍ mejorar** UX (sin cambiar funcionalidad)

---

## 🚀 ORDEN DE EJECUCIÓN

1. **Crear estructura base** (carpetas vacías)
2. **Mover tipos y constantes** (sin romper imports)
3. **Extraer servicios** (empezar por uno, validar)
4. **Extraer controllers** (empezar por uno, validar)
5. **Actualizar rutas API** (una por una, validar)
6. **Reorganizar frontend** (componentes, servicios)
7. **Validar todo** (impresión, órdenes, menú)
8. **Documentar** (README, comentarios)

---

## ✅ CRITERIOS DE ÉXITO

- ✅ Todas las funcionalidades siguen funcionando
- ✅ Servicio de impresión funciona igual
- ✅ Código más organizado y mantenible
- ✅ Separación clara de responsabilidades
- ✅ Tipos bien definidos
- ✅ Fácil de escalar
- ✅ Listo para GitHub y Vercel

---

## 📌 NOTAS IMPORTANTES

1. **Astro API Routes**: Deben estar en `src/pages/api/` - esto es un requisito de Astro
2. **Servicio de Impresión**: Es independiente y crítico - mantenerlo aislado
3. **Supabase**: Usar el mismo cliente, no crear múltiples instancias
4. **Tipos**: Centralizar en `shared/types/` para evitar duplicación
5. **Validaciones**: Usar Zod para validar entrada en todas las rutas API

---

## 🎯 SIGUIENTE PASO

**Ejecutar ETAPA 2**: Crear estructura base sin romper nada.

