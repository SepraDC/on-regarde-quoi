// https://nuxt.com/docs/api/configuration/nuxt-config
const THIRTY_DAYS = 60 * 60 * 24 * 30

// Sur Vercel, le cache des films vit dans le Runtime Cache (régional, éphémère) ;
// ailleurs (dev, Raspberry Pi), dans des fichiers.
const filmCache = process.env.VERCEL
  ? { driver: 'vercel-runtime-cache', ttl: THIRTY_DAYS }
  : { driver: 'fs', base: './.data/cache' }

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/fonts', '@nuxtjs/i18n', '@vite-pwa/nuxt'],
  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'On regarde quoi ?',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#2a0d12' },
        { name: 'description', content: 'Tirez au sort le film de ce soir dans votre liste Letterboxd.' },
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
        { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon.png' },
      ],
    },
  },

  // Déclarées ici car les polices passent par des variables CSS, que @nuxt/fonts ne détecte pas.
  fonts: {
    families: [
      { name: 'Limelight', provider: 'google', weights: [400], global: true },
      { name: 'Courier Prime', provider: 'google', weights: [400, 700], global: true },
    ],
  },

  runtimeConfig: {
    tmdbToken: '',
  },

  vite: {
    optimizeDeps: { include: ['gsap'] },
  },

  nitro: {
    storage: { cache: filmCache },
    devStorage: { cache: { driver: 'fs', base: './.data/cache' } },
  },

  i18n: {
    locales: [
      { code: 'fr', language: 'fr-FR', name: 'Français', file: 'fr.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'fr',
    strategy: 'no_prefix',
    detectBrowserLanguage: { useCookie: true, cookieKey: 'orq_lang', fallbackLocale: 'fr' },
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'On regarde quoi ?',
      short_name: 'On regarde quoi',
      description: 'Tirez au sort le film de ce soir dans votre liste Letterboxd.',
      lang: 'fr',
      start_url: '/',
      display: 'standalone',
      orientation: 'portrait',
      background_color: '#2a0d12',
      theme_color: '#2a0d12',
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
      // Android : l'app installée apparaît dans le menu Partager. Letterboxd envoie le lien dans `text` ou `url`.
      share_target: {
        action: '/',
        method: 'GET',
        params: { title: 'title', text: 'text', url: 'url' },
      },
    },
    workbox: {
      navigateFallback: null,
      globPatterns: ['**/*.{js,css,png,svg,ico,woff2}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/(image\.tmdb\.org|a\.ltrbxd\.com)\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'posters',
            expiration: { maxEntries: 500, maxAgeSeconds: THIRTY_DAYS },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
      ],
    },
  },
})
