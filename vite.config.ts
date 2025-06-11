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
          // Don't rewrite the path since the backend expects /api prefix
          rewrite: (path) => path.replace(/^\/api/, '/api')
        }
      }
    }
  }
})
