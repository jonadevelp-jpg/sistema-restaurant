/**
 * Script de prueba simple para verificar la impresión
 */

const { ESCPOSFormatter, printRaw, printerExists } = require('./printer-module');

async function testPrint() {
  const printerName = process.env.PRINTER_CASHIER_NAME || 'POS58';
  
  console.log('========================================');
  console.log('  TEST DE IMPRESIÓN SIMPLE');
  console.log('========================================\n');
  
  console.log(`Impresora: ${printerName}`);
  
  // Verificar que la impresora existe
  const exists = await printerExists(printerName);
  if (!exists) {
    console.error(`❌ Impresora "${printerName}" no encontrada`);
    process.exit(1);
  }
  
  console.log(`✅ Impresora encontrada\n`);
  
  // Crear un documento de prueba simple
  const formatter = new ESCPOSFormatter();
  
  formatter
    .init()
    .alignCenter()
    .sizeDouble()
    .text('TEST DE IMPRESION')
    .sizeNormal()
    .feed(1)
    .separator()
    .alignLeft()
    .text('Este es un test de impresion')
    .text('Si ves este texto completo,')
    .text('la impresion funciona correctamente')
    .feed(2)
    .separator()
    .alignCenter()
    .text('Fecha: ' + new Date().toLocaleString('es-CL'))
    .feed(3)
    .cut();
  
  const printData = formatter.getBuffer();
  
  console.log(`Tamaño del buffer: ${printData.length} bytes`);
  console.log(`Primeros 30 bytes: ${Array.from(printData.slice(0, 30)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' ')}`);
  console.log('\nEnviando a impresora...\n');
  
  try {
    await printRaw(printerName, printData);
    console.log('\n✅ TEST COMPLETADO');
    console.log('   Revisa la impresora para verificar que se imprimió correctamente');
  } catch (error) {
    console.error('\n❌ ERROR EN TEST:');
    console.error(`   ${error.message}`);
    if (error.stderr) {
      console.error(`   Detalles: ${error.stderr}`);
    }
    process.exit(1);
  }
}

testPrint();



