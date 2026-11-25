import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteSingleFile from 'vite-plugin-singlefile'

export default defineConfig({
  root: 'src/client',
  plugins: [
    react(),
    viteSingleFile({
      fileName: 'index',
      includeCss: ['src/client/**/*.css'],
      minify: true
    })
  ],
  build: {
    outDir: '../../dist',
    emptyOutDir: false,
    rolloutOptions: {
      output: {
        inlineDynamicImports: true
      }
    }
  }
})