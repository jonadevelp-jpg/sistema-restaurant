// Script para probar diferentes formas de conectar con vport-usb:
const escpos = require('escpos');
const USB = escpos.USB;
const Printer = escpos.Printer;

console.log('========================================');
console.log('  PRUEBA DE CONEXIÓN USB - vport-usb:');
console.log('========================================\n');

// Método 1: Intentar con vport-usb: directamente
console.log('[1] Intentando con "vport-usb:"...');
try {
  const device1 = new USB('vport-usb:');
  if (device1 && typeof device1.on === 'function') {
    console.log('✅ ÉXITO con "vport-usb:"');
    process.exit(0);
  } else {
    console.log('❌ Dispositivo creado pero no tiene método on()');
  }
} catch (e) {
  console.log(`❌ Error: ${e.message}`);
}

// Método 2: Intentar con vport-usb (sin dos puntos)
console.log('\n[2] Intentando con "vport-usb"...');
try {
  const device2 = new USB('vport-usb');
  if (device2 && typeof device2.on === 'function') {
    console.log('✅ ÉXITO con "vport-usb"');
    process.exit(0);
  } else {
    console.log('❌ Dispositivo creado pero no tiene método on()');
  }
} catch (e) {
  console.log(`❌ Error: ${e.message}`);
}

// Método 3: Buscar dispositivo con findPrinter()
console.log('\n[3] Buscando dispositivos con USB.findPrinter()...');
try {
  const devices = USB.findPrinter();
  if (devices && devices.length > 0) {
    console.log(`✅ Se encontraron ${devices.length} dispositivo(s):`);
    devices.forEach((dev, idx) => {
      console.log(`   ${idx + 1}. ${JSON.stringify(dev, null, 2)}`);
    });
    
    // Intentar usar el primer dispositivo
    console.log('\n[3a] Intentando usar dispositivo encontrado directamente...');
    try {
      const device3 = new USB(devices[0]);
      if (device3 && typeof device3.on === 'function') {
        console.log('✅ ÉXITO usando dispositivo encontrado directamente');
        process.exit(0);
      } else {
        console.log('❌ Dispositivo creado pero no tiene método on()');
      }
    } catch (e) {
      console.log(`❌ Error: ${e.message}`);
    }
    
    // Intentar con vendorId y productId
    console.log('\n[3b] Intentando con vendorId/productId...');
    try {
      const dev = devices[0];
      if (dev.deviceDescriptor) {
        const vid = dev.deviceDescriptor.idVendor;
        const pid = dev.deviceDescriptor.idProduct;
        console.log(`   Vendor ID: ${vid}, Product ID: ${pid}`);
        const device4 = new USB(vid, pid);
        if (device4 && typeof device4.on === 'function') {
          console.log('✅ ÉXITO usando vendorId/productId');
          process.exit(0);
        } else {
          console.log('❌ Dispositivo creado pero no tiene método on()');
        }
      }
    } catch (e) {
      console.log(`❌ Error: ${e.message}`);
    }
    
    // Intentar crear sin parámetros y luego abrir
    console.log('\n[3c] Intentando crear USB() sin parámetros y luego abrir...');
    try {
      const device5 = new USB();
      if (device5.open && typeof device5.open === 'function') {
        device5.open(devices[0]);
        if (device5 && typeof device5.on === 'function') {
          console.log('✅ ÉXITO usando open()');
          process.exit(0);
        } else {
          console.log('❌ Dispositivo abierto pero no tiene método on()');
        }
      } else {
        console.log('❌ USB() no tiene método open()');
      }
    } catch (e) {
      console.log(`❌ Error: ${e.message}`);
    }
  } else {
    console.log('❌ No se encontraron dispositivos USB');
  }
} catch (e) {
  console.log(`❌ Error en findPrinter(): ${e.message}`);
}

// Método 4: Intentar con el nombre de la impresora
console.log('\n[4] Para usar el nombre de la impresora:');
console.log('   - Ve a Panel de Control > Dispositivos e impresoras');
console.log('   - Busca el nombre exacto de tu impresora');
console.log('   - Úsalo en lugar de "vport-usb:"');

console.log('\n========================================');
console.log('  RESULTADO: Ningún método funcionó');
console.log('========================================');
console.log('\nRecomendaciones:');
console.log('1. Verifica el puerto en Panel de Control');
console.log('2. Prueba usar el nombre de la impresora');
console.log('3. Verifica que la impresora esté encendida');
console.log('4. Ejecuta como Administrador');



