import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "uikit;/": path.resolve(__dirname, "./src/shared/ui"),
      "@": path.resolve(__dirname, "./src")
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', "react-router"],
          motion: ["motion"],
          redux: ["@reduxjs/toolkit", "react-redux"],
        }
      }
    }
  }
})
