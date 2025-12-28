/**
 * Script para probar la conexión a Supabase
 * Ejecutar: node test-supabase-conexion.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('========================================');
console.log('  TEST DE CONEXIÓN A SUPABASE');
console.log('========================================\n');

console.log('📋 Verificando configuración...');
console.log(`   SUPABASE_URL: ${SUPABASE_URL ? SUPABASE_URL.substring(0, 40) + '...' : '❌ NO CONFIGURADO'}`);
console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY ? SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...' : '❌ NO CONFIGURADO'}`);
console.log('');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ ERROR: Faltan variables de configuración');
  console.error('   Verifica que el archivo .env tenga:');
  console.error('   - SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

if (SUPABASE_URL.includes('tu-proyecto.supabase.co')) {
  console.error('❌ ERROR: SUPABASE_URL tiene valor de ejemplo');
  console.error('   Reemplaza con tu URL real de Supabase');
  process.exit(1);
}

if (SUPABASE_SERVICE_ROLE_KEY.includes('tu-service-role-key')) {
  console.error('❌ ERROR: SUPABASE_SERVICE_ROLE_KEY tiene valor de ejemplo');
  console.error('   Reemplaza con tu service_role key real');
  process.exit(1);
}

console.log('🔍 Creando cliente de Supabase...');
let supabase;
try {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  console.log('✅ Cliente creado correctamente\n');
} catch (error) {
  console.error('❌ Error creando cliente:', error.message);
  process.exit(1);
}

console.log('🔍 Probando conexión a Supabase...');
console.log('   Consultando tabla ordenes_restaurante...\n');

(async () => {
  try {
    const { data, error } = await supabase
      .from('ordenes_restaurante')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ ERROR DE CONEXIÓN:');
      console.error(`   Mensaje: ${error.message}`);
      console.error(`   Código: ${error.code || 'N/A'}`);
      console.error(`   Detalles: ${error.details || 'N/A'}`);
      console.error(`   Hint: ${error.hint || 'N/A'}`);
      
      if (error.message.includes('fetch failed')) {
        console.error('\n🔍 DIAGNÓSTICO:');
        console.error('   - Verifica que la URL sea correcta');
        console.error('   - Verifica que la SERVICE_ROLE_KEY sea correcta');
        console.error('   - Verifica tu conexión a internet');
        console.error('   - Verifica que no haya firewall bloqueando');
      }
      
      process.exit(1);
    } else {
      console.log('✅ CONEXIÓN EXITOSA!');
      console.log(`   Se pudo consultar la tabla ordenes_restaurante`);
      console.log(`   Resultado: ${data ? data.length + ' registro(s) encontrado(s)' : 'Sin datos'}`);
      console.log('\n✅ Supabase está configurado correctamente!');
      process.exit(0);
    }
  } catch (testError) {
    console.error('❌ ERROR EN TEST:');
    console.error(`   Mensaje: ${testError.message}`);
    console.error(`   Stack: ${testError.stack}`);
    process.exit(1);
  }
})();



