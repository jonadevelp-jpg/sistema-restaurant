# 🖨️ Implementación de Polling Automático para Impresión

## ✅ Cambios Implementados

### 1. Base de Datos - Migración SQL

**Archivo:** `database/migrations/014_add_printing_tracking.sql`

**Campos agregados a `ordenes_restaurante`:**
- `kitchen_printed_at` - Timestamp cuando se imprimió la comanda
- `receipt_printed_at` - Timestamp cuando se imprimió la boleta
- `kitchen_print_attempts` - Contador de intentos de impresión de cocina
- `receipt_print_attempts` - Contador de intentos de impresión de boleta

**Índices creados:**
- `idx_ordenes_kitchen_print` - Para consultas rápidas de órdenes pendientes de cocina
- `idx_ordenes_receipt_print` - Para consultas rápidas de órdenes pendientes de boleta

**Ejecutar en Supabase:**
1. Ve a SQL Editor
2. Copia y pega el contenido de `014_add_printing_tracking.sql`
3. Ejecuta

---

### 2. Código del Servicio - Polling Automático

**Archivo:** `servicio-impresion-local/server.js`

**Funcionalidades agregadas:**
- ✅ Consulta Supabase cada X segundos (configurable)
- ✅ Detecta órdenes con `estado='preparing'` y `kitchen_printed_at IS NULL`
- ✅ Detecta órdenes con `estado='paid'` y `receipt_printed_at IS NULL`
- ✅ Imprime automáticamente sin intervención manual
- ✅ Marca como impresa solo si la impresión fue exitosa
- ✅ Mantiene compatibilidad con servidor HTTP existente
- ✅ Manejo robusto de errores

**Funciones nuevas:**
- `pollForPendingOrders()` - Función principal de polling
- `getOrdenItems()` - Obtiene items de una orden
- `getMesaInfo()` - Obtiene información de mesa
- `markOrderAsPrinted()` - Marca orden como impresa en BD
- `incrementPrintAttempts()` - Incrementa contador de intentos
- `startPolling()` - Inicia el polling
- `stopPolling()` - Detiene el polling

---

### 3. Dependencias

**Archivo:** `servicio-impresion-local/package.json`

**Agregado:**
- `@supabase/supabase-js` - Cliente de Supabase

**Instalar:**
```bash
cd servicio-impresion-local
npm install
```

---

### 4. Variables de Entorno

**Archivo:** `servicio-impresion-local/.env.example`

**Nuevas variables:**
```env
# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Polling
POLLING_ENABLED=true
POLLING_INTERVAL_MS=3000
```

**Variables existentes (mantenidas):**
- `PRINT_SERVICE_PORT` - Puerto del servidor HTTP
- `PRINT_SERVICE_TOKEN` - Token de seguridad
- `PRINTER_KITCHEN_*` - Configuración impresora cocina
- `PRINTER_CASHIER_*` - Configuración impresora caja

---

### 5. Scripts de Inicio

**Archivo:** `servicio-impresion-local/iniciar-servicio-polling.bat`

**Funcionalidades:**
- Verifica que existe `.env`
- Verifica dependencias instaladas
- Verifica configuración de Supabase
- Inicia el servicio con polling

---

## 🚀 Cómo Usar

### Paso 1: Ejecutar Migración SQL

1. Ve a Supabase Dashboard
2. Abre SQL Editor
3. Ejecuta `database/migrations/014_add_printing_tracking.sql`

### Paso 2: Configurar .env

**Opción A: Usar el archivo de ejemplo**
```cmd
copy env.example .env
```

**Opción B: Usar el script automático**
```cmd
crear-env.bat
```

Luego edita `.env` y completa los valores necesarios.

2. Edita `.env` y completa:
   - `SUPABASE_URL` - URL de tu proyecto
   - `SUPABASE_SERVICE_ROLE_KEY` - Service role key
   - `POLLING_INTERVAL_MS` - Intervalo deseado (default: 3000ms)
   - Configuración de impresoras

### Paso 3: Instalar Dependencias

```cmd
cd servicio-impresion-local
npm install
```

### Paso 4: Iniciar Servicio

```cmd
iniciar-servicio-polling.bat
```

O manualmente:
```cmd
node server.js
```

---

## 🔄 Cómo Funciona

### Flujo de Polling

