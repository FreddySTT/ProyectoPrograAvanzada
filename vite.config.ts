import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH || (process.env.GITHUB_ACTIONS ? '/ProyectoPrograAvanzada/' : '/'),
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
  },
  server: {
    watch: {
      // Excluir carpetas que no son parte del proyecto Vite/React
      ignored: ['**/flask-crud/**', '**/pokedex/**', '**/.git/**'],
    },
  },
});