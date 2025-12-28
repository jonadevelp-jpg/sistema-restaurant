# 🧪 Guía de Prueba del Sistema de Polling

## ✅ Estado Actual

- ✅ Servicio corriendo en PM2 (modo fork/daemon)
- ✅ Configuración de Supabase en .env
- ✅ Puerto de impresora: `vport-usb:`

---

## 📋 Pasos para Probar

### Paso 1: Ejecutar Migración SQL (IMPORTANTE)

**Antes de probar, debes ejecutar la migración en Supabase:**

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Abre **SQL Editor**
3. Copia y pega el contenido de: `database/migrations/014_add_printing_tracking.sql`
4. Ejecuta el SQL

**Verifica que se ejecutó correctamente:**
```sql
SELECT column_name 
FROM information_schema.columns
WHERE table_name = 'ordenes_restaurante'
  AND column_name IN ('kitchen_printed_at', 'receipt_printed_at');
```

Deberías ver las 2 columnas.

---

### Paso 2: Verificar Configuración

**Verifica que el .env tenga:**
```env
SUPABASE_URL=https://fpgmuqtwduxbpjapurvs.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-key-aqui
POLLING_ENABLED=true
POLLING_INTERVAL_MS=3000
PRINTER_KITCHEN_TYPE=usb
PRINTER_KITCHEN_PATH=vport-usb:
```

**Reinicia el servicio para cargar nuevas variables:**
```cmd
cd servicio-impresion-local
reiniciar-servicio.bat
```

---

### Paso 3: Verificar Logs del Polling

**Abre los logs en tiempo real:**
```cmd
ver-logs.bat
```

**Deberías ver:**
```
✅ Cliente de Supabase inicializado para polling
🔄 Iniciando polling automático cada 3000ms
   - Buscará órdenes con estado 'preparing' sin kitchen_printed_at
   - Buscará órdenes con estado 'paid' sin receipt_printed_at
```

Si ves esto, el polling está funcionando ✅

---

### Paso 4: Probar con una Orden Real

#### Opción A: Desde el Celular/Web

1. **Abre la web del restaurante** (desde celular o PC)
2. **Crea una orden nueva:**
   - Agrega items al carrito
   - Completa la orden
3. **Cambia el estado a "En Preparación":**
   - Esto cambia `estado='preparing'`
4. **Espera máximo 3 segundos**
5. **Debería imprimirse automáticamente** la comanda de cocina

#### Opción B: Crear Orden Manualmente en Supabase

Si prefieres probar directamente en la BD:

1. Ve a Supabase Dashboard > Table Editor > `ordenes_restaurante`
2. Crea una orden nueva o usa una existente
3. Cambia `estado` a `'preparing'`
4. Asegúrate que `kitchen_printed_at` esté en `NULL`
5. Espera 3 segundos
6. Debería imprimirse automáticamente

---

### Paso 5: Verificar que Funcionó

#### En los Logs:
```cmd
ver-logs.bat
```

**Deberías ver:**
```
📋 Encontradas 1 orden(es) pendientes de impresión de cocina
🖨️  Procesando orden de cocina: ORD-XXX
📋 ========== INICIANDO IMPRESIÓN DE COMANDA ==========
✅ Orden ORD-XXX impresa y marcada en BD
```

#### En Supabase:

Ejecuta esta consulta:
```sql
SELECT 
  numero_orden,
  estado,
  kitchen_printed_at,
  receipt_printed_at,
  kitchen_print_attempts
FROM ordenes_restaurante
WHERE estado = 'preparing'
ORDER BY created_at DESC
LIMIT 5;
```

**Deberías ver:**
- `kitchen_printed_at` con un timestamp (no NULL)
- `kitchen_print_attempts` mayor a 0

---

### Paso 6: Probar Boleta (Opcional)

1. **Paga una orden** (cambia estado a `'paid'`)
2. **Espera 3 segundos**
3. **Debería imprimirse la boleta automáticamente**

---

## 🔍 Qué Buscar en los Logs

### ✅ Si Funciona Correctamente:

```
🔄 Iniciando polling automático cada 3000ms
📋 Encontradas X orden(es) pendientes de impresión de cocina
🖨️  Procesando orden de cocina: ORD-XXX
🔌 ========== INTENTANDO CONECTAR A IMPRESORA ==========
🔌 Tipo: usb
🔌 Path: vport-usb:
✅ Dispositivo USB creado exitosamente
📋 Contenido preparado, enviando a impresora...
✅ Comanda impresa correctamente: Orden ORD-XXX
✅ Orden ORD-XXX impresa y marcada en BD
```

### ❌ Si Hay Problemas:

**Error de conexión a impresora:**
```
❌ No se pudo conectar a la impresora USB
```
→ Verifica que `PRINTER_KITCHEN_PATH=vport-usb:` sea correcto

**Error de Supabase:**
```
❌ Error consultando órdenes de cocina: ...
```
→ Verifica `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`

**Polling no iniciado:**
```
⏸️  Polling deshabilitado (Supabase no configurado)
```
→ Verifica que las variables de Supabase estén en el .env

---

## 🚀 Resumen de Pasos

1. ✅ **Ejecutar migración SQL** en Supabase
2. ✅ **Verificar .env** tiene Supabase configurado
3. ✅ **Reiniciar servicio** para cargar variables
4. ✅ **Ver logs** para confirmar que polling inició
5. ✅ **Crear orden** desde celular/web
6. ✅ **Cambiar estado** a 'preparing'
7. ✅ **Esperar 3 segundos** y verificar que imprime
8. ✅ **Verificar en logs** y en Supabase que se marcó como impresa

---

## 📝 Notas Importantes

- El polling consulta cada **3 segundos** (configurable)
- Solo imprime órdenes con `kitchen_printed_at IS NULL` o `receipt_printed_at IS NULL`
- Si la impresión falla, **NO se marca como impresa** (se reintentará)
- El servicio funciona **24/7** mientras esté corriendo en PM2

---

## 🎯 ¿Listo para Probar?

1. Ejecuta la migración SQL
2. Reinicia el servicio
3. Crea una orden desde el celular
4. Cambia estado a "En Preparación"
5. ¡Debería imprimirse automáticamente! 🎉



