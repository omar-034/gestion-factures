import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild', // Changez de 'terser' à 'esbuild' (recommandé)
    target: 'esnext'
  },
  server: {
    host: true
  }
})