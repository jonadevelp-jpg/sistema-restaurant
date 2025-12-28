#!/usr/bin/env node

/**
 * Script de verificación pre-deploy
 * Verifica que el proyecto esté listo para deploy
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const errors = [];
const warnings = [];

console.log('🔍 Verificando proyecto para deploy...\n');

// 1. Verificar que .env no esté en el repo
if (existsSync('.env')) {
  warnings.push('⚠️  Archivo .env encontrado. Asegúrate de que esté en .gitignore');
} else {
  console.log('✅ No hay archivo .env (correcto)');
}

// 2. Verificar .gitignore
if (existsSync('.gitignore')) {
  const gitignore = readFileSync('.gitignore', 'utf-8');
  if (!gitignore.includes('.env')) {
    errors.push('❌ .gitignore no incluye .env');
  } else {
    console.log('✅ .gitignore incluye .env');
  }
} else {
  errors.push('❌ No existe .gitignore');
}

// 3. Verificar package.json
if (existsSync('package.json')) {
  const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
  if (!pkg.scripts?.build) {
    errors.push('❌ package.json no tiene script "build"');
  } else {
    console.log('✅ package.json tiene script "build"');
  }
  
  if (!pkg.engines?.node) {
    warnings.push('⚠️  package.json no especifica versión de Node.js');
  } else {
    console.log(`✅ package.json especifica Node.js ${pkg.engines.node}`);
  }
} else {
  errors.push('❌ No existe package.json');
}

// 4. Verificar vercel.json
if (existsSync('vercel.json')) {
  console.log('✅ vercel.json existe');
} else {
  warnings.push('⚠️  No existe vercel.json (Vercel puede detectar Astro automáticamente)');
}

// 5. Verificar astro.config.mjs
if (existsSync('astro.config.mjs')) {
  const config = readFileSync('astro.config.mjs', 'utf-8');
  if (!config.includes('@astrojs/vercel')) {
    warnings.push('⚠️  astro.config.mjs no incluye adapter de Vercel');
  } else {
    console.log('✅ astro.config.mjs incluye adapter de Vercel');
  }
} else {
  errors.push('❌ No existe astro.config.mjs');
}

// 6. Verificar .env.example
if (existsSync('.env.example')) {
  console.log('✅ .env.example existe');
} else {
  warnings.push('⚠️  No existe .env.example (recomendado para documentar variables)');
}

// Resumen
console.log('\n📊 Resumen:\n');

if (warnings.length > 0) {
  console.log('⚠️  Advertencias:');
  warnings.forEach(w => console.log(`   ${w}`));
  console.log('');
}

if (errors.length > 0) {
  console.log('❌ Errores (debes corregirlos antes de hacer deploy):');
  errors.forEach(e => console.log(`   ${e}`));
  console.log('');
  process.exit(1);
} else {
  console.log('✅ ¡Proyecto listo para deploy!\n');
  console.log('📝 Próximos pasos:');
  console.log('   1. git add .');
  console.log('   2. git commit -m "Preparado para deploy"');
  console.log('   3. git push origin main');
  console.log('   4. Importar en Vercel y configurar variables de entorno');
  console.log('\n📖 Ver DEPLOY.md para instrucciones detalladas\n');
  process.exit(0);
}



