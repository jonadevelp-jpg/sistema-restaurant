/**
 * Servicio Local de Impresión
 * 
 * Este servicio corre en una PC local del restaurante y se encarga
 * únicamente de recibir comandos de impresión y enviarlos a la impresora.
 * 
 * Si este servicio se apaga, la página web sigue funcionando (solo no imprime).
 */

const http = require('http');
const { Network, USB, Printer } = require('escpos');

// Configuración desde variables de entorno
const PORT = process.env.PRINT_SERVICE_PORT || 3001;
const KITCHEN_PRINTER_TYPE = process.env.PRINTER_KITCHEN_TYPE || 'usb';
const KITCHEN_PRINTER_PATH = process.env.PRINTER_KITCHEN_PATH || 'USB002';
const KITCHEN_PRINTER_IP = process.env.PRINTER_KITCHEN_IP;
const KITCHEN_PRINTER_PORT = parseInt(process.env.PRINTER_KITCHEN_PORT || '9100');

const CASHIER_PRINTER_TYPE = process.env.PRINTER_CASHIER_TYPE || 'usb';
const CASHIER_PRINTER_PATH = process.env.PRINTER_CASHIER_PATH || 'USB002';
const CASHIER_PRINTER_IP = process.env.PRINTER_CASHIER_IP;
const CASHIER_PRINTER_PORT = parseInt(process.env.PRINTER_CASHIER_PORT || '9100');

// Token de seguridad (opcional, pero recomendado)
const API_TOKEN = process.env.PRINT_SERVICE_TOKEN || 'cambiar-este-token';

console.log('🖨️  Servicio de Impresión Local iniciado');
console.log(`📡 Escuchando en puerto ${PORT}`);
console.log(`🔐 Token: ${API_TOKEN.substring(0, 10)}...`);

// Conectar a impresora
function connectPrinter(type, path, ip, port) {
  try {
    console.log(`🔌 Conectando a impresora: tipo=${type}, path=${path}, ip=${ip}, port=${port}`);
    let device;
    
    if (type === 'network') {
      if (!ip || !port) {
        throw new Error('IP y puerto requeridos para impresora de red');
      }
      console.log(`🔌 Creando dispositivo de red: ${ip}:${port}`);
      device = new Network(ip, port);
    } else {
      console.log(`🔌 Creando dispositivo USB: ${path}`);
      device = new USB(path);
    }
    
    console.log(`🔌 Creando impresora...`);
    const printer = new Printer(device);
    console.log(`✅ Impresora conectada correctamente`);
    return printer;
  } catch (error) {
    console.error(`❌ Error conectando a impresora:`, error.message);
    console.error(`❌ Tipo: ${type}, Path: ${path}, IP: ${ip}, Port: ${port}`);
    console.error(`❌ Stack:`, error.stack);
    return null;
  }
}

// Formatear personalización
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

// Imprimir comanda de cocina
async function printKitchenCommand(data) {
  const { orden, items } = data;
  
  const printer = connectPrinter(
    KITCHEN_PRINTER_TYPE,
    KITCHEN_PRINTER_PATH,
    KITCHEN_PRINTER_IP,
    KITCHEN_PRINTER_PORT
  );
  
  if (!printer) {
    throw new Error('No se pudo conectar a la impresora de cocina');
  }
  
  try {
    // Encabezado
    printer
      .font('a')
      .align('ct')
      .size(1, 1)
      .text('COMANDA COCINA')
      .text('================')
      .size(0, 0)
      .align('lt')
      .text(`Orden: ${orden.numero_orden}`)
      .text(`Mesa: ${orden.mesas?.numero || 'N/A'}`)
      .text(`Hora: ${new Date(orden.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}`)
      .text('----------------')
      .feed(1);
    
    // Items
    const itemsPorCategoria = items.reduce((acc, item) => {
      const categoria = item.menu_item?.category_id || 0;
      if (!acc[categoria]) acc[categoria] = [];
      acc[categoria].push(item);
      return acc;
    }, {});
    
    Object.entries(itemsPorCategoria).forEach(([categoriaId, categoriaItems]) => {
      categoriaItems.forEach((item) => {
        const personalization = formatPersonalization(item.notas);
        
        printer.text(`${item.cantidad}x ${item.menu_item?.name || 'Item'}`.toUpperCase());
        
        if (personalization) {
          printer.text(`  ${personalization}`).font('b');
        }
        
        printer.feed(1);
      });
    });
    
    // Nota general
    if (orden.nota) {
      printer
        .text('----------------')
        .text('NOTA GENERAL:')
        .text(orden.nota)
        .feed(1);
    }
    
    // Pie
    printer
      .text('----------------')
      .align('ct')
      .text(`Total Items: ${items.reduce((sum, item) => sum + item.cantidad, 0)}`)
      .text(new Date().toLocaleString('es-CL'))
      .feed(2)
      .cut();
    
    await printer.close();
    console.log(`✅ Comanda impresa: Orden ${orden.numero_orden}`);
    return { success: true, message: 'Comanda impresa correctamente' };
  } catch (error) {
    console.error('❌ Error imprimiendo comanda:', error);
    console.error('❌ Detalles:', error.message);
    console.error('❌ Stack:', error.stack);
    try {
      await printer.close();
    } catch {}
    throw error;
  }
}

