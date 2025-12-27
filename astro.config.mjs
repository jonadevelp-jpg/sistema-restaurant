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
      },
    },
  },
});

