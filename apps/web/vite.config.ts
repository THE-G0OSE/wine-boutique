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

/**
 * Превью ссылки в мессенджерах и соцсетях (Open Graph): им нужен абсолютный адрес картинки,
 * поэтому теги появляются, только когда сборке известен адрес сайта (SITE_URL, задаёт CI)
 */
const socialMeta = (siteUrl: string | undefined): Plugin => {
  const site = siteUrl ? new URL(siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`) : null
  const meta = (property: string, content: string) => ({ tag: 'meta', attrs: { property, content }, injectTo: 'head' as const })
  return {
    name: 'social-meta',
    apply: 'build',
    transformIndexHtml: (html) => {
      if (!site) return []
      const title = /<title>(.*?)<\/title>/.exec(html)?.[1] ?? ''
      const description = /<meta name="description" content="(.*?)"/.exec(html)?.[1] ?? ''
      return [
        meta('og:type', 'website'),
        meta('og:locale', 'ru_RU'),
        meta('og:site_name', 'Premium Wine Boutique'),
        meta('og:title', title),
        meta('og:description', description),
        meta('og:url', site.href),
        meta('og:image', new URL('og-image.jpg', site).href),
        meta('og:image:width', '1200'),
        meta('og:image:height', '630'),
        { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' }, injectTo: 'head' },
      ]
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname)
  return {
    // Путь, с которого раздаётся сайт: «/» локально и на своём домене, «/wine-boutique/» на GitHub Pages (задаёт CI)
    base: process.env.BASE_PATH || "/",
    plugins: [react(), tailwindcss(), securityMeta(env.VITE_API_URL || "/api"), socialMeta(process.env.SITE_URL)],
    // С VITE_API_MOCKS=false запросы /api идут в бэкенд из deploy/compose (Traefik на :18080)
    server: {
      proxy: { "/api": { target: process.env.API_PROXY_TARGET || "http://localhost:18080", changeOrigin: true } },
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
