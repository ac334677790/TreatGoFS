import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import VitePluginSitemap from 'vite-plugin-sitemap';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),
    VitePluginSitemap({
      hostname: 'https://tubosu.com',
      dynamicRoutes: [
        '/',
        '/overview',
        '/about',
        '/contact',
        '/login',
        '/privacy',
        '/terms',
      ],
    }),
  ],
  server: {
    port: 5173,
    strictPort: true,
    // Ensure we're using HTTP for local development
    https: false
  }
})