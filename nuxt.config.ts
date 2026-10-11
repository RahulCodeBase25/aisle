export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  modules: ['@nuxt/ui', '@pinia/nuxt', '@nuxt/image'],
  css: ['~/assets/css/main.css'],
  devtools: { enabled: false },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Aisle — a better place to shop',
      meta: [
        { name: 'description', content: 'Aisle is a fast, friendly online store demo built with Nuxt 4, Vue 3 and Nuxt UI: faceted search, a command palette, a slide-over cart and a server-priced checkout.' },
        { name: 'theme-color', content: '#f5f2ec' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
  image: { domains: ['cdn.dummyjson.com'], format: ['webp'] },
  icon: { serverBundle: { collections: ['lucide'] } },
  routeRules: {
    // Pages are rendered on the server and cached at the edge, refreshed in the background
    '/': { swr: 3600 },
    '/p/**': { swr: 3600 },
    '/api/home': { swr: 3600 },
    '/api/products/**': { swr: 3600 },
    '/checkout': { ssr: false },
  },
})
