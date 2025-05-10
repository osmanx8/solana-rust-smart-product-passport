import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  root: './', // Основна директорія
  plugins: [react()],
  esbuild: {
    loader: 'jsx', // Ось так вказується тип loader
    include: /\.jsx?$/, // Це дасть можливість обробляти всі файли .js та .jsx
  },
  server: {
    port: 3000, // Порт сервера
  },
});
