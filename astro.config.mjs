import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://astro.build/config
export default defineConfig({
  integrations: [
    react({
      include: ['**/react/**'],
      experimentalReactChildren: true,
    }), 
    tailwind()
  ],
  output: 'server',
  adapter: vercel(),
  vite: {
    resolve: {
      alias: {
        '@backend': path.resolve(__dirname, './backend/src'),
        '@': path.resolve(__dirname, './src'),
      },
      // Asegurar que las extensiones .ts se resuelvan correctamente
      extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
    },
    // Incluir archivos del backend y src en el build
    build: {
      rollupOptions: {
        // No excluir archivos del backend o src
<<<<<<< HEAD
      },
    },
    build: {
      rollupOptions: {
        // Marcar printer-service como external para evitar que Rollup intente resolverlo
        external: (id) => {
          // Si es una importación dinámica de printer-service, marcarla como external
          if (id.includes('printer-service') || id.includes('../../src/lib/printer-service')) {
            return true;
          }
          return false;
        },
        onwarn(warning, warn) {
          // Ignorar advertencias sobre importaciones dinámicas no resueltas de printer-service
          if (
            (warning.code === 'UNRESOLVED_IMPORT' || warning.code === 'CIRCULAR_DEPENDENCY') &&
            (warning.id?.includes('printer-service') || warning.message?.includes('printer-service'))
          ) {
            return;
          }
          warn(warning);
        },
=======
>>>>>>> dd47a5b19273f5df884acaecad7c9e9393285722
      },
    },
  },
});

