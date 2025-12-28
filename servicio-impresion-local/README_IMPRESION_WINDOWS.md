# 🖨️ Servicio de Impresión Local - Windows Spooler

## 📋 Descripción

Este servicio imprime automáticamente comandas de cocina y boletas de cliente usando el **Spooler de Windows**. Es compatible con impresoras térmicas POS58, INSU, BitByte y similares que Windows expone como impresoras con puertos virtuales (vport-usb).

## ✅ Características

- ✅ **Impresión por nombre de impresora** (no requiere puertos USB directos)
- ✅ **Compatible con puertos virtuales vport-usb**
- ✅ **Polling automático** desde Supabase cada 3 segundos
- ✅ **Funciona en segundo plano** (no requiere navegador abierto)
- ✅ **Manejo de errores robusto** (no marca como impreso si falla)

## 🚀 Instalación Rápida

### 1. Instalar Node.js

Si no tienes Node.js instalado:
- Descarga desde: https://nodejs.org
- Instala la versión LTS (recomendada)

### 2. Instalar Dependencias

```cmd
cd servicio-impresion-local
npm install
```

### 3. Configurar Variables de Entorno

1. Copia el archivo de ejemplo:
   ```cmd
   copy env.example .env
   ```

2. Edita `.env` con un editor de texto (Notepad):
   ```cmd
   notepad .env
   ```

3. Configura los siguientes valores:

```env
# Nombres de impresoras (OBLIGATORIO)
PRINTER_KITCHEN_NAME=POS58
PRINTER_CASHIER_NAME=POS58

# Supabase (OBLIGATORIO para polling)
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Polling (opcional, valores por defecto)
POLLING_ENABLED=true
POLLING_INTERVAL_MS=3000
```

## 🔍 Encontrar el Nombre de la Impresora

1. Ve a: **Panel de Control > Dispositivos e impresoras**
2. Busca tu impresora térmica (ej: POS58, INSU, BitByte)
3. **Copia el nombre EXACTO** que aparece
4. Pega ese nombre en `PRINTER_KITCHEN_NAME` y `PRINTER_CASHIER_NAME`

**Ejemplo:**
- Si la impresora aparece como "POS58", usa: `PRINTER_KITCHEN_NAME=POS58`
- Si aparece como "POS-58", usa: `PRINTER_KITCHEN_NAME=POS-58`
- Si aparece como "POS58 (USB)", usa: `PRINTER_KITCHEN_NAME=POS58 (USB)`

## ▶️ Iniciar el Servicio

### Opción 1: Script de Inicio (Recomendado)

```cmd
start-print-server.bat
```

### Opción 2: Manualmente

```cmd
node server.js
```

### Opción 3: Con PM2 (Para ejecutar en segundo plano)

```cmd
pm2 start server.js --name impresion-restaurante
pm2 save
```

## 🧪 Probar la Impresión

### 1. Verificar que las impresoras estén configuradas

Al iniciar el servicio, verás:
```
✅ Impresora de cocina encontrada: "POS58"
✅ Impresora de caja encontrada: "POS58"
```

Si ves `❌ Impresora NO encontrada`, verifica el nombre en Windows.

### 2. Crear una orden desde la web

1. Abre la aplicación web
2. Crea una nueva orden
3. Cambia el estado a "Preparando" (para comanda de cocina)
4. O marca como "Pagado" (para boleta)

### 3. Verificar los logs

El servicio mostrará en consola:
```
📋 Encontradas 1 orden(es) pendientes de impresión de cocina
🖨️  Procesando orden de cocina: ORD-1234567890
✅ Comanda impresa correctamente: Orden ORD-1234567890
✅ Orden ORD-1234567890 impresa y marcada en BD
```

## 📊 Variables de Entorno Completas

```env
# ============================================
# SERVIDOR HTTP (Opcional)
# ============================================
PRINT_SERVICE_PORT=3001
PRINT_SERVICE_TOKEN=tu-token-seguro

# ============================================
# IMPRESORAS (OBLIGATORIO)
# ============================================
PRINTER_KITCHEN_NAME=POS58
PRINTER_CASHIER_NAME=POS58

# ============================================
# SUPABASE (OBLIGATORIO para polling)
# ============================================
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# ============================================
# POLLING (Opcional)
# ============================================
POLLING_ENABLED=true
POLLING_INTERVAL_MS=3000
```

## 🔧 Solución de Problemas

### Error: "Impresora no encontrada"

**Solución:**
1. Verifica que la impresora esté instalada en Windows
2. Verifica que el nombre en `.env` sea EXACTAMENTE igual al de Windows
3. Ejecuta el servicio como Administrador (puede ayudar)

### Error: "Supabase no configurado"

**Solución:**
1. Verifica que `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` estén en `.env`
2. Verifica que los valores sean correctos (no valores de ejemplo)
3. Obtén los valores desde: Supabase Dashboard > Settings > API

### El servicio no imprime

**Solución:**
1. Verifica que la impresora esté encendida y conectada
2. Verifica que tenga papel
3. Prueba imprimir desde Windows (Panel de Control > Dispositivos e impresoras > Clic derecho > Propiedades de impresora > Imprimir página de prueba)
4. Revisa los logs del servicio para ver errores específicos

### El polling no funciona

**Solución:**
1. Verifica que `POLLING_ENABLED=true` en `.env`
2. Verifica que Supabase esté configurado correctamente
3. Verifica tu conexión a internet
4. Revisa los logs para ver errores de conexión

## 📝 Notas Importantes

1. **El servicio funciona independientemente del navegador** - Puedes cerrar el navegador y seguirá imprimiendo
2. **El servicio debe estar corriendo** - Si lo detienes, no se imprimirán las órdenes
3. **Usa nombres exactos de impresora** - No uses puertos (vport-usb, USB002, etc.)
4. **El servicio consulta la BD cada 3 segundos** - Puedes ajustar `POLLING_INTERVAL_MS` si es necesario

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs del servicio
2. Verifica que todas las variables de entorno estén configuradas
3. Verifica que las impresoras estén instaladas en Windows
4. Verifica que Supabase esté accesible



