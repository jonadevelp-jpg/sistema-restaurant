# 📊 Análisis del Servicio de Impresión Local

## 🔍 Estado Actual

### Estructura del Proyecto
- **Ubicación**: `servicio-impresion-local/`
- **Archivo principal**: `server.js`
- **Tipo actual**: Servidor HTTP que recibe peticiones POST
- **Dependencias**: `escpos`, `dotenv`
- **Funcionalidad**: Espera peticiones HTTP para imprimir (no tiene polling)

### Problemas Identificados
1. ❌ **NO tiene polling**: Depende de que la web envíe peticiones HTTP
2. ❌ **NO consulta la base de datos**: No busca órdenes pendientes automáticamente
3. ❌ **Falta tracking de impresión**: La BD no tiene campos para rastrear qué se imprimió
4. ⚠️ **Dependencia de red**: Si la web no puede conectarse, no imprime

---

## ✅ Plan de Mejora

### 1. Base de Datos - Campos Necesarios

**Tabla: `ordenes_restaurante`**

Agregar campos:
- `kitchen_printed_at` TIMESTAMP - Cuándo se imprimió la comanda de cocina
- `receipt_printed_at` TIMESTAMP - Cuándo se imprimió la boleta
- `kitchen_print_attempts` INTEGER DEFAULT 0 - Intentos de impresión de cocina
- `receipt_print_attempts` INTEGER DEFAULT 0 - Intentos de impresión de boleta

**Lógica de detección:**
- Comanda de cocina: `estado = 'preparing'` AND `kitchen_printed_at IS NULL`
- Boleta: `estado = 'paid'` AND `receipt_printed_at IS NULL`

---

### 2. Sistema de Polling

**Características:**
- Intervalo configurable (default: 3000ms)
- Consulta Supabase cada X segundos
- Busca órdenes pendientes de impresión
- Evita duplicados (marca como impresa solo si imprime exitosamente)
- Manejo robusto de errores

---

### 3. Módulo de Impresión

**Estado actual:** ✅ Ya existe y funciona bien
- Soporta USB y Network
- Formatea comandas y boletas correctamente
- Maneja errores

**Mejoras necesarias:**
- Integrar con polling
- Agregar retry logic
- Mejor logging

---

### 4. Variables de Entorno

**Agregar:**
```env
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx

# Polling
POLLING_INTERVAL_MS=3000
POLLING_ENABLED=true

# Impresoras (ya existen)
PRINTER_KITCHEN_TYPE=usb
PRINTER_KITCHEN_PATH=USB002
PRINTER_CASHIER_TYPE=usb
PRINTER_CASHIER_PATH=USB002
```

---

### 5. Arquitectura Híbrida

**Mantener ambas funcionalidades:**
- ✅ Servidor HTTP (para compatibilidad)
- ✅ Polling automático (nuevo)

**Ventajas:**
- Si la web puede conectarse → imprime inmediatamente
- Si no puede → el polling lo detecta y imprime
- Redundancia y robustez

---

## 📋 Implementación

### Fase 1: Migración de BD
- Crear migración SQL para agregar campos
- Ejecutar en Supabase

### Fase 2: Código de Polling
- Agregar @supabase/supabase-js
- Implementar función de polling
- Integrar con impresión existente

### Fase 3: Variables de Entorno
- Actualizar .env.example
- Documentar configuración

### Fase 4: Scripts y Documentación
- Actualizar .bat de inicio
- Documentar uso

---

## 🎯 Resultado Final

Un servicio que:
- ✅ Consulta la BD cada 3 segundos
- ✅ Detecta órdenes pendientes automáticamente
- ✅ Imprime sin intervención manual
- ✅ Marca como impreso solo si tiene éxito
- ✅ Mantiene compatibilidad con HTTP
- ✅ Funciona 24/7 sin supervisión



