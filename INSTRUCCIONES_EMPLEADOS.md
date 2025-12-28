# Instrucciones: Sistema de Empleados y Propinas

## 📋 Resumen

Este sistema permite gestionar empleados del restaurante, asignar sueldos, habilitar propinas y distribuir automáticamente las propinas entre empleados elegibles.

## 🚀 Pasos de Instalación

### Paso 1: Aplicar Migración de Base de Datos

1. Abre Supabase Dashboard → SQL Editor
2. Ejecuta la migración `012_create_empleados.sql`:
   - Copia el contenido del archivo `database/migrations/012_create_empleados.sql`
   - Pégalo en el SQL Editor de Supabase
   - Ejecuta la migración

Esta migración crea:
- Tabla `empleados` con campos: nombre, función, sueldo, propina_habilitada, user_id, activo
- Campo `propina_calculada` en `ordenes_restaurante`
- Tabla `propinas_distribucion` para rastrear distribución de propinas

### Paso 2: Crear Usuarios Meseros

1. Ve a `/admin/empleados`
2. Haz clic en "Nuevo Empleado"
3. Completa el formulario:
   - **Nombre**: Nombre del empleado
   - **Función**: Selecciona entre mesero, cocina, delivery, cajero u otro
   - **Sueldo**: Sueldo mensual en CLP
   - **Habilitar propina**: Marca si el empleado debe recibir propinas
   - **Usuario del Sistema** (opcional): Asocia con un usuario existente para permisos de acceso
   - **Activo**: Estado del empleado

### Paso 3: Crear Usuario del Sistema para Mesero (Opcional)

Si quieres que el mesero tenga acceso al sistema:

1. Crea un usuario en Supabase Auth (o desde tu panel de administración)
2. Crea un registro en la tabla `users` con:
   - `id`: UUID del usuario de Auth
   - `role`: 'mesero'
   - `name`: Nombre del mesero
   - `email`: Email del mesero
3. En `/admin/empleados`, edita el empleado y asigna el usuario del sistema

## 💡 Funcionalidades

### Gestión de Empleados

- **Crear empleados**: Define nombre, función, sueldo y si aplica propina
- **Editar empleados**: Modifica cualquier campo del empleado
- **Activar/Desactivar**: Controla si el empleado está activo
- **Asignar usuario**: Relaciona empleado con usuario del sistema para permisos

### Sistema de Propinas

1. **Cálculo automático**: Cuando se cierra una mesa con propina (10% del total), el sistema:
   - Calcula el 10% del total de la orden
   - Guarda en `propina_calculada` de la orden
   - Distribuye equitativamente entre todos los empleados con `propina_habilitada = true`

2. **Distribución equitativa**: Si hay 3 empleados con propina habilitada y $30,000 en propinas:
   - Cada empleado recibe: $30,000 / 3 = $10,000

3. **Rastreo por período**: Las propinas se rastrean por:
   - Semana
   - Quincena
   - Mes

### Dashboard de Propinas

En el Dashboard (`/admin/dashboard`), puedes ver:
- **Total de propinas** del período seleccionado (semana/quincena/mes)
- **Distribución por empleado**: Cuánto le corresponde a cada empleado

### Permisos de Mesero

Los usuarios con rol `mesero` pueden:
- ✅ Acceder a Dashboard (vista limitada)
- ✅ Ver y gestionar Mesas (POS)
- ✅ Crear órdenes
- ✅ Ver sus propias órdenes
- ✅ Imprimir comandas de cocina
- ✅ Imprimir boletas de cliente
- ✅ Imprimir boletas para el local
- ❌ NO pueden acceder a:
  - Gestión del Menú
  - Gestión de Stock
  - Ingredientes
  - Recetas
  - Compras
  - Empleados
  - Menú Imprimible

## 📊 Ejemplo de Uso

### Escenario: Cerrar mesa con propina

1. Mesero crea orden en Mesa 5
2. Agrega items por un total de $50,000
3. Al pagar, selecciona "Incluir propina del 10%"
4. El sistema:
   - Calcula propina: $50,000 × 10% = $5,000
   - Total final: $55,000
   - Si hay 2 empleados con propina habilitada:
     - Empleado 1: $2,500
     - Empleado 2: $2,500

### Ver propinas en Dashboard

1. Ve a `/admin/dashboard`
2. En la sección "Propinas", selecciona el período (Semana/Quincena/Mes)
3. Verás:
   - Total de propinas del período
   - Lista de empleados con sus montos correspondientes

## 🔧 Mantenimiento

### Agregar nuevo empleado con propina

1. Ve a `/admin/empleados`
2. Crea nuevo empleado
3. Marca "Habilitar propina"
4. El empleado comenzará a recibir propinas en las próximas órdenes pagadas

### Desactivar propina para un empleado

1. Edita el empleado en `/admin/empleados`
2. Desmarca "Habilitar propina"
3. El empleado dejará de recibir propinas en nuevas órdenes
4. Las propinas ya distribuidas no se modifican

## ⚠️ Notas Importantes

- Las propinas se distribuyen **equitativamente** entre todos los empleados activos con propina habilitada
- La distribución es automática al cerrar una orden con propina
- Los períodos (semana/quincena/mes) se calculan automáticamente según la fecha de pago
- Un empleado puede estar inactivo pero seguir recibiendo propinas de órdenes ya pagadas (no se revierten distribuciones)

## 🐛 Solución de Problemas

### Las propinas no se están distribuyendo

1. Verifica que haya al menos un empleado con `propina_habilitada = true` y `activo = true`
2. Verifica que la orden tenga `propina_calculada > 0`
3. Revisa la consola del navegador para errores

### No veo propinas en el Dashboard

1. Verifica que haya órdenes pagadas con propina en el período seleccionado
2. Verifica que haya empleados con propina habilitada
3. Intenta cambiar el período (semana/quincena/mes)

### El mesero no puede acceder a mesas

1. Verifica que el usuario tenga `role = 'mesero'` en la tabla `users`
2. Verifica que el usuario esté autenticado correctamente
3. Verifica las políticas RLS en Supabase







