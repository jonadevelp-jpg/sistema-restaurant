/**
 * Servicio Local de Impresión con Polling Automático
 * 
 * Este servicio corre en una PC local del restaurante y se encarga de:
 * 1. Consultar la base de datos periódicamente para detectar órdenes pendientes
 * 2. Imprimir automáticamente comandas de cocina y boletas usando Windows Spooler
 * 3. Marcar órdenes como impresas en la base de datos
 * 
 * Compatible con impresoras térmicas POS58 / INSU / BitByte conectadas por USB
 * que Windows expone como impresoras con puertos virtuales (vport-usb).
 */

// Cargar variables de entorno
const fs = require('fs');
const path = require('path');
const http = require('http');
const { createClient } = require('@supabase/supabase-js');
const { listPrinters, printerExists, ESCPOSFormatter, printRaw } = require('./printer-module');
const {
  formatReceiptHeader,
  formatKitchenHeader,
  formatOrderInfo,
  formatKitchenItems,
  formatReceiptItems,
  formatReceiptTotals,
  formatPaymentInfo,
  formatReceiptFooter,
  formatKitchenFooter,
  formatGeneralNote
} = require('./print-formatters');

// Cargar .env manualmente (más robusto que dotenv)
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    let loadedCount = 0;
    envContent.split(/\r?\n/).forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#') && trimmedLine.includes('=')) {
        const equalIndex = trimmedLine.indexOf('=');
        if (equalIndex > 0) {
          const key = trimmedLine.substring(0, equalIndex).trim();
          const value = trimmedLine.substring(equalIndex + 1).trim();
          const cleanValue = value.replace(/^["']|["']$/g, '');
          if (key && cleanValue) {
            process.env[key] = cleanValue;
            loadedCount++;
          }
        }
      }
    });
    if (loadedCount > 0) {
      console.log(`✅ Archivo .env cargado (${loadedCount} variables)`);
    }
  } catch (error) {
    console.error('❌ Error cargando .env:', error.message);
  }
} else {
  console.error(`❌ Archivo .env no encontrado en: ${envPath}`);
}

// ============================================
// CONFIGURACIÓN DESDE VARIABLES DE ENTORNO
// ============================================

const PORT = process.env.PRINT_SERVICE_PORT || 3001;
const PRINTER_KITCHEN_NAME = process.env.PRINTER_KITCHEN_NAME;
const PRINTER_CASHIER_NAME = process.env.PRINTER_CASHIER_NAME;

// Configuración de Polling y Supabase
const POLLING_ENABLED = process.env.POLLING_ENABLED !== 'false';
const POLLING_INTERVAL_MS = parseInt(process.env.POLLING_INTERVAL_MS || '3000');
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Token de seguridad (opcional)
const API_TOKEN = process.env.PRINT_SERVICE_TOKEN || 'cambiar-este-token';

// ============================================
// VERIFICACIÓN DE CONFIGURACIÓN
// ============================================

console.log('========================================');
console.log('  SERVICIO DE IMPRESIÓN LOCAL');
console.log('========================================\n');

console.log('📋 Verificando configuración...\n');

// Verificar impresoras (async)
(async () => {
  console.log('🖨️  Impresoras configuradas:');
  console.log(`   Cocina: ${PRINTER_KITCHEN_NAME || '❌ NO CONFIGURADA'}`);
  console.log(`   Caja: ${PRINTER_CASHIER_NAME || '❌ NO CONFIGURADA'}\n`);

  if (PRINTER_KITCHEN_NAME) {
    const exists = await printerExists(PRINTER_KITCHEN_NAME);
    if (exists) {
      console.log(`✅ Impresora de cocina encontrada: "${PRINTER_KITCHEN_NAME}"`);
    } else {
      console.error(`❌ Impresora de cocina NO encontrada: "${PRINTER_KITCHEN_NAME}"`);
      console.error('   Verifica el nombre en: Panel de Control > Dispositivos e impresoras');
    }
  }

  if (PRINTER_CASHIER_NAME) {
    const exists = await printerExists(PRINTER_CASHIER_NAME);
    if (exists) {
      console.log(`✅ Impresora de caja encontrada: "${PRINTER_CASHIER_NAME}"`);
    } else {
      console.error(`❌ Impresora de caja NO encontrada: "${PRINTER_CASHIER_NAME}"`);
      console.error('   Verifica el nombre en: Panel de Control > Dispositivos e impresoras');
    }
  }

  // Listar todas las impresoras disponibles (para referencia)
  console.log('\n📋 Impresoras disponibles en el sistema:');
  const availablePrinters = await listPrinters();
  if (availablePrinters.length > 0) {
    availablePrinters.forEach(p => {
      const marker = (p.name === PRINTER_KITCHEN_NAME || p.name === PRINTER_CASHIER_NAME) ? ' ← CONFIGURADA' : '';
      console.log(`   - ${p.name}${marker}`);
    });
  } else {
    console.log('   ⚠️  No se encontraron impresoras');
  }
  
  console.log('');
})();

