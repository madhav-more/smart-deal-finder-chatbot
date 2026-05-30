import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// live - https://smart-deal-finder-chatbot-backend-2.vercel.app/
// local - http://localhost:5001
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),],
  server: {
    proxy: {
      '/api': {
        target: 'https://10.61.141.48:5001',
        changeOrigin: true,
      },
    },
  },
})