// Imprimir boleta de cliente
async function printCustomerReceipt(data) {
  const { orden, items } = data;
  
  const printer = connectPrinter(
    CASHIER_PRINTER_TYPE,
    CASHIER_PRINTER_PATH,
    CASHIER_PRINTER_IP,
    CASHIER_PRINTER_PORT
  );
  
  if (!printer) {
    throw new Error('No se pudo conectar a la impresora de caja');
  }
  
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
    
    // Encabezado
    printer
      .font('a')
      .align('ct')
      .size(1, 1)
      .text('GOURMET ARABE SPA')
      .size(0, 0)
      .text('RUT: 77669643-9')
      .text('Providencia 1388 Local 49')
      .text('Celular: 939459286')
      .text('----------------')
      .align('lt')
      .text(`Orden: ${orden.numero_orden}`)
      .text(`Mesa: ${orden.mesas?.numero || 'Para Llevar'}`)
      .text(`Fecha: ${new Date(orden.created_at).toLocaleDateString('es-CL')}`)
      .text(`Hora: ${new Date(orden.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}`)
      .text('----------------')
      .feed(1);
    
    // Items
    printer
      .text('Cant. Descripcion        Total')
      .text('----------------');
    
    items.forEach((item) => {
      const desglose = calcularDesgloseIVA(item.subtotal);
      const nombre = (item.menu_item?.name || 'Item').substring(0, 20);
      const cantidad = item.cantidad.toString().padStart(2);
      const precio = formatPrice(desglose.sinIVA).padStart(10);
      
      printer.text(`${cantidad}  ${nombre.padEnd(20)} ${precio}`);
    });
    
    // Totales
    printer
      .text('----------------')
      .text(`Monto Neto:     ${formatPrice(subtotalSinIVA).padStart(15)}`)
      .text(`IVA (19%):      ${formatPrice(ivaTotal).padStart(15)}`)
      .text('----------------')
      .font('b')
      .text(`TOTAL:          ${formatPrice(total).padStart(15)}`)
      .font('a');
    
    // Método de pago
    if (orden.metodo_pago) {
      printer
        .text('----------------')
        .text(`Metodo de Pago: ${orden.metodo_pago}`)
        .text(`Pagado: ${orden.paid_at ? new Date(orden.paid_at).toLocaleString('es-CL') : 'N/A'}`);
    }
    
    // Pie
    printer
      .text('----------------')
      .align('ct')
      .text('¡Gracias por su visita!')
      .text('Carne Halal Certificada 🕌')
      .text(new Date().toLocaleString('es-CL'))
      .feed(2)
      .cut();
    
    await printer.close();
    console.log(`✅ Boleta impresa: Orden ${orden.numero_orden}`);
    return { success: true, message: 'Boleta impresa correctamente' };
  } catch (error) {
    console.error('❌ Error imprimiendo boleta:', error);
    console.error('❌ Detalles:', error.message);
    console.error('❌ Stack:', error.stack);
    try {
      await printer.close();
    } catch {}
    throw error;
  }
}

// Servidor HTTP
const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Solo aceptar POST
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Método no permitido' }));
    return;
  }
  
  // Verificar token (opcional pero recomendado)
  const authHeader = req.headers.authorization;
  console.log('🔐 Verificando autenticación...');
  console.log('🔐 Header recibido:', authHeader ? authHeader.substring(0, 20) + '...' : 'NO HAY HEADER');
  console.log('🔐 Token esperado:', `Bearer ${API_TOKEN.substring(0, 10)}...`);
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('❌ Token no proporcionado en header');
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Token requerido' }));
    return;
  }
  
  const token = authHeader.replace('Bearer ', '');
  if (token !== API_TOKEN) {
    console.error('❌ Token inválido');
    console.error('❌ Token recibido:', token.substring(0, 10) + '...');
    console.error('❌ Token esperado:', API_TOKEN.substring(0, 10) + '...');
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Token inválido' }));
    return;
  }
  console.log('✅ Token válido');
  
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', async () => {
    try {
      console.log('📥 Petición recibida, parseando body...');
      const data = JSON.parse(body);
      console.log('📥 Tipo:', data.type);
      console.log('📥 Orden:', data.orden?.numero_orden);
      console.log('📥 Items:', data.items?.length || 0);
      
      const { type, orden, items } = data;
      
      if (!type || !orden || !items) {
        throw new Error('Datos incompletos. Se requiere: type, orden, items');
      }
      
      let result;
      
      if (type === 'kitchen') {
        console.log('📋 Imprimiendo comanda de cocina...');
        result = await printKitchenCommand({ orden, items });
      } else if (type === 'receipt') {
        console.log('🧾 Imprimiendo boleta de cliente...');
        result = await printCustomerReceipt({ orden, items });
      } else {
        throw new Error('Tipo de impresión inválido. Use "kitchen" o "receipt"');
      }
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch (error) {
      console.error('❌ Error procesando solicitud:', error);
      console.error('❌ Detalles:', error.message);
      console.error('❌ Stack:', error.stack);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: error.message || 'Error interno del servidor',
        success: false 
      }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`✅ Servicio de impresión escuchando en http://localhost:${PORT}`);
  console.log(`📋 Impresora Cocina: ${KITCHEN_PRINTER_TYPE} - ${KITCHEN_PRINTER_PATH || KITCHEN_PRINTER_IP}`);
  console.log(`📋 Impresora Caja: ${CASHIER_PRINTER_TYPE} - ${CASHIER_PRINTER_PATH || CASHIER_PRINTER_IP}`);
});

// Manejar errores
server.on('error', (error) => {
  console.error('❌ Error en el servidor:', error);
});

// Manejar cierre
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servicio de impresión...');
  server.close(() => {
    console.log('✅ Servicio cerrado correctamente');
    process.exit(0);
  });
});

