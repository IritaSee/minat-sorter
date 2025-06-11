import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables based on mode
  const env = loadEnv(mode, process.cwd())
  
  return {
    plugins: [react()],
    // Add a proxy for development to help with CORS
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:5000',
          changeOrigin: true,
          // Properly strip the /api prefix because it's already in the target URL
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    // Optimize for production builds
    build: {
      outDir: 'dist',
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'dnd-kit': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities']
          }
        }
      },
      // Ensure assets are correctly handled
      assetsDir: 'assets'
    }
  }
})
