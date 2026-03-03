import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendUrl = env.VITE_API_URL as string;

  return {
    base: '/display/',
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true, 
      watch: {
        usePolling: true,
      },
      hmr: {
        protocol: 'ws',
        port: 5173,
      },
      proxy: {
        '/api': {
          target: backendUrl,
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
  };
});
