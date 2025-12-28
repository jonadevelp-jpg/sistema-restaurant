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

// Verificar impresoras
console.log('🖨️  Impresoras configuradas:');
console.log(`   Cocina: ${PRINTER_KITCHEN_NAME || '❌ NO CONFIGURADA'}`);
console.log(`   Caja: ${PRINTER_CASHIER_NAME || '❌ NO CONFIGURADA'}\n`);

if (PRINTER_KITCHEN_NAME) {
  if (printerExists(PRINTER_KITCHEN_NAME)) {
    console.log(`✅ Impresora de cocina encontrada: "${PRINTER_KITCHEN_NAME}"`);
  } else {
    console.error(`❌ Impresora de cocina NO encontrada: "${PRINTER_KITCHEN_NAME}"`);
    console.error('   Verifica el nombre en: Panel de Control > Dispositivos e impresoras');
  }
}

if (PRINTER_CASHIER_NAME) {
  if (printerExists(PRINTER_CASHIER_NAME)) {
    console.log(`✅ Impresora de caja encontrada: "${PRINTER_CASHIER_NAME}"`);
  } else {
    console.error(`❌ Impresora de caja NO encontrada: "${PRINTER_CASHIER_NAME}"`);
    console.error('   Verifica el nombre en: Panel de Control > Dispositivos e impresoras');
  }
}

// Listar todas las impresoras disponibles (para referencia)
console.log('\n📋 Impresoras disponibles en el sistema:');
const availablePrinters = listPrinters();
if (availablePrinters.length > 0) {
  availablePrinters.forEach(p => {
    const marker = (p.name === PRINTER_KITCHEN_NAME || p.name === PRINTER_CASHIER_NAME) ? ' ← CONFIGURADA' : '';
    console.log(`   - ${p.name}${marker}`);
  });
} else {
  console.log('   ⚠️  No se encontraron impresoras');
}

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

function formatPersonalization(notas) {
  if (!notas) return '';
  
  try {
    const personalization = JSON.parse(notas);
    const parts = [];
    
    if (personalization.agregado) parts.push(`Agregado: ${personalization.agregado}`);
    if (personalization.salsas?.length > 0) {
      parts.push(`Salsa${personalization.salsas.length > 1 ? 's' : ''}: ${personalization.salsas.join(', ')}`);
    }
    if (personalization.sinIngredientes?.length > 0) {
      parts.push(`Sin: ${personalization.sinIngredientes.join(', ')}`);
    }
    if (personalization.bebidas?.length > 0) {
      const bebidasText = personalization.bebidas.map(b => {
        if (b.sabor) return `${b.nombre} (${b.sabor})`;
        return b.nombre;
      }).join(', ');
      parts.push(`Bebida${personalization.bebidas.length > 1 ? 's' : ''}: ${bebidasText}`);
    }
    if (personalization.detalles) parts.push(`Nota: ${personalization.detalles}`);
    
    return parts.join(' | ');
  } catch {
    return notas;
  }
}

