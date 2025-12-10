import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { fileURLToPath } from 'url';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['catetyuk2.ico', 'robots.txt'],
      manifest: {
        name: 'CatetYuk',
        short_name: 'CatetYuk',
        description: 'CatetYuk - simplify your task',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'catetyuk2.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'catetyuk2.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8787'
    }
  }
});
