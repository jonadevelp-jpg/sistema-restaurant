const escpos = require('escpos');
let USB, Printer;

// Intentar diferentes formas de importación
if (escpos.USB) {
  USB = escpos.USB;
  Printer = escpos.Printer;
} else if (escpos.default && escpos.default.USB) {
  USB = escpos.default.USB;
  Printer = escpos.default.Printer;
} else {
  ({ USB, Printer } = escpos);
}

if (!USB || typeof USB !== 'function') {
  console.error('ERROR: USB no está disponible');
  console.error('Verifica que escpos esté instalado: npm install escpos');
  process.exit(1);
}

console.log('========================================');
console.log('  PRUEBA DE CONEXION USB');
console.log('========================================');
console.log('');

const pathsToTry = [];

// Obtener puerto de argumentos de línea de comandos
const printerPort = process.argv[2];

// Agregar el puerto encontrado
if (printerPort) {
  pathsToTry.push(printerPort);
  console.log('Puerto encontrado:', printerPort);
  
  // Si es USB002, USB003, etc., también probar sin prefijo
  if (printerPort.toUpperCase().startsWith('USB')) {
    const numericPart = printerPort.replace(/^USB/i, '');
    pathsToTry.push(numericPart);
    console.log('También probando sin prefijo USB:', numericPart);
  }
}

// Intentar COM3, COM4, COM5, COM6
for (let i = 3; i <= 6; i++) {
  pathsToTry.push('COM' + i);
}

console.log('');
console.log('Intentando conectar con los siguientes paths:');
pathsToTry.forEach((p, i) => console.log(`  ${i+1}. ${p}`));
console.log('');

let connected = false;

for (const path of pathsToTry) {
  try {
    console.log(`Intentando con: ${path}...`);
    const device = new USB(path);
    console.log(`✅ Dispositivo USB creado exitosamente con: ${path}`);
    const printer = new Printer(device);
    console.log(`✅ Printer creado exitosamente`);
    console.log(`🎉 SUCCESS: El puerto correcto es: ${path}`);
    console.log(`📝 Actualiza tu .env con: PRINTER_KITCHEN_PATH=${path}`);
    connected = true;
    break;
  } catch (error) {
    console.log(`❌ ${path} falló: ${error.message}`);
  }
}

if (!connected) {
  console.error('❌ No se pudo conectar con ningún puerto');
  console.error('Verifica que:');
  console.error('  1. La impresora esté encendida y conectada');
  console.error('  2. El driver esté instalado correctamente');
  console.error('  3. La impresora no esté siendo usada por otro programa');
  process.exit(1);
}



