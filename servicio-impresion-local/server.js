/**
 * Servicio Local de Impresión
 * 
 * Este servicio corre en una PC local del restaurante y se encarga
 * únicamente de recibir comandos de impresión y enviarlos a la impresora.
 * 
 * Si este servicio se apaga, la página web sigue funcionando (solo no imprime).
 */

// Cargar variables de entorno desde .env
// IMPORTANTE: dotenv debe estar instalado (npm install dotenv)
let dotenvLoaded = false;
const fs = require('fs');
const path = require('path');

// Primero intentar con dotenv
try {
  require('dotenv').config({ path: path.join(__dirname, '.env') });
  dotenvLoaded = true;
  console.log('✅ Archivo .env cargado con dotenv');
} catch (error) {
  console.warn('⚠️  dotenv no disponible o error:', error.message);
}

// Fallback: cargar .env manualmente (más robusto)
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
          // Remover comillas si las tiene
          const cleanValue = value.replace(/^["']|["']$/g, '');
          if (key && cleanValue) {
            process.env[key] = cleanValue;
            loadedCount++;
            // Log solo para PRINT_SERVICE_TOKEN para debug
            if (key === 'PRINT_SERVICE_TOKEN') {
              console.log(`🔐 Cargado desde .env: ${key}=${cleanValue.substring(0, 20)}...`);
            }
          }
        }
      }
    });
    if (loadedCount > 0) {
      console.log(`✅ Archivo .env cargado manualmente (${loadedCount} variables)`);
      dotenvLoaded = true;
    }
  } catch (manualError) {
    console.error('❌ Error cargando .env manualmente:', manualError.message);
  }
} else {
  console.error(`❌ Archivo .env no encontrado en: ${envPath}`);
}

if (!dotenvLoaded) {
  console.error('❌ NO SE PUDO CARGAR EL ARCHIVO .env');
  console.error('❌ El servicio usará valores por defecto o variables del sistema');
}

const http = require('http');

// Importar escpos - la estructura puede variar según la versión
let escpos;
let Network, USB, Printer;

