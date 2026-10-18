import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

/**
 * GitHub Pages не умеет отдавать заголовки, поэтому CSP — мета-тегом, и только в сборке:
 * в dev Vite вставляет инлайн-скрипт HMR, который такая политика заблокировала бы.
 * Стили 'unsafe-inline' нужны атрибутам style (React, motion). Если API на другом домене
 * (VITE_API_URL с адресом), его origin попадает в connect-src.
 */
const securityMeta = (apiUrl: string): Plugin => {
  const apiOrigin = /^https?:\/\//.test(apiUrl) ? ` ${new URL(apiUrl).origin}` : ''
  const csp = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src 'self'${apiOrigin}`,
    "worker-src 'self'",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')
  return {
    name: 'security-meta',
    apply: 'build',
    transformIndexHtml: () => [
      { tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: csp }, injectTo: 'head-prepend' },
      { tag: 'meta', attrs: { name: 'referrer', content: 'strict-origin-when-cross-origin' }, injectTo: 'head-prepend' },
    ],
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname)
  return {
    // Путь, с которого раздаётся сайт: «/» локально и на своём домене, «/wine-boutique/» на GitHub Pages (задаёт CI)
    base: process.env.BASE_PATH || "/",
    plugins: [react(), tailwindcss(), securityMeta(env.VITE_API_URL || "/api")],
    // С VITE_API_MOCKS=false запросы /api идут в бэкенд из deploy/compose (Traefik на :8080)
    server: {
      proxy: { "/api": { target: process.env.API_PROXY_TARGET || "http://localhost:8080", changeOrigin: true } },
    },
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
  }
})