async function printKitchenCommand(data) {
  const { orden, items } = data;
  
  if (!PRINTER_KITCHEN_NAME) {
    throw new Error('PRINTER_KITCHEN_NAME no configurado en .env');
  }
  
  if (!printerExists(PRINTER_KITCHEN_NAME)) {
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
    formatter
      .alignCenter()
      .sizeDouble()
      .text('COMANDA COCINA')
      .sizeNormal()
      .text('================')
      .alignLeft()
      .feed(1)
      .text(`Orden: ${orden.numero_orden}`)
      .text(`Mesa: ${orden.mesas?.numero || 'N/A'}`)
      .text(`Hora: ${new Date(orden.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}`)
      .separator();
    
    // Items agrupados por categoría
    const itemsPorCategoria = items.reduce((acc, item) => {
      const categoria = item.menu_item?.category_id || 0;
      if (!acc[categoria]) acc[categoria] = [];
      acc[categoria].push(item);
      return acc;
    }, {});
    
    Object.entries(itemsPorCategoria).forEach(([categoriaId, categoriaItems]) => {
      categoriaItems.forEach((item) => {
        const personalization = formatPersonalization(item.notas);
        
        formatter.text(`${item.cantidad}x ${item.menu_item?.name || 'Item'}`.toUpperCase());
        
        if (personalization) {
          formatter.text(`  ${personalization}`);
        }
        
        formatter.feed(1);
      });
    });
    
    // Nota general
    if (orden.nota) {
      formatter
        .separator()
        .text('NOTA GENERAL:')
        .text(orden.nota)
        .feed(1);
    }
    
    // Pie
    formatter
      .separator()
      .alignCenter()
      .text(`Total Items: ${items.reduce((sum, item) => sum + item.cantidad, 0)}`)
      .text(new Date().toLocaleString('es-CL'))
      .feed(2)
      .cut();
    
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
  const { orden, items } = data;
  
  if (!PRINTER_CASHIER_NAME) {
    throw new Error('PRINTER_CASHIER_NAME no configurado en .env');
  }
  
  if (!printerExists(PRINTER_CASHIER_NAME)) {
    throw new Error(`Impresora "${PRINTER_CASHIER_NAME}" no encontrada en el sistema`);
  }
  
  console.log(`🧾 ========== IMPRIMIENDO BOLETA ==========`);
  console.log(`🧾 Orden: ${orden.numero_orden}`);
  console.log(`🧾 Impresora: ${PRINTER_CASHIER_NAME}`);
  
  try {
    // Calcular desglose IVA
    const calcularDesgloseIVA = (precioConIVA) => {
      const precioSinIVA = precioConIVA / 1.19;
      const iva = precioConIVA - precioSinIVA;
      return { sinIVA: precioSinIVA, iva, conIVA: precioConIVA };
    };
    
    const subtotalSinIVA = items.reduce((sum, item) => {
      const desglose = calcularDesgloseIVA(item.subtotal);
      return sum + desglose.sinIVA;
    }, 0);
    
    const ivaTotal = items.reduce((sum, item) => {
      const desglose = calcularDesgloseIVA(item.subtotal);
      return sum + desglose.iva;
    }, 0);
    
    const total = items.reduce((sum, item) => sum + item.subtotal, 0);
    
    const formatPrice = (price) => {
      return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
      }).format(Math.round(price));
    };
    
    const formatter = new ESCPOSFormatter();
    
    // Inicializar impresora
    formatter.init();
    
    // Encabezado
    formatter
      .alignCenter()
      .sizeDouble()
      .text('GOURMET ARABE SPA')
      .sizeNormal()
      .text('RUT: 77669643-9')
      .text('Providencia 1388 Local 49')
      .text('Celular: 939459286')
      .separator()
      .alignLeft()
      .text(`Orden: ${orden.numero_orden}`)
      .text(`Mesa: ${orden.mesas?.numero || 'Para Llevar'}`)
      .text(`Fecha: ${new Date(orden.created_at).toLocaleDateString('es-CL')}`)
      .text(`Hora: ${new Date(orden.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}`)
      .separator()
      .feed(1);
    
    // Items
    formatter
      .text('Cant. Descripcion        Total')
      .text('----------------');
    
    items.forEach((item) => {
      const desglose = calcularDesgloseIVA(item.subtotal);
      const nombre = (item.menu_item?.name || 'Item').substring(0, 20);
      const cantidad = item.cantidad.toString().padStart(2);
      const precio = formatPrice(desglose.sinIVA).padStart(10);
      
      formatter.text(`${cantidad}  ${nombre.padEnd(20)} ${precio}`);
    });
    
    // Totales
    formatter
      .separator()
      .text(`Monto Neto:     ${formatPrice(subtotalSinIVA).padStart(15)}`)
      .text(`IVA (19%):      ${formatPrice(ivaTotal).padStart(15)}`)
      .separator()
      .boldOn()
      .text(`TOTAL:          ${formatPrice(total).padStart(15)}`)
      .boldOff();
    
    // Método de pago
    if (orden.metodo_pago) {
      formatter
        .separator()
        .text(`Metodo de Pago: ${orden.metodo_pago}`)
        .text(`Pagado: ${orden.paid_at ? new Date(orden.paid_at).toLocaleString('es-CL') : 'N/A'}`);
    }
    
    // Pie
    formatter
      .separator()
      .alignCenter()
      .text('¡Gracias por su visita!')
      .text('Carne Halal Certificada 🕌')
      .text(new Date().toLocaleString('es-CL'))
      .feed(2)
      .cut();
    
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
// SISTEMA DE POLLING
// ============================================

let isPolling = false;
let pollingInterval = null;

async function pollForPendingOrders() {
  if (isPolling) {
    console.log('⏳ Polling ya en ejecución, saltando ciclo...');
    return;
  }
  
  if (!supabase) {
    console.warn('⚠️  Supabase no configurado, saltando polling');
    return;
  }
  
  isPolling = true;
  
  try {
    // Buscar órdenes pendientes de impresión de cocina
    const { data: kitchenOrders, error: kitchenError } = await supabase
      .from('ordenes_restaurante')
      .select('id, numero_orden, estado, created_at, nota, mesa_id')
      .eq('estado', 'preparing')
      .is('kitchen_printed_at', null)
      .order('created_at', { ascending: true })
      .limit(10);
    
    if (kitchenError) {
      console.error('❌ Error consultando órdenes de cocina:', kitchenError.message);
    } else if (kitchenOrders && kitchenOrders.length > 0) {
      console.log(`📋 Encontradas ${kitchenOrders.length} orden(es) pendientes de impresión de cocina`);
      
      for (const orden of kitchenOrders) {
        try {
          console.log(`🖨️  Procesando orden de cocina: ${orden.numero_orden}`);
          
          const [items, mesa] = await Promise.all([
            getOrdenItems(orden.id),
            getMesaInfo(orden.mesa_id)
          ]);
          
          if (items.length === 0) {
            console.warn(`⚠️  Orden ${orden.numero_orden} no tiene items, saltando...`);
            continue;
          }
          
          const ordenData = {
            id: orden.id,
            numero_orden: orden.numero_orden,
            created_at: orden.created_at,
            nota: orden.nota,
            mesas: mesa
          };
          
          await incrementPrintAttempts(orden.id, 'kitchen');
          const result = await printKitchenCommand({ orden: ordenData, items });
          
          if (result && result.success) {
            await markOrderAsPrinted(orden.id, 'kitchen');
            console.log(`✅ Orden ${orden.numero_orden} impresa y marcada en BD`);
          } else {
            console.error(`❌ Error imprimiendo orden ${orden.numero_orden}, NO se marca como impresa`);
          }
        } catch (error) {
          console.error(`❌ Error procesando orden ${orden.numero_orden}:`, error.message);
        }
      }
    }
    
    // Buscar órdenes pendientes de impresión de boleta
    const { data: receiptOrders, error: receiptError } = await supabase
      .from('ordenes_restaurante')
      .select('id, numero_orden, estado, created_at, metodo_pago, paid_at, mesa_id')
      .eq('estado', 'paid')
      .is('receipt_printed_at', null)
      .order('paid_at', { ascending: true })
      .limit(10);
    
    if (receiptError) {
      console.error('❌ Error consultando órdenes de boleta:', receiptError.message);
    } else if (receiptOrders && receiptOrders.length > 0) {
      console.log(`🧾 Encontradas ${receiptOrders.length} orden(es) pendientes de impresión de boleta`);
      
      for (const orden of receiptOrders) {
        try {
          console.log(`🖨️  Procesando boleta: ${orden.numero_orden}`);
          
          const [items, mesa] = await Promise.all([
            getOrdenItems(orden.id),
            getMesaInfo(orden.mesa_id)
          ]);
          
          if (items.length === 0) {
            console.warn(`⚠️  Orden ${orden.numero_orden} no tiene items, saltando...`);
            continue;
          }
          
          const ordenData = {
            id: orden.id,
            numero_orden: orden.numero_orden,
            created_at: orden.created_at,
            metodo_pago: orden.metodo_pago,
            paid_at: orden.paid_at,
            mesas: mesa
          };
          
          await incrementPrintAttempts(orden.id, 'receipt');
          const result = await printCustomerReceipt({ orden: ordenData, items });
          
          if (result && result.success) {
            await markOrderAsPrinted(orden.id, 'receipt');
            console.log(`✅ Boleta ${orden.numero_orden} impresa y marcada en BD`);
          } else {
            console.error(`❌ Error imprimiendo boleta ${orden.numero_orden}, NO se marca como impresa`);
          }
        } catch (error) {
          console.error(`❌ Error procesando boleta ${orden.numero_orden}:`, error.message);
        }
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
    return;
  }
  
  console.log(`🔄 Iniciando polling automático cada ${POLLING_INTERVAL_MS}ms`);
  console.log(`   - Buscará órdenes con estado 'preparing' sin kitchen_printed_at`);
  console.log(`   - Buscará órdenes con estado 'paid' sin receipt_printed_at`);
  
  pollForPendingOrders();
  
  pollingInterval = setInterval(() => {
    pollForPendingOrders();
  }, POLLING_INTERVAL_MS);
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
      
      // Verificar token (opcional)
      if (data.token && data.token !== API_TOKEN) {
        res.writeHead(401);
        res.end(JSON.stringify({ error: 'Token inválido' }));
        return;
      }
      
      // Endpoints básicos (compatibilidad)
      if (req.url === '/print/kitchen' && data.orden && data.items) {
        try {
          const result = await printKitchenCommand(data);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result));
        } catch (error) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: error.message }));
        }
      } else if (req.url === '/print/receipt' && data.orden && data.items) {
        try {
          const result = await printCustomerReceipt(data);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result));
        } catch (error) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: error.message }));
        }
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Endpoint no encontrado' }));
      }
    } catch (error) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: error.message }));
    }
  });
});

// ============================================
// INICIO DEL SERVICIO
// ============================================

server.listen(PORT, () => {
  console.log(`\n✅ Servidor HTTP iniciado en puerto ${PORT}`);
  console.log(`   (Opcional - el polling funciona sin servidor HTTP)\n`);
});

// Iniciar polling
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



