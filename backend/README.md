# 🚀 Backend - Sistema POS Restaurante

## 📁 Estructura

```
backend/
├── src/
│   ├── database/        # Cliente Supabase
│   ├── services/       # Lógica de negocio
│   ├── controllers/     # Lógica HTTP
│   ├── helpers/         # Utilidades
│   └── @types/          # Tipos TypeScript
```

## 🎯 Arquitectura

### Services (Lógica de Negocio)
- `MenuService`: Gestión de categorías e items del menú
- `OrdersService`: Gestión de órdenes y items de órdenes

### Controllers (Lógica HTTP)
- `MenuController`: Endpoints de menú
- `OrdersController`: Endpoints de órdenes

### Database
- `supabase.ts`: Cliente centralizado de Supabase
  - `supabase`: Cliente público (anon key)
  - `supabaseAdmin`: Cliente con service role
  - `createAuthenticatedClient()`: Cliente con token de usuario

## 🔧 Uso

### Desde API Routes de Astro

```typescript
import { MenuController } from '../../../backend/src/controllers/menu.controller';
import { MenuService } from '../../../backend/src/services/menu.service';
import { supabase } from '../../../backend/src/database/supabase';

// Crear servicio y controller
const menuService = new MenuService(supabase);
const menuController = new MenuController(menuService);

// Usar el controller
return await menuController.getCategories(request);
```

### Desde código del frontend

```typescript
import { OrdersService } from '../backend/src/services/orders.service';
import { createAuthenticatedClient } from '../backend/src/database/supabase';

const token = 'user-access-token';
const supabase = createAuthenticatedClient(token);
const ordersService = new OrdersService(supabase);

const orders = await ordersService.getOrders({ estado: ['pending', 'preparing'] });
```

## 📝 Variables de Entorno

El backend usa las mismas variables de entorno que el frontend:

```env
SUPABASE_URL=tu-url
SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key (opcional)
```

## 🔄 Migración desde API Routes Antiguas

Las API routes de Astro ahora usan los controllers del backend, manteniendo compatibilidad total con el código existente.

## 🚀 Futuro: Backend Independiente

Esta estructura está preparada para convertirse en un backend independiente (Express, Fastify, etc.) si es necesario. Solo habría que:

1. Crear un servidor HTTP (Express)
2. Mapear las rutas a los controllers
3. Mantener la misma lógica de negocio

