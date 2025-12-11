# 🎉 Sistema de Administración Completo

## ✅ Funcionalidades Implementadas

### 1. **Dashboard Administrativo** (`/admin/dashboard`)
- KPIs en tiempo real:
  - Ventas de hoy
  - Órdenes pendientes
  - Mesas ocupadas
  - Gastos del mes
- Accesos rápidos a todas las secciones
- Vista de órdenes recientes

### 2. **Mesas (POS)** (`/admin/mesas`)
- Vista de todas las mesas con estado (libre/ocupada)
- Crear nueva orden por mesa
- Ver total de orden activa en cada mesa
- Navegación directa a orden activa

### 3. **Gestión de Órdenes** (`/admin/ordenes/[id]`)
- Agregar items del menú a la orden
- Ajustar cantidades de items
- Eliminar items
- Cambiar estado de orden (pending → preparing → ready)
- Pagar orden y liberar mesa
- Resumen en tiempo real del total

### 4. **Gestión de Stock** (`/admin/stock`)
- Ver todos los ingredientes con stock actual
- Indicadores de estado (OK/Bajo/Sin Stock)
- Editar información de ingredientes
- **Ajustar stock:**
  - Entrada (+)
  - Salida (-)
  - Ajuste directo (=)
- Registro automático de movimientos

### 5. **Gestión de Ingredientes** (`/admin/ingredientes`)
- Crear nuevos ingredientes
- Editar ingredientes existentes
- Asignar proveedores
- Configurar stock mínimo
- Precio unitario

## 🗂️ Estructura de Archivos

```
app-final/
├── src/
│   ├── pages/
│   │   └── admin/
│   │       ├── dashboard.astro
│   │       ├── mesas.astro
│   │       ├── stock.astro
│   │       ├── ingredientes.astro
│   │       └── ordenes/
│   │           └── [id].astro
│   ├── react/
│   │   ├── components/
│   │   │   ├── Sidebar.tsx          # Navegación lateral
│   │   │   ├── MesasView.tsx        # Vista de mesas
│   │   │   ├── OrdenForm.tsx        # Formulario de orden
│   │   │   ├── StockView.tsx        # Gestión de stock
│   │   │   └── IngredientesView.tsx # Gestión de ingredientes
│   │   └── Dashboard.tsx            # Dashboard principal
│   └── layouts/
│       └── AdminLayout.astro        # Layout con sidebar
└── database/
    └── migrations/
        ├── 008_fix_ordenes_permissions.sql
        ├── 009_fix_ingredientes_permissions.sql
        └── 010_fix_movimientos_permissions.sql
```

## 🚀 Cómo Usar

### Paso 1: Aplicar Permisos RLS

**IMPORTANTE:** Antes de usar el sistema, aplica las migraciones de permisos:

1. Abre Supabase Dashboard → SQL Editor
2. Ejecuta en orden:
   - `008_fix_ordenes_permissions.sql`
   - `009_fix_ingredientes_permissions.sql`
   - `010_fix_movimientos_permissions.sql`

Ver instrucciones detalladas en: `INSTRUCCIONES_PERMISOS.md`

### Paso 2: Iniciar Sesión

1. Ve a `/admin/login`
2. Inicia sesión con tu usuario (debe estar en la tabla `users`)

### Paso 3: Crear una Orden

1. Ve a `/admin/mesas`
2. Haz clic en una mesa libre
3. Confirma crear orden
4. Agrega items del menú
5. Cambia el estado según avance
6. Paga la orden cuando esté lista

### Paso 4: Gestionar Stock

1. Ve a `/admin/stock`
2. Busca el ingrediente
3. Haz clic en "Ajustar"
4. Selecciona tipo de ajuste (entrada/salida/ajuste)
5. Ingresa cantidad y motivo
6. Guarda

## 🔐 Permisos por Rol

### Admin
- ✅ Acceso completo a todas las funcionalidades
- ✅ Crear/editar/eliminar ingredientes
- ✅ Ajustar stock
- ✅ Ver todas las órdenes
- ✅ Eliminar órdenes

### Encargado
- ✅ Crear órdenes
- ✅ Gestionar stock
- ✅ Crear/editar ingredientes
- ✅ Ver todas las órdenes
- ❌ No puede eliminar órdenes

### Mesero
- ✅ Crear órdenes
- ✅ Agregar items a sus órdenes
- ✅ Ver sus propias órdenes
- ✅ Ver stock (solo lectura)
- ❌ No puede ajustar stock
- ❌ No puede crear ingredientes

## 📊 Flujo de Trabajo Típico

### Escenario: Atender una Mesa

1. **Mesero llega a la mesa:**
   - Va a `/admin/mesas`
   - Clic en mesa libre → Crear orden

2. **Tomar pedido:**
   - Agrega items del menú
   - Ajusta cantidades si es necesario
   - Guarda la orden

3. **Cocina prepara:**
   - Encargado/Admin cambia estado a "En Preparación"
   - Cuando está lista, cambia a "Lista"

4. **Servir y cobrar:**
   - Mesero sirve los platos
   - Clic en "Pagar"
   - Selecciona método de pago
   - Mesa se libera automáticamente

### Escenario: Ajustar Stock

1. **Detectar falta de stock:**
   - Ve a `/admin/stock`
   - Busca ingrediente con stock bajo

2. **Ajustar:**
   - Clic en "Ajustar"
   - Selecciona tipo (entrada si llegó mercadería)
   - Ingresa cantidad
   - Guarda

3. **Verificar:**
   - El stock se actualiza automáticamente
   - Se registra el movimiento en `movimientos_stock`

## 🐛 Solución de Problemas

### "No puedo crear órdenes"
- ✅ Verifica que aplicaste `008_fix_ordenes_permissions.sql`
- ✅ Verifica que tu usuario esté en la tabla `users` con rol correcto

### "No puedo ajustar stock"
- ✅ Verifica que aplicaste `009_fix_ingredientes_permissions.sql` y `010_fix_movimientos_permissions.sql`
- ✅ Verifica que tu rol sea 'admin' o 'encargado'

### "Las imágenes no se ven"
- ✅ Verifica que las imágenes estén en `app-final/public/`
- ✅ Verifica las rutas en la BD (deben empezar con `/`)
- ✅ Ver guía: `SOLUCION_IMAGENES.md`

## 📝 Próximas Mejoras (Opcional)

- [ ] Filtro de categorías en formulario de orden
- [ ] Notas por item en la orden
- [ ] Historial de movimientos de stock
- [ ] Reportes de ventas
- [ ] Impresión de tickets
- [ ] Notificaciones en tiempo real

---

**¡El sistema está listo para usar!** 🎊


