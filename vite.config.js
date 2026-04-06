import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    proxy: {
      '/auth': 'http://localhost:3000',
      '/babies': 'http://localhost:3000',
      '/events': 'http://localhost:3000',
      '/admin': 'http://localhost:3000',
      '/chat': 'http://localhost:3000',
      '/api': 'http://localhost:8000',
    },
  },
});
