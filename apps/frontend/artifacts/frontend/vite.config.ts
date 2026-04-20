import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      port: env.PORT ? Number(env.PORT) : 5173,
      host: true
    },
    define: {
      'import.meta.env.BASE_PATH': JSON.stringify(env.BASE_PATH || '/')
    }
  }
})
