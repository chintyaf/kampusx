import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc' // (Biarkan baris ini apa adanya sesuai bawaan file Anda)
import tailwindcss from '@tailwindcss/vite' // 1. Tambahkan baris import ini

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // 2. Tambahkan baris ini di dalam kurung siku plugins
  ],
})