try {
  escpos = require('escpos');
  Printer = escpos.Printer;
  
  console.log('✅ escpos base importado');
  console.log('   Keys disponibles:', Object.keys(escpos).join(', '));
  
  // Intentar diferentes métodos para obtener USB y Network
  
  // Método 1: Directamente desde escpos
  if (escpos.USB) {
    USB = escpos.USB;
    Network = escpos.Network;
    console.log('✅ USB y Network encontrados directamente (método 1)');
  }
  // Método 2: Desde default export
  else if (escpos.default && escpos.default.USB) {
    USB = escpos.default.USB;
    Network = escpos.default.Network;
    console.log('✅ USB y Network encontrados en default (método 2)');
  }
  // Método 3: Módulos separados escpos-usb y escpos-network
  else {
    try {
      const escposUSB = require('escpos-usb');
      const escposNetwork = require('escpos-network');
      
      if (escposUSB && escposUSB.USB) {
        USB = escposUSB.USB;
        console.log('✅ USB encontrado en escpos-usb (método 3)');
      } else if (typeof escposUSB === 'function') {
        USB = escposUSB;
        console.log('✅ USB encontrado como función en escpos-usb (método 3)');
      }
      
      if (escposNetwork && escposNetwork.Network) {
        Network = escposNetwork.Network;
        console.log('✅ Network encontrado en escpos-network (método 3)');
      } else if (typeof escposNetwork === 'function') {
        Network = escposNetwork;
        console.log('✅ Network encontrado como función en escpos-network (método 3)');
      }
    } catch (moduleError) {
      console.warn('⚠️  Módulos escpos-usb/escpos-network no disponibles:', moduleError.message);
    }
    
    // Método 4: Usar función create() si está disponible
    if ((!USB || !Network) && escpos.create) {
      console.log('⚠️  Intentando usar escpos.create()...');
      try {
        // En escpos 3.0, create() puede crear adaptadores
        // Intentar crear adaptador USB
        if (!USB) {
          try {
            const usbAdapter = escpos.create('usb');
            if (usbAdapter) {
              USB = usbAdapter;
              console.log('✅ USB creado usando escpos.create("usb") (método 4)');
            }
          } catch (e) {
            console.warn('   No se pudo crear USB con create("usb"):', e.message);
          }
        }
        
        // Intentar crear adaptador Network
        if (!Network) {
          try {
            const networkAdapter = escpos.create('network');
            if (networkAdapter) {
              Network = networkAdapter;
              console.log('✅ Network creado usando escpos.create("network") (método 4)');
            }
          } catch (e) {
            console.warn('   No se pudo crear Network con create("network"):', e.message);
          }
        }
      } catch (createError) {
        console.warn('   Error usando create():', createError.message);
      }
    }
    
    // Método 5: Asignar directamente desde módulos si están disponibles pero no exportan correctamente
    if (!USB) {
      try {
        const escposUSB = require('escpos-usb');
        // Intentar asignar directamente a escpos.USB
        if (escposUSB) {
          escpos.USB = escposUSB;
          USB = escposUSB;
          console.log('✅ USB asignado directamente desde escpos-usb (método 5)');
        }
      } catch (e) {
        // Ignorar si no está disponible
      }
    }
    
    if (!Network) {
      try {
        const escposNetwork = require('escpos-network');
        if (escposNetwork) {
          escpos.Network = escposNetwork;
          Network = escposNetwork;
          console.log('✅ Network asignado directamente desde escpos-network (método 5)');
        }
      } catch (e) {
        // Ignorar si no está disponible
      }
    }
  }
  
  // Verificar que Printer esté disponible
  if (!Printer || typeof Printer !== 'function') {
    throw new Error('Printer no está disponible o no es una función');
  }
  
  // Verificar USB (puede no estar disponible si no se instalaron los módulos)
  if (!USB || typeof USB !== 'function') {
    console.error('❌ USB NO está disponible');
    console.error('   Solución: Instala los módulos adicionales:');
    console.error('   npm install escpos-usb escpos-network');
    console.error('   O usa una versión diferente de escpos que incluya USB/Network');
    // No salimos del proceso, pero registramos el error
  } else {
    console.log('✅ USB verificado correctamente');
  }
  
  // Verificar Network (puede no estar disponible)
  if (!Network || typeof Network !== 'function') {
    console.warn('⚠️  Network NO está disponible (solo necesario para impresoras de red)');
  } else {
    console.log('✅ Network verificado correctamente');
  }
  
  console.log('✅ Importación de escpos completada');
} catch (importError) {
  console.error('❌ ERROR importando escpos:', importError.message);
  console.error('❌ Stack:', importError.stack);
  console.error('❌ Verifica que escpos esté instalado: npm install escpos');
  process.exit(1);
}

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
console.log(`🔐 .env cargado: ${dotenvLoaded ? 'SÍ' : 'NO'}`);
console.log(`🔐 Token configurado: ${API_TOKEN ? 'SÍ' : 'NO'}`);
console.log(`🔐 Token (completo): ${API_TOKEN || 'NO CONFIGURADO'}`);
console.log(`🔐 Token (longitud): ${API_TOKEN ? API_TOKEN.length : 0} caracteres`);
console.log(`🔐 Token (primeros 30): ${API_TOKEN ? API_TOKEN.substring(0, 30) + '...' : 'NO CONFIGURADO'}`);

// Verificar si está usando el valor por defecto
if (API_TOKEN === 'cambiar-este-token') {
  console.error('⚠️  ADVERTENCIA: El servicio está usando el token por defecto "cambiar-este-token"');
  console.error('⚠️  Esto significa que el .env NO se cargó correctamente');
  console.error('⚠️  Verifica que:');
  console.error('   1. El archivo .env existe en la misma carpeta que server.js');
  console.error('   2. El archivo .env tiene la línea: PRINT_SERVICE_TOKEN=tu-token-aqui');
  console.error('   3. dotenv está instalado: npm install dotenv');
}

