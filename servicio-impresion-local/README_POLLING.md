# 🖨️ Servicio de Impresión Local con Polling Automático

## 📋 Descripción

Servicio Node.js que corre en una PC local del restaurante y:
- ✅ **Consulta la base de datos periódicamente** (polling automático)
- ✅ **Imprime comandas de cocina** cuando el estado cambia a 'preparing'
- ✅ **Imprime boletas de cliente** cuando el estado cambia a 'paid'
- ✅ **Mantiene compatibilidad HTTP** para peticiones directas desde la web

---

## 🚀 Inicio Rápido

### 1. Ejecutar Migración SQL

En Supabase SQL Editor, ejecuta:
```sql
-- Ver archivo: database/migrations/014_add_printing_tracking.sql
```

### 2. Configurar .env

**Opción A: Usar el archivo de ejemplo**
```cmd
copy env.example .env
```

Luego edita `.env` y completa los valores.

**Opción B: Usar el script automático**
```cmd
crear-env.bat
```

Luego edita `.env` y completa:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PRINTER_KITCHEN_PATH` (si es diferente a USB002)
- `PRINTER_CASHIER_PATH` (si es diferente a USB002)

**Contenido mínimo del .env:**

```env
# Supabase (REQUERIDO para polling)
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Polling
POLLING_ENABLED=true
POLLING_INTERVAL_MS=3000

# Impresoras
PRINTER_KITCHEN_TYPE=usb
PRINTER_KITCHEN_PATH=USB002
PRINTER_CASHIER_TYPE=usb
PRINTER_CASHIER_PATH=USB002

# Servidor HTTP
PRINT_SERVICE_PORT=3001
PRINT_SERVICE_TOKEN=tu-token-seguro
```

### 3. Instalar y Ejecutar

```cmd
npm install
iniciar-servicio-polling.bat
```

---

## ⚙️ Configuración

### Variables de Entorno

| Variable | Descripción | Requerido | Default |
|----------|-------------|-----------|---------|
| `SUPABASE_URL` | URL del proyecto Supabase | Sí (polling) | - |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key de Supabase | Sí (polling) | - |
| `POLLING_ENABLED` | Habilitar polling automático | No | `true` |
| `POLLING_INTERVAL_MS` | Intervalo de polling (ms) | No | `3000` |
| `PRINTER_KITCHEN_TYPE` | Tipo impresora cocina (`usb`/`network`) | No | `usb` |
| `PRINTER_KITCHEN_PATH` | Path puerto USB (ej: `USB002`, `COM3`) | Sí (si USB) | `USB002` |
| `PRINTER_CASHIER_TYPE` | Tipo impresora caja | No | `usb` |
| `PRINTER_CASHIER_PATH` | Path puerto USB caja | Sí (si USB) | `USB002` |

---

## 🔄 Cómo Funciona

### Polling Automático

1. Cada X segundos (configurado en `POLLING_INTERVAL_MS`):
   - Consulta órdenes con `estado='preparing'` y `kitchen_printed_at IS NULL`
   - Consulta órdenes con `estado='paid'` y `receipt_printed_at IS NULL`

2. Para cada orden encontrada:
   - Obtiene items y datos de mesa
   - Intenta imprimir
   - Si éxito → marca como impresa en BD
   - Si falla → NO marca (se reintentará)

### Servidor HTTP (Compatibilidad)

El servicio también escucha peticiones HTTP POST en el puerto configurado:
- La web puede enviar peticiones como antes
- Ambas formas (polling y HTTP) pueden coexistir

---

## 📊 Base de Datos

### Campos Agregados

La migración `014_add_printing_tracking.sql` agrega a `ordenes_restaurante`:

- `kitchen_printed_at` - Timestamp de impresión de comanda
- `receipt_printed_at` - Timestamp de impresión de boleta
- `kitchen_print_attempts` - Contador de intentos cocina
- `receipt_print_attempts` - Contador de intentos boleta

### Consultas de Polling

**Comandas pendientes:**
```sql
SELECT * FROM ordenes_restaurante
WHERE estado = 'preparing'
  AND kitchen_printed_at IS NULL
ORDER BY created_at ASC;
```

**Boletas pendientes:**
```sql
SELECT * FROM ordenes_restaurante
WHERE estado = 'paid'
  AND receipt_printed_at IS NULL
ORDER BY paid_at ASC;
```

---

## 🛠️ Solución de Problemas

### El Polling No Funciona

1. Verifica que `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` estén configurados
2. Verifica que `POLLING_ENABLED=true`
3. Revisa los logs del servicio
4. Verifica que la migración SQL se ejecutó correctamente

### No Imprime

1. Verifica configuración de impresora en `.env`
2. Verifica que la impresora esté conectada y encendida
3. Ejecuta `encontrar-puerto-impresora.bat` para encontrar el puerto correcto
4. Revisa logs del servicio para errores específicos

### Imprime Duplicados

- El sistema marca como impresa inmediatamente después de imprimir
- Si imprime duplicados, verifica que `kitchen_printed_at`/`receipt_printed_at` se estén actualizando
- Revisa logs para ver si hay errores al marcar como impresa

---

## 📝 Logs

El servicio muestra logs detallados:

```
🔄 Iniciando polling automático cada 3000ms
📋 Encontradas 2 orden(es) pendientes de impresión de cocina
🖨️  Procesando orden de cocina: ORD-001
✅ Orden ORD-001 impresa y marcada en BD
```

---

## 🔒 Seguridad

- El servicio usa `SUPABASE_SERVICE_ROLE_KEY` que tiene permisos completos
- Mantén el `.env` seguro y no lo subas a Git
- El token HTTP (`PRINT_SERVICE_TOKEN`) protege las peticiones HTTP

---

## 📚 Documentación Adicional

- `IMPLEMENTACION_POLLING_AUTOMATICO.md` - Documentación completa
- `ANALISIS_SERVICIO_IMPRESION.md` - Análisis del proyecto
- `database/migrations/014_add_printing_tracking.sql` - Migración SQL