// Verificar Supabase
console.log('\n🔍 Verificando Supabase...');
console.log(`   SUPABASE_URL: ${SUPABASE_URL ? SUPABASE_URL.substring(0, 30) + '...' : '❌ NO CONFIGURADO'}`);
console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY ? SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...' : '❌ NO CONFIGURADO'}`);

// Inicializar cliente de Supabase
let supabase = null;
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  try {
    if (!SUPABASE_URL.startsWith('http://') && !SUPABASE_URL.startsWith('https://')) {
      throw new Error('URL de Supabase inválida');
    }
    
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    console.log('✅ Cliente de Supabase creado');
  } catch (error) {
    console.error('❌ Error creando cliente de Supabase:', error.message);
  }
} else {
  console.warn('⚠️  Supabase no configurado. El polling no funcionará.');
}

// Verificar polling
console.log('\n🔄 Configuración de Polling:');
console.log(`   Habilitado: ${POLLING_ENABLED ? '✅ Sí' : '❌ No'}`);
console.log(`   Intervalo: ${POLLING_INTERVAL_MS}ms (${POLLING_INTERVAL_MS / 1000}s)`);

console.log('\n========================================\n');

// ============================================
// FUNCIONES AUXILIARES DE BASE DE DATOS
// ============================================

async function getOrdenItems(ordenId) {
  if (!supabase) return [];
  
  try {
    const { data, error } = await supabase
      .from('orden_items')
      .select(`
        id,
        cantidad,
        precio_unitario,
        subtotal,
        notas,
        menu_item:menu_items (
          id,
          name,
          category_id
        )
      `)
      .eq('orden_id', ordenId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error(`❌ Error obteniendo items de orden ${ordenId}:`, error.message);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error(`❌ Error en getOrdenItems:`, error.message);
    return [];
  }
}

async function getMesaInfo(mesaId) {
  if (!supabase || !mesaId) return null;
  
  try {
    const { data, error } = await supabase
      .from('mesas')
      .select('id, numero, nombre')
      .eq('id', mesaId)
      .single();
    
    if (error || !data) return null;
    return data;
  } catch (error) {
    return null;
  }
}

async function markOrderAsPrinted(ordenId, type) {
  if (!supabase) return false;
  
  try {
    const updateData = type === 'kitchen'
      ? { kitchen_printed_at: new Date().toISOString() }
      : { receipt_printed_at: new Date().toISOString() };
    
    const { error } = await supabase
      .from('ordenes_restaurante')
      .update(updateData)
      .eq('id', ordenId);
    
    if (error) {
      console.error(`❌ Error marcando orden como impresa:`, error.message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Error en markOrderAsPrinted:`, error.message);
    return false;
  }
}

async function incrementPrintAttempts(ordenId, type) {
  if (!supabase) return;
  
  try {
    const column = type === 'kitchen' ? 'kitchen_print_attempts' : 'receipt_print_attempts';
    const { error } = await supabase.rpc('increment', {
      table_name: 'ordenes_restaurante',
      column_name: column,
      row_id: ordenId
    });
    
    // Si la función RPC no existe, intentar update directo
    if (error) {
      const { data } = await supabase
        .from('ordenes_restaurante')
        .select(column)
        .eq('id', ordenId)
        .single();
      
      if (data) {
        const currentValue = data[column] || 0;
        await supabase
          .from('ordenes_restaurante')
          .update({ [column]: currentValue + 1 })
          .eq('id', ordenId);
      }
    }
  } catch (error) {
    // No crítico, solo logging
    console.warn(`⚠️  No se pudo incrementar intentos de impresión:`, error.message);
  }
}

// ============================================
// FUNCIONES DE IMPRESIÓN
// ============================================

async function printKitchenCommand(data) {
  // Aceptar tanto { orden, items } como { orden: {...}, items: [...] }
  const orden = data.orden || data;
  const items = data.items || [];
  
  if (!PRINTER_KITCHEN_NAME) {
    throw new Error('PRINTER_KITCHEN_NAME no configurado en .env');
  }
  
  const exists = await printerExists(PRINTER_KITCHEN_NAME);
  if (!exists) {
    throw new Error(`Impresora "${PRINTER_KITCHEN_NAME}" no encontrada en el sistema`);
  }
  
  console.log(`📋 ========== IMPRIMIENDO COMANDA ==========`);
  console.log(`📋 Orden: ${orden.numero_orden}`);
  console.log(`📋 Impresora: ${PRINTER_KITCHEN_NAME}`);
  
  try {
    const formatter = new ESCPOSFormatter();
    
    // Inicializar impresora
    formatter.init();
    
    // Encabezado
    formatKitchenHeader(formatter);
    
    // Información de orden
    formatOrderInfo(formatter, orden);
    
    // Items
    formatKitchenItems(formatter, items);
    
    // Nota general
    formatGeneralNote(formatter, orden.nota);
    
    // Pie (con propina destacada)
    formatKitchenFooter(formatter, items, orden);
    
    // Imprimir
    const printData = formatter.getBuffer();
    await printRaw(PRINTER_KITCHEN_NAME, printData);
    
    console.log(`✅ Comanda impresa correctamente: Orden ${orden.numero_orden}`);
    return { success: true, message: 'Comanda impresa correctamente' };
  } catch (error) {
    console.error('❌ Error imprimiendo comanda:', error.message);
    throw error;
  }
}

async function printCustomerReceipt(data) {
  // Aceptar tanto { orden, items } como { orden: {...}, items: [...] }
  const orden = data.orden || data;
  const items = data.items || [];
  
  if (!PRINTER_CASHIER_NAME) {
    throw new Error('PRINTER_CASHIER_NAME no configurado en .env');
  }
  
  const exists = await printerExists(PRINTER_CASHIER_NAME);
  if (!exists) {
    throw new Error(`Impresora "${PRINTER_CASHIER_NAME}" no encontrada en el sistema`);
  }
  
  console.log(`🧾 ========== IMPRIMIENDO BOLETA ==========`);
  console.log(`🧾 Orden: ${orden.numero_orden}`);
  console.log(`🧾 Impresora: ${PRINTER_CASHIER_NAME}`);
  
  try {
    const formatter = new ESCPOSFormatter();
    
    // Inicializar impresora
    formatter.init();
    
    // Encabezado del local
    formatReceiptHeader(formatter);
    
    // Información de orden
    formatOrderInfo(formatter, orden);
    
    // Items con precios
    formatReceiptItems(formatter, items);
    
    // Totales (con propina destacada)
    formatReceiptTotals(formatter, items, orden);
    
    // Información de pago
    formatPaymentInfo(formatter, orden);
    
    // Pie
    formatReceiptFooter(formatter);
    
    // Imprimir
    const printData = formatter.getBuffer();
    await printRaw(PRINTER_CASHIER_NAME, printData);
    
    console.log(`✅ Boleta impresa correctamente: Orden ${orden.numero_orden}`);
    return { success: true, message: 'Boleta impresa correctamente' };
  } catch (error) {
    console.error('❌ Error imprimiendo boleta:', error.message);
    throw error;
  }
}

// ============================================
// SISTEMA DE POLLING (COLA DE IMPRESIÓN)
// ============================================
// 
// NUEVO SISTEMA: Consulta print_jobs en lugar de órdenes.
// Esto separa completamente la impresión del estado de las órdenes.
// 
// Flujo:
// 1. Frontend crea un print_job cuando el usuario solicita impresión
// 2. El polling consulta print_jobs con status='pending'
// 3. Procesa cada print_job, imprime y marca como 'printed'
// 4. Si hay error, marca como 'error' con el mensaje

let isPolling = false;
let pollingInterval = null;

/**
 * Marca un print_job como impreso
 */
async function markPrintJobAsPrinted(printJobId) {
  if (!supabase) return;
  
  try {
    const { error } = await supabase
      .from('print_jobs')
      .update({
        status: 'printed',
        printed_at: new Date().toISOString()
      })
      .eq('id', printJobId);
    
    if (error) {
      console.error(`❌ Error marcando print_job ${printJobId} como impreso:`, error.message);
    }
  } catch (error) {
    console.error(`❌ Error marcando print_job ${printJobId} como impreso:`, error.message);
  }
}

/**
 * Marca un print_job como error
 */
async function markPrintJobAsError(printJobId, errorMessage) {
  if (!supabase) return;
  
  try {
    const { error } = await supabase
      .from('print_jobs')
      .update({
        status: 'error',
        error_message: errorMessage,
        attempts: supabase.raw('attempts + 1')
      })
      .eq('id', printJobId);
    
    if (error) {
      console.error(`❌ Error marcando print_job ${printJobId} como error:`, error.message);
    }
  } catch (error) {
    console.error(`❌ Error marcando print_job ${printJobId} como error:`, error.message);
  }
}

/**
 * Actualiza el estado de un print_job a 'printing' (para evitar procesamiento duplicado)
 */
async function markPrintJobAsPrinting(printJobId) {
  if (!supabase) return;
  
  try {
    const { error } = await supabase
      .from('print_jobs')
      .update({ status: 'printing' })
      .eq('id', printJobId)
      .eq('status', 'pending'); // Solo actualizar si sigue siendo 'pending'
    
    if (error) {
      console.error(`❌ Error marcando print_job ${printJobId} como printing:`, error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`❌ Error marcando print_job ${printJobId} como printing:`, error.message);
    return false;
  }
}

/**
 * Polling principal: Consulta print_jobs pendientes y los procesa
 */
async function pollForPendingOrders() {
  if (isPolling) {
    return; // Silenciosamente saltar si ya está ejecutándose
  }
  
  if (!supabase) {
    console.warn('⚠️  Supabase no configurado, saltando polling');
    console.warn('   Verifica que SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY estén en .env');
    return;
  }
  
  isPolling = true;
  
  try {
    // Buscar print_jobs pendientes (ordenados por created_at)
    const { data: pendingJobs, error: jobsError } = await supabase
      .from('print_jobs')
      .select('id, orden_id, type, printer_target, created_at, attempts')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10);
    
    if (jobsError) {
      console.error('❌ Error consultando print_jobs:', jobsError.message);
      console.error('   Verifica:');
      console.error('   1. Que la tabla print_jobs exista en Supabase');
      console.error('   2. Que SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY sean correctos');
      console.error('   3. Que el servicio tenga permisos para leer print_jobs');
    } else if (pendingJobs && pendingJobs.length > 0) {
      console.log(`🖨️  Encontrados ${pendingJobs.length} trabajo(s) de impresión pendiente(s)`);
      
      // Procesar trabajos secuencialmente para evitar concurrencia
      for (const job of pendingJobs) {
        try {
          // Intentar marcar como 'printing' (evita procesamiento duplicado)
          const marked = await markPrintJobAsPrinting(job.id);
          if (!marked) {
            console.log(`⏭️  Print job ${job.id} ya está siendo procesado, saltando...`);
            continue;
          }
          
          console.log(`🖨️  Procesando print_job ${job.id} (tipo: ${job.type}, impresora: ${job.printer_target})`);
          
          // Obtener orden e items (incluir total para calcular propina)
          const { data: orden, error: ordenError } = await supabase
            .from('ordenes_restaurante')
            .select('id, numero_orden, estado, created_at, nota, metodo_pago, paid_at, mesa_id, total, propina_calculada')
            .eq('id', job.orden_id)
            .single();
          
          if (ordenError || !orden) {
            await markPrintJobAsError(job.id, `Orden no encontrada: ${ordenError?.message || 'N/A'}`);
            continue;
          }
          
          const [items, mesa] = await Promise.all([
            getOrdenItems(orden.id),
            getMesaInfo(orden.mesa_id)
          ]);
          
          if (items.length === 0) {
            await markPrintJobAsError(job.id, 'La orden no tiene items');
            console.warn(`⚠️  Orden ${orden.numero_orden} no tiene items, marcando print_job como error`);
            continue;
          }
          
          // Preparar datos de orden (incluir total para propina)
          const ordenData = {
            id: orden.id,
            numero_orden: orden.numero_orden,
            created_at: orden.created_at,
            nota: orden.nota,
            metodo_pago: orden.metodo_pago,
            paid_at: orden.paid_at,
            total: orden.total || items.reduce((sum, item) => sum + item.subtotal, 0),
            propina_calculada: orden.propina_calculada,
            mesas: mesa
          };
          
          // Imprimir según el tipo
          let result;
          if (job.type === 'kitchen') {
            console.log(`📋 Imprimiendo comanda: ${orden.numero_orden}`);
            result = await printKitchenCommand({ orden: ordenData, items });
          } else if (job.type === 'receipt' || job.type === 'payment') {
            console.log(`🧾 Imprimiendo boleta: ${orden.numero_orden}`);
            result = await printCustomerReceipt({ orden: ordenData, items });
          } else {
            await markPrintJobAsError(job.id, `Tipo de impresión desconocido: ${job.type}`);
            continue;
          }
          
          // Marcar como impreso si fue exitoso
          if (result && result.success) {
            await markPrintJobAsPrinted(job.id);
            console.log(`✅ Print job ${job.id} completado: ${orden.numero_orden}`);
          } else {
            const errorMsg = result?.error || 'Error desconocido al imprimir';
            await markPrintJobAsError(job.id, errorMsg);
            console.error(`❌ Error en print_job ${job.id}: ${errorMsg}`);
          }
          
          // Pequeño delay entre impresiones para evitar saturar la impresora
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`❌ Error procesando print_job ${job.id}:`, error.message);
          await markPrintJobAsError(job.id, error.message);
        }
      }
    } else {
      // Loggear cada 20 ciclos para confirmar que el polling está activo (cada ~60 segundos si intervalo es 3s)
      const cycleCount = Math.floor(Date.now() / POLLING_INTERVAL_MS);
      if (cycleCount % 20 === 0) {
        console.log(`🔍 [Polling activo] No hay trabajos de impresión pendientes (ciclo ${cycleCount})`);
      }
    }
  } catch (error) {
    console.error('❌ Error en polling:', error.message);
  } finally {
    isPolling = false;
  }
}

function startPolling() {
  if (!POLLING_ENABLED) {
    console.log('⏸️  Polling deshabilitado (POLLING_ENABLED=false)');
    return;
  }
  
  if (!supabase) {
    console.log('⏸️  Polling deshabilitado (Supabase no configurado)');
    console.log('   Verifica que SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY estén en .env');
    return;
  }
  
  console.log(`🔄 Iniciando polling automático cada ${POLLING_INTERVAL_MS}ms`);
  console.log(`   - Consultará print_jobs con status='pending'`);
  console.log(`   - Procesará trabajos de impresión según su tipo (kitchen/receipt/payment)`);
  console.log(`   - Marcará como 'printed' o 'error' según el resultado`);
  console.log(`   ✅ Polling iniciado correctamente`);
  
  // Ejecutar inmediatamente el primer ciclo, luego continuar con el intervalo
  console.log(`🔍 Ejecutando primer ciclo de polling...`);
  pollForPendingOrders();
  
  pollingInterval = setInterval(() => {
    pollForPendingOrders();
  }, POLLING_INTERVAL_MS);
  
  console.log(`✅ Polling configurado. Próximo ciclo en ${POLLING_INTERVAL_MS}ms`);
}

function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
    console.log('⏸️  Polling detenido');
  }
}

// ============================================
// SERVIDOR HTTP (OPCIONAL - COMPATIBILIDAD)
// ============================================

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (req.method !== 'POST') {
    res.writeHead(405);
    res.end(JSON.stringify({ error: 'Método no permitido' }));
    return;
  }
  
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', async () => {
    try {
      const data = JSON.parse(body);
      
      // Verificar token de autorización (Bearer token)
      const authHeader = req.headers.authorization;
      const token = authHeader ? authHeader.replace('Bearer ', '') : data.token;
      
      if (token && token !== API_TOKEN) {
        res.writeHead(401);
        res.end(JSON.stringify({ error: 'Token inválido' }));
        return;
      }
      
      // Manejar peticiones en la raíz con type en el body (formato antiguo - DEPRECADO)
      // NOTA: Este endpoint está deprecado. El nuevo sistema usa print_jobs.
      // Se mantiene por compatibilidad, pero ahora crea un print_job en lugar de imprimir directamente.
      if ((req.url === '/' || req.url === '') && data.type && data.orden && data.items) {
        const type = data.type; // 'kitchen' o 'receipt'
        const orden = data.orden;
        
        try {
          // Determinar printer_target
          const printerTarget = type === 'kitchen' ? 'kitchen' : 'cashier';
          
          // Crear print_job en lugar de imprimir directamente
          const { data: printJob, error: printJobError } = await supabase
            .from('print_jobs')
            .insert({
              orden_id: orden.id,
              type: type,
              printer_target: printerTarget,
              status: 'pending',
              requested_by: null // No tenemos info del usuario en este endpoint
            })
            .select()
            .single();
          
          if (printJobError) {
            console.error(`❌ [HTTP] Error creando print_job:`, printJobError.message);
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Error al crear trabajo de impresión: ' + printJobError.message }));
            return;
          }
          
          console.log(`✅ [HTTP] Print job creado: ${printJob.id} (tipo: ${type}, orden: ${orden.numero_orden})`);
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: true, 
            message: 'Trabajo de impresión creado en la cola',
            print_job_id: printJob.id
          }));
        } catch (error) {
          console.error(`❌ [HTTP] Error procesando solicitud:`, error.message);
          res.writeHead(500);
          res.end(JSON.stringify({ error: error.message }));
        }
      }
      // Endpoints básicos (compatibilidad - formato antiguo - DEPRECADO)
      // NOTA: Estos endpoints están deprecados. El nuevo sistema usa print_jobs.
      // Se mantienen por compatibilidad, pero ahora crean print_jobs en lugar de imprimir directamente.
      else if (req.url === '/print/kitchen' && data.orden && data.items) {
        try {
          const orden = data.orden;
          
          // Crear print_job en lugar de imprimir directamente
          const { data: printJob, error: printJobError } = await supabase
            .from('print_jobs')
            .insert({
              orden_id: orden.id,
              type: 'kitchen',
              printer_target: 'kitchen',
              status: 'pending',
              requested_by: null
            })
            .select()
            .single();
          
          if (printJobError) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Error al crear trabajo de impresión: ' + printJobError.message }));
            return;
          }
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: true, 
            message: 'Trabajo de impresión creado en la cola',
            print_job_id: printJob.id
          }));
        } catch (error) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: error.message }));
        }
      } else if (req.url === '/print/receipt' && data.orden && data.items) {
        try {
          const orden = data.orden;
          
          // Crear print_job en lugar de imprimir directamente
          const { data: printJob, error: printJobError } = await supabase
            .from('print_jobs')
            .insert({
              orden_id: orden.id,
              type: 'receipt',
              printer_target: 'cashier',
              status: 'pending',
              requested_by: null
            })
            .select()
            .single();
          
          if (printJobError) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Error al crear trabajo de impresión: ' + printJobError.message }));
            return;
          }
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: true, 
            message: 'Trabajo de impresión creado en la cola',
            print_job_id: printJob.id
          }));
        } catch (error) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: error.message }));
        }
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Endpoint no encontrado' }));
      }
    } catch (error) {
      console.error(`❌ [HTTP] Error procesando petición:`, error.message);
      res.writeHead(400);
      res.end(JSON.stringify({ error: error.message }));
    }
  });
});

// ============================================
// INICIO DEL SERVICIO
// ============================================

// Intentar iniciar el servidor HTTP (opcional, no crítico)
server.listen(PORT, () => {
  console.log(`\n✅ Servidor HTTP iniciado en puerto ${PORT}`);
  console.log(`   (Opcional - el polling funciona sin servidor HTTP)\n`);
}).on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.log(`\n⚠️  Puerto ${PORT} ya está en uso. Servidor HTTP no iniciado.`);
    console.log(`   El polling seguirá funcionando normalmente.\n`);
  } else {
    console.error(`\n❌ Error iniciando servidor HTTP:`, error.message);
    console.log(`   El polling seguirá funcionando normalmente.\n`);
  }
});

// Iniciar polling
console.log('\n🚀 ========== INICIANDO SERVICIO ==========');
console.log(`📅 Fecha/Hora: ${new Date().toLocaleString('es-CL')}`);
console.log(`📁 Directorio: ${__dirname}`);
console.log(`🖥️  Node.js: ${process.version}`);
console.log(`🔄 Polling: ${POLLING_ENABLED ? 'HABILITADO' : 'DESHABILITADO'}`);
console.log(`📊 Supabase: ${supabase ? 'CONFIGURADO' : 'NO CONFIGURADO'}`);
console.log(`🖨️  Impresora Cocina: ${PRINTER_KITCHEN_NAME || 'NO CONFIGURADA'}`);
console.log(`🖨️  Impresora Caja: ${PRINTER_CASHIER_NAME || 'NO CONFIGURADA'}`);
console.log('========================================\n');

startPolling();

// Manejo de cierre graceful
process.on('SIGINT', () => {
  console.log('\n\n🛑 Deteniendo servicio...');
  stopPolling();
  server.close(() => {
    console.log('✅ Servicio detenido correctamente');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Deteniendo servicio...');
  stopPolling();
  server.close(() => {
    console.log('✅ Servicio detenido correctamente');
    process.exit(0);
  });
});