// Conectar a impresora
function connectPrinter(type, path, ip, port) {
  try {
    console.log(`🔌 ========== INTENTANDO CONECTAR A IMPRESORA ==========`);
    console.log(`🔌 Tipo: ${type}`);
    console.log(`🔌 Path: ${path || 'NO CONFIGURADO'}`);
    console.log(`🔌 IP: ${ip || 'NO CONFIGURADO'}`);
    console.log(`🔌 Port: ${port || 'NO CONFIGURADO'}`);
    
    let device;
    
    // Validar configuración
    if (type === 'network') {
      if (!ip || !port) {
        console.error(`❌ Configuración incompleta para impresora de red:`);
        console.error(`   - IP requerida: ${ip ? '✅' : '❌ FALTA'}`);
        console.error(`   - Port requerido: ${port ? '✅' : '❌ FALTA'}`);
        throw new Error('IP y puerto requeridos para impresora de red');
      }
      console.log(`🔌 Creando dispositivo de red: ${ip}:${port}`);
      device = new Network(ip, port);
    } else if (type === 'usb') {
      if (!USB || typeof USB !== 'function') {
        console.error(`❌ USB no está disponible`);
        console.error(`   La clase USB no se pudo cargar desde escpos`);
        console.error(`   Solución:`);
        console.error(`   1. Instala los módulos adicionales:`);
        console.error(`      npm install escpos-usb escpos-network`);
        console.error(`   2. O cambia a una versión de escpos que incluya USB`);
        console.error(`   3. O usa una impresora de red en lugar de USB`);
        throw new Error('USB no está disponible. Instala escpos-usb: npm install escpos-usb');
      }
      
      if (!path) {
        console.error(`❌ Configuración incompleta para impresora USB:`);
        console.error(`   - Path requerido: ${path ? '✅' : '❌ FALTA'}`);
        throw new Error('Path requerido para impresora USB');
      }
      console.log(`🔌 Creando dispositivo USB: ${path}`);
      console.log(`🔌 NOTA: En Windows, el path puede ser USB002, COM3, o el nombre de la impresora`);
      
      // Intentar múltiples métodos para conectar USB en Windows
      let usbConnected = false;
      const methodsToTry = [];
      
      // Método 1: Path directo (el configurado)
      methodsToTry.push({ name: 'Path directo', path: path });
      
      // Método 2: Si es USB002, USB003, etc., intentar sin el prefijo
      if (path.toUpperCase().startsWith('USB')) {
        const numericPart = path.replace(/^USB/i, '');
        methodsToTry.push({ name: 'Sin prefijo USB', path: numericPart });
      }
      
      // Método 3: Intentar listar dispositivos USB disponibles
      try {
        console.log(`🔌 Intentando listar dispositivos USB disponibles...`);
        const usbDevices = USB.findPrinter();
        if (usbDevices && usbDevices.length > 0) {
          console.log(`🔌 Se encontraron ${usbDevices.length} dispositivo(s) USB`);
          usbDevices.forEach((dev, idx) => {
            console.log(`   ${idx + 1}. ${JSON.stringify(dev)}`);
            methodsToTry.push({ name: `Dispositivo USB #${idx + 1}`, path: dev });
          });
        } else {
          console.log(`⚠️  No se encontraron dispositivos USB con findPrinter()`);
        }
      } catch (listError) {
        console.warn(`⚠️  No se pudo listar dispositivos USB: ${listError.message}`);
      }
      
      // Intentar cada método hasta que uno funcione
      for (const method of methodsToTry) {
        try {
          console.log(`🔌 Intentando método: ${method.name} con path "${method.path}"...`);
          device = new USB(method.path);
          console.log(`✅ Dispositivo USB creado exitosamente con método: ${method.name}`);
          usbConnected = true;
          break;
        } catch (methodError) {
          console.warn(`⚠️  Método ${method.name} falló: ${methodError.message}`);
          // Continuar con el siguiente método
        }
      }
      
      // Si ningún método funcionó, lanzar error
      if (!usbConnected) {
        console.error(`❌ ========== TODOS LOS MÉTODOS FALLARON ==========`);
        console.error(`❌ Se intentaron ${methodsToTry.length} método(s) y ninguno funcionó`);
        console.error(`❌ Path configurado: "${path}"`);
        console.error(`❌ Posibles causas:`);
        console.error(`   1. El puerto/path es incorrecto`);
        console.error(`   2. La impresora no está conectada o encendida`);
        console.error(`   3. El puerto está siendo usado por otro programa`);
        console.error(`   4. Permisos insuficientes (ejecutar como Administrador)`);
        console.error(`   5. El driver de la impresora no está instalado correctamente`);
        console.error(`❌ Soluciones:`);
        console.error(`   - Verifica el puerto en Panel de Control > Dispositivos e impresoras`);
        console.error(`   - Si usas USB002, prueba con COM3, COM4, etc.`);
        console.error(`   - Ejecuta el servicio como Administrador`);
        console.error(`   - Verifica que la impresora esté encendida y conectada`);
        throw new Error(`No se pudo conectar a la impresora USB después de intentar ${methodsToTry.length} método(s). Path configurado: "${path}"`);
      }
    } else {
      throw new Error(`Tipo de impresora no válido: ${type}. Use 'network' o 'usb'`);
    }
    
    // Crear objeto Printer - esto también puede fallar
    try {
      console.log(`🔌 Creando objeto Printer con el dispositivo...`);
      const printer = new Printer(device);
      console.log(`✅ Objeto Printer creado correctamente`);
      console.log(`🔌 NOTA: La conexión física real se verificará al intentar imprimir`);
      return printer;
    } catch (printerError) {
      console.error(`❌ ERROR al crear objeto Printer:`);
      console.error(`   - Mensaje: ${printerError.message}`);
      console.error(`   - Tipo: ${printerError.name}`);
      console.error(`   - Stack: ${printerError.stack}`);
      throw new Error(`No se pudo crear objeto Printer: ${printerError.message}`);
    }
  } catch (error) {
    console.error(`❌ ========== ERROR CONECTANDO A IMPRESORA ==========`);
    console.error(`❌ Mensaje: ${error.message}`);
    console.error(`❌ Tipo: ${type}`);
    console.error(`❌ Path: ${path || 'NO CONFIGURADO'}`);
    console.error(`❌ IP: ${ip || 'NO CONFIGURADO'}`);
    console.error(`❌ Port: ${port || 'NO CONFIGURADO'}`);
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
  
  console.log(`📋 ========== INICIANDO IMPRESIÓN DE COMANDA ==========`);
  console.log(`📋 Orden: ${orden.numero_orden}`);
  console.log(`📋 Items: ${items.length}`);
  console.log(`📋 Configuración de impresora:`);
  console.log(`   - Tipo: ${KITCHEN_PRINTER_TYPE}`);
  console.log(`   - Path: ${KITCHEN_PRINTER_PATH || 'NO CONFIGURADO'}`);
  console.log(`   - IP: ${KITCHEN_PRINTER_IP || 'NO CONFIGURADO'}`);
  console.log(`   - Port: ${KITCHEN_PRINTER_PORT || 'NO CONFIGURADO'}`);
  
  const printer = connectPrinter(
    KITCHEN_PRINTER_TYPE,
    KITCHEN_PRINTER_PATH,
    KITCHEN_PRINTER_IP,
    KITCHEN_PRINTER_PORT
  );
  
  if (!printer) {
    const errorMsg = 'No se pudo conectar a la impresora de cocina';
    console.error(`❌ ${errorMsg}`);
    console.error(`❌ Verifica que:`);
    console.error(`   1. La impresora esté conectada y encendida`);
    console.error(`   2. El archivo .env tenga la configuración correcta:`);
    console.error(`      PRINTER_KITCHEN_TYPE=${KITCHEN_PRINTER_TYPE}`);
    if (KITCHEN_PRINTER_TYPE === 'network') {
      console.error(`      PRINTER_KITCHEN_IP=${KITCHEN_PRINTER_IP || 'FALTA'}`);
      console.error(`      PRINTER_KITCHEN_PORT=${KITCHEN_PRINTER_PORT || 'FALTA'}`);
    } else {
      console.error(`      PRINTER_KITCHEN_PATH=${KITCHEN_PRINTER_PATH || 'FALTA'}`);
    }
    throw new Error(errorMsg);
  }
  
  try {
    console.log(`📋 Preparando contenido de impresión...`);
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
    
    console.log(`📋 Encabezado preparado, agregando items...`);
    
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
    
    console.log(`📋 Contenido preparado, enviando a impresora...`);
    await printer.close();
    console.log(`✅ Comanda impresa correctamente: Orden ${orden.numero_orden}`);
    return { success: true, message: 'Comanda impresa correctamente' };
  } catch (error) {
    console.error('❌ ========== ERROR DURANTE LA IMPRESIÓN ==========');
    console.error('❌ Mensaje:', error.message);
    console.error('❌ Tipo:', error.name);
    console.error('❌ Stack:', error.stack);
    
    // Intentar cerrar la impresora si está abierta
    try {
      if (printer) {
        await printer.close();
        console.log('📋 Impresora cerrada después del error');
      }
    } catch (closeError) {
      console.error('❌ Error al cerrar impresora:', closeError.message);
    }
    
    // Proporcionar información útil según el tipo de error
    if (error.message && error.message.includes('ECONNREFUSED')) {
      console.error('❌ ERROR: No se pudo conectar a la impresora de red');
      console.error('   Verifica que la IP y puerto sean correctos');
      console.error('   Verifica que la impresora esté encendida y en la red');
    } else if (error.message && error.message.includes('ENOENT')) {
      console.error('❌ ERROR: No se encontró el dispositivo USB');
      console.error('   Verifica que el path sea correcto (ej: USB002, COM3)');
      console.error('   Verifica que la impresora esté conectada');
    } else if (error.message && error.message.includes('EACCES')) {
      console.error('❌ ERROR: Permisos insuficientes para acceder a la impresora');
      console.error('   En Windows, ejecuta el servicio como Administrador');
    }
    
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
  console.log('🔐 ========== VERIFICACIÓN DE TOKEN ==========');
  console.log('🔐 Header Authorization completo:', authHeader || 'NO HAY HEADER');
  console.log('🔐 Token esperado (completo):', API_TOKEN);
  console.log('🔐 Token esperado (longitud):', API_TOKEN.length);
  console.log('🔐 Token esperado (primeros 30):', API_TOKEN.substring(0, 30));
  console.log('🔐 Token esperado (últimos 10):', API_TOKEN.substring(Math.max(0, API_TOKEN.length - 10)));
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('❌ Token no proporcionado en header');
    console.error('❌ Header recibido:', authHeader || 'VACÍO');
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Token requerido' }));
    return;
  }
  
  const token = authHeader.replace('Bearer ', '').trim();
  console.log('🔐 Token recibido (completo):', token);
  console.log('🔐 Token recibido (longitud):', token.length);
  console.log('🔐 Token recibido (primeros 30):', token.substring(0, 30));
  console.log('🔐 Token recibido (últimos 10):', token.substring(Math.max(0, token.length - 10)));
  
  // Comparación carácter por carácter para debug
  const coinciden = token === API_TOKEN;
  console.log('🔐 Tokens son iguales?', coinciden);
  
  if (!coinciden) {
    // Encontrar la primera diferencia
    const minLen = Math.min(token.length, API_TOKEN.length);
    for (let i = 0; i < minLen; i++) {
      if (token[i] !== API_TOKEN[i]) {
        console.error(`❌ Diferencia en posición ${i}:`);
        console.error(`   Recibido: "${token[i]}" (código: ${token.charCodeAt(i)})`);
        console.error(`   Esperado: "${API_TOKEN[i]}" (código: ${API_TOKEN.charCodeAt(i)})`);
        break;
      }
    }
    if (token.length !== API_TOKEN.length) {
      console.error(`❌ Diferencia de longitud: recibido ${token.length}, esperado ${API_TOKEN.length}`);
    }
    
    console.error('❌ Token inválido - Comparación fallida');
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: 'Token inválido',
      debug: {
        recibido_length: token.length,
        esperado_length: API_TOKEN.length,
        primeros_recibido: token.substring(0, 10),
        primeros_esperado: API_TOKEN.substring(0, 10)
      }
    }));
    return;
  }
  console.log('✅ Token válido - Autenticación exitosa');
  
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
  console.log(`📋 ========== CONFIGURACIÓN DE IMPRESORAS ==========`);
  console.log(`📋 Impresora Cocina:`);
  console.log(`   - Tipo: ${KITCHEN_PRINTER_TYPE}`);
  if (KITCHEN_PRINTER_TYPE === 'network') {
    console.log(`   - IP: ${KITCHEN_PRINTER_IP || '❌ NO CONFIGURADO'}`);
    console.log(`   - Puerto: ${KITCHEN_PRINTER_PORT || '❌ NO CONFIGURADO'}`);
  } else {
    console.log(`   - Path: ${KITCHEN_PRINTER_PATH || '❌ NO CONFIGURADO'}`);
  }
  console.log(`📋 Impresora Caja:`);
  console.log(`   - Tipo: ${CASHIER_PRINTER_TYPE}`);
  if (CASHIER_PRINTER_TYPE === 'network') {
    console.log(`   - IP: ${CASHIER_PRINTER_IP || '❌ NO CONFIGURADO'}`);
    console.log(`   - Puerto: ${CASHIER_PRINTER_PORT || '❌ NO CONFIGURADO'}`);
  } else {
    console.log(`   - Path: ${CASHIER_PRINTER_PATH || '❌ NO CONFIGURADO'}`);
  }
  console.log(`📋 ================================================`);
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

