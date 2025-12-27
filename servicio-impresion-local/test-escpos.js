const escpos = require('escpos');

console.log('========================================');
console.log('  VERIFICACION DE escpos');
console.log('========================================');
console.log('');

console.log('Tipo de escpos:', typeof escpos);
console.log('Keys de escpos:', Object.keys(escpos).join(', '));
console.log('');

// Explorar la función create si existe
if (escpos.create) {
  console.log('✅ Función "create" encontrada');
  console.log('   Tipo:', typeof escpos.create);
  console.log('   Intentando explorar qué puede crear...');
  
  // Intentar ver si create puede crear USB o Network
  try {
    // Verificar si create acepta 'usb' o 'USB'
    console.log('   Probando escpos.create("usb")...');
    // No ejecutamos, solo verificamos que existe
  } catch (e) {
    console.log('   Error:', e.message);
  }
}
console.log('');

// Verificar si hay módulos separados
console.log('Buscando módulos adicionales...');
try {
  const escposUSB = require('escpos-usb');
  console.log('✅ escpos-usb encontrado:', typeof escposUSB);
  console.log('   Keys:', Object.keys(escposUSB).join(', '));
} catch (e) {
  console.log('❌ escpos-usb NO encontrado (puede necesitar instalación)');
}

try {
  const escposNetwork = require('escpos-network');
  console.log('✅ escpos-network encontrado:', typeof escposNetwork);
  console.log('   Keys:', Object.keys(escposNetwork).join(', '));
} catch (e) {
  console.log('❌ escpos-network NO encontrado (puede necesitar instalación)');
}
console.log('');

// Verificar USB
if (escpos.USB) {
  console.log('✅ USB encontrado en escpos.USB');
  console.log('   Tipo:', typeof escpos.USB);
} else if (escpos.default && escpos.default.USB) {
  console.log('✅ USB encontrado en escpos.default.USB');
  console.log('   Tipo:', typeof escpos.default.USB);
} else {
  console.error('❌ USB NO encontrado directamente');
  console.log('   Intentando buscar en otras ubicaciones...');
  
  // Buscar recursivamente
  function buscarEnObjeto(obj, nombre, ruta = '') {
    for (const key in obj) {
      if (key === nombre) {
        console.log(`   ✅ Encontrado en: ${ruta}.${key}`);
        return obj[key];
      }
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        buscarEnObjeto(obj[key], nombre, ruta ? `${ruta}.${key}` : key);
      }
    }
  }
  buscarEnObjeto(escpos, 'USB');
}

// Verificar Printer
if (escpos.Printer) {
  console.log('✅ Printer encontrado en escpos.Printer');
  console.log('   Tipo:', typeof escpos.Printer);
} else if (escpos.default && escpos.default.Printer) {
  console.log('✅ Printer encontrado en escpos.default.Printer');
  console.log('   Tipo:', typeof escpos.default.Printer);
} else {
  console.error('❌ Printer NO encontrado');
}

// Verificar Network
if (escpos.Network) {
  console.log('✅ Network encontrado en escpos.Network');
  console.log('   Tipo:', typeof escpos.Network);
} else if (escpos.default && escpos.default.Network) {
  console.log('✅ Network encontrado en escpos.default.Network');
  console.log('   Tipo:', typeof escpos.default.Network);
} else {
  console.error('❌ Network NO encontrado directamente');
}

console.log('');
console.log('========================================');
console.log('');
console.log('RECOMENDACION:');
console.log('Si USB y Network no están disponibles, puede que necesites:');
console.log('1. Instalar módulos separados: npm install escpos-usb escpos-network');
console.log('2. O usar la función create() si está disponible');
console.log('3. O cambiar a una versión diferente de escpos');