1. **Cada X segundos** (configurado en `POLLING_INTERVAL_MS`):
   - Consulta órdenes con `estado='preparing'` y `kitchen_printed_at IS NULL`
   - Consulta órdenes con `estado='paid'` y `receipt_printed_at IS NULL`

2. **Para cada orden encontrada:**
   - Obtiene items y datos de mesa
   - Intenta imprimir
   - Si imprime exitosamente → marca `kitchen_printed_at` o `receipt_printed_at`
   - Si falla → NO marca como impresa (se reintentará en el siguiente ciclo)

3. **Evita duplicados:**
   - Solo procesa órdenes con `printed_at IS NULL`
   - Marca como impresa inmediatamente después de imprimir exitosamente

### Compatibilidad HTTP

El servidor HTTP sigue funcionando:
- La web puede enviar peticiones POST como antes
- Si la web imprime vía HTTP, el polling detectará que ya está impresa (por el timestamp)
- Ambos sistemas pueden coexistir

---

## ⚙️ Configuración Avanzada

### Deshabilitar Polling

Si solo quieres usar HTTP:
```env
POLLING_ENABLED=false
```

### Cambiar Intervalo

Para consultar cada 5 segundos:
```env
POLLING_INTERVAL_MS=5000
```

Para consultar cada 1 segundo (más carga en BD):
```env
POLLING_INTERVAL_MS=1000
```

---

## 🔍 Verificación

### Verificar que el Polling Funciona

1. **Revisa los logs:**
   ```
   🔄 Iniciando polling automático cada 3000ms
   📋 Encontradas X orden(es) pendientes de impresión de cocina
   ✅ Orden XXX impresa y marcada en BD
   ```

2. **Verifica en Supabase:**
   ```sql
   SELECT 
     numero_orden, 
     estado, 
     kitchen_printed_at, 
     receipt_printed_at
   FROM ordenes_restaurante
   WHERE estado IN ('preparing', 'paid')
   ORDER BY created_at DESC
   LIMIT 10;
   ```

3. **Prueba manual:**
   - Crea una orden en la web
   - Cambia estado a 'preparing'
   - Espera máximo 3 segundos (o el intervalo configurado)
   - Debería imprimirse automáticamente

---

## 🛡️ Manejo de Errores

### Si la Impresión Falla

- ❌ NO se marca como impresa
- ✅ Se incrementa el contador de intentos
- ✅ Se reintentará en el siguiente ciclo de polling
- ✅ Se registra el error en logs

### Si Supabase No Responde

- ⚠️ Se registra el error
- ✅ El servicio continúa funcionando
- ✅ Se reintentará en el siguiente ciclo

### Si la Impresora No Está Disponible

- ❌ NO se marca como impresa
- ✅ Se registra el error
- ✅ Se reintentará cuando la impresora esté disponible

---

## 📊 Ventajas del Sistema

1. ✅ **Automático**: No requiere intervención manual
2. ✅ **Robusto**: Maneja errores sin crashear
3. ✅ **Eficiente**: Solo consulta órdenes pendientes
4. ✅ **Sin duplicados**: Marca como impresa inmediatamente
5. ✅ **Compatible**: Mantiene servidor HTTP funcionando
6. ✅ **Configurable**: Intervalo ajustable según necesidades

---

## 🎯 Resultado Final

Un servicio que:
- ✅ Consulta la BD cada 3 segundos (configurable)
- ✅ Detecta órdenes pendientes automáticamente
- ✅ Imprime sin intervención manual
- ✅ Marca como impreso solo si tiene éxito
- ✅ Funciona 24/7 sin supervisión
- ✅ Mantiene compatibilidad con HTTP

---

## 📝 Próximos Pasos Recomendados

1. **Ejecutar migración SQL** en Supabase
2. **Configurar .env** con credenciales de Supabase
3. **Instalar dependencias**: `npm install`
4. **Iniciar servicio**: `iniciar-servicio-polling.bat`
5. **Probar**: Crear una orden y cambiar estado a 'preparing'
6. **Verificar logs**: Confirmar que imprime automáticamente

---

## ⚠️ Notas Importantes

- El servicio necesita `SUPABASE_SERVICE_ROLE_KEY` (no `ANON_KEY`)
- La service_role key tiene permisos completos, mantenerla segura
- El polling consulta la BD frecuentemente, considerar carga en Supabase
- Si hay muchas órdenes, el polling procesa máximo 10 por ciclo (evita sobrecarga)

