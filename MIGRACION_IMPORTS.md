# 🔄 Guía de Migración de Imports

Este documento lista los cambios de imports necesarios después de la reestructuración.

## ⚠️ IMPORTANTE

Los archivos en `src/lib/` ahora son **wrappers de compatibilidad** que re-exportan desde las nuevas ubicaciones. 
**Funcionan correctamente**, pero se recomienda migrar a los nuevos paths.

---

## 📋 Cambios de Imports

### Utilidades

#### Antes:
```typescript
import { formatCLP } from '@/lib/currency';
import { formatDate } from '@/lib/date';
```

#### Después (Recomendado):
```typescript
import { formatCLP } from '@/frontend/utils/currency';
import { formatDate } from '@/shared/utils/date';
```

#### O usar barrel exports:
```typescript
import { formatCLP } from '@/frontend/utils';
import { formatDate } from '@/shared/utils';
```

---

### Servicios Backend

#### Antes:
```typescript
import { calcCommission } from '@/lib/commission';
import { distribuirPropinas } from '@/lib/tips';
```

#### Después (Recomendado):
```typescript
import { calcCommission } from '@/backend/services/commission.service';
import { distribuirPropinas } from '@/backend/services/tips.service';
```

#### O usar barrel export:
```typescript
import { calcCommission, distribuirPropinas } from '@/backend/services';
```

---

### Componentes React

#### Antes:
```typescript
import OrdenForm from '@/react/components/OrdenForm';
import ComandaCocina from '@/react/components/ComandaCocina';
```

#### Después:
```typescript
import OrdenForm from '@/frontend/components/admin/OrdenForm';
import ComandaCocina from '@/frontend/components/admin/ComandaCocina';
```

---

### Tipos

#### Antes:
```typescript
import type { Category, MenuItem } from '@/lib/supabase';
```

#### Después (Recomendado):
```typescript
import type { Category, MenuItem } from '@/shared/types';
```

#### O usar barrel export:
```typescript
import type { Category, MenuItem } from '@/shared/types';
```

---

### Base de Datos (Queries)

#### Antes:
```typescript
import { categoriesApi, menuItemsApi } from '@/lib/supabase';
```

#### Después (Recomendado):
```typescript
import { CategoriesQueries } from '@/backend/database/categories.queries';
import { MenuItemsQueries } from '@/backend/database/menu-items.queries';

// Uso:
const queries = new CategoriesQueries(supabase);
const categories = await queries.getAll();
```

---

## ✅ Compatibilidad Actual

**TODOS los imports antiguos siguen funcionando** gracias a los archivos de compatibilidad en `src/lib/`.

No es urgente migrar, pero se recomienda hacerlo gradualmente.

---

## 🎯 Prioridad de Migración

1. **Alta**: Nuevos archivos → Usar nuevos paths directamente
2. **Media**: Archivos que se modifiquen → Migrar imports al modificar
3. **Baja**: Archivos estables → Migrar cuando haya tiempo

---

## 📝 Notas

- Los archivos en `src/lib/` están marcados con `@deprecated` pero funcionan
- TypeScript mostrará warnings de deprecación
- No hay breaking changes - todo sigue funcionando

