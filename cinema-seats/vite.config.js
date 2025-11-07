import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Replace 'cinema' with your repo name exactly
export default defineConfig({
  plugins: [react()],
  base: '/cinema/',   // <-- IMPORTANT
})