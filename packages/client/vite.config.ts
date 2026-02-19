import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
