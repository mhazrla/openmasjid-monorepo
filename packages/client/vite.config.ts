import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true, // Paksa harus di port 5173
    watch: {
      usePolling: true,
    },
    hmr: {
      // Hilangkan 'host: localhost'
      protocol: 'ws',
      port: 5173,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    rollupOptions: 
    {
      output: 
      {
        manualChunks(id) 
        {
          if (id.includes('node_modules')) 
          {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor';
            }
            if (
              id.includes('lucide-react') || 
              id.includes('sonner') || 
              id.includes('tailwind-merge') || 
              id.includes('clsx') || 
              id.includes('react-fast-marquee')
            ) 
            {
              return 'ui-vendor';
            }
            if (
              id.includes('@tanstack/react-query') || 
              id.includes('@tanstack/react-table') || 
              id.includes('axios') || 
              id.includes('date-fns') ||
              id.includes('zod')
            ) 
            {
              return 'utils-vendor';
            }
          }
        },
      },
    },
  },
})
