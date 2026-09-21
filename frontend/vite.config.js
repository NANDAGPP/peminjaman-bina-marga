import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost/ProjectBinaMarga',
        changeOrigin: true,
        secure: false,
      },
      '/images': {
        target: 'http://localhost/ProjectBinaMarga',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost/ProjectBinaMarga',
        changeOrigin: true,
        secure: false,
      },
      '/printpengaduan.php': {
        target: 'http://localhost/ProjectBinaMarga',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
