# 🚀 Backend Separado - Documentación

## ✅ Cambios Realizados

### Estructura Creada

```
backend/
├── src/
│   ├── database/
│   │   └── supabase.ts          # Cliente centralizado de Supabase
│   ├── services/                 # Lógica de negocio
│   │   ├── menu.service.ts      # Gestión de categorías e items
│   │   └── orders.service.ts    # Gestión de órdenes
│   ├── controllers/             # Lógica HTTP
│   │   ├── menu.controller.ts   # Endpoints de menú
│   │   └── orders.controller.ts # Endpoints de órdenes
│   ├── helpers/                 # Utilidades
│   │   ├── api-helpers.ts       # Helpers de respuestas
│   │   └── auth.ts              # Autenticación
│   └── @types/                  # Tipos TypeScript
│       └── index.ts             # Tipos compartidos
└── README.md
```

### API Routes Actualizadas

Las siguientes API routes ahora usan el backend:

- ✅ `src/pages/api/ordenes/[id].ts` → Usa `OrdersController`
- ✅ `src/pages/api/menu/items.ts` → Usa `MenuController`
- ✅ `src/pages/api/categories-v2.ts` → Usa `MenuController`

### Beneficios

1. **Separación de responsabilidades**: Lógica de negocio separada de HTTP
2. **Reutilizable**: Services pueden usarse desde cualquier parte
3. **Testeable**: Fácil de testear la lógica de negocio
4. **Escalable**: Preparado para backend independiente si es necesario

## 📝 Uso

### Desde API Routes de Astro

```typescript
import { MenuController } from '../../../backend/src/controllers/menu.controller';
import { MenuService } from '../../../backend/src/services/menu.service';
import { supabase } from '../../../backend/src/database/supabase';

const menuService = new MenuService(supabase);
const menuController = new MenuController(menuService);

return await menuController.getCategories(request);
```

### Desde código del frontend

```typescript
import { OrdersService } from '../backend/src/services/orders.service';
import { createAuthenticatedClient } from '../backend/src/database/supabase';

const token = 'user-access-token';
const supabase = createAuthenticatedClient(token);
const ordersService = new OrdersService(supabase);

const orders = await ordersService.getOrders({ estado: ['pending'] });
```

## 🔄 Migración Gradual

Las API routes antiguas siguen funcionando, pero ahora llaman a los controllers del backend. Esto permite:

- ✅ Mantener compatibilidad total
- ✅ Migrar gradualmente otras API routes
- ✅ Preparar para backend independiente si es necesario

## 🚀 Futuro: Backend Independiente

Si en el futuro se necesita un backend completamente independiente (Express, Fastify, etc.), solo habría que:

1. Crear servidor HTTP
2. Mapear rutas a controllers
3. Mantener la misma lógica de negocio

La estructura actual ya está preparada para esto.



