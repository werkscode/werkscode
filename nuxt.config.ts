import tailwindcss from '@tailwindcss/vite'

/// <reference path="./types/nuxt-modules.d.ts" />

const themeInitScript = `(function(){try{var k='werkscode-theme';var s=localStorage.getItem(k);var d=s==='dark'||(s!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d)}catch(e){}})()`

const optimizeDepsInclude = [
  '@lucide/vue',
  '@vueuse/core',
  'class-variance-authority',
  'clsx',
  'lucide-vue-next',
  'reka-ui',
  'tailwind-merge',
  'vue-sonner',
]

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: ['~/assets/css/tailwind.css'],

  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxtjs/i18n',
    'shadcn-nuxt',
  ],

  shadcn: {
    prefix: '',
    componentDir: '@/components/ui',
  },

  components: [
    {
      path: '~/components/layout',
      pathPrefix: false,
    },
  ],

  runtimeConfig: {
    databaseUrl: '',
    resendApiKey: '',
    contactNotifyEmail: '',
    contactFromEmail: '',
    contactAdminToken: '',
    public: {
      appUrl: '',
      githubUrl: 'https://github.com/werkscode/werkscode',
    },
  },

  i18n: {
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    locales: [
      { code: 'en', name: 'English', language: 'en-US', file: 'en.json' },
      { code: 'de', name: 'Deutsch', language: 'de-DE', file: 'de.json' },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    },
  },

  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', href: '/icon-32.png', sizes: '32x32' },
        { rel: 'icon', href: '/favicon.ico', sizes: '16x16 32x32 48x48' },
        { rel: 'apple-touch-icon', href: '/icon-180.png', sizes: '180x180' },
      ],
      meta: [
        { property: 'og:image', content: '/og.png' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: '/og.png' },
      ],
      script: [
        {
          key: 'theme-init',
          innerHTML: themeInitScript,
          type: 'text/javascript',
        },
      ],
    },
  },

  content: {
    build: {
      markdown: {
        toc: { depth: 3, searchDepth: 3 },
        highlight: {
          theme: {
            default: 'github-light',
            dark: 'github-dark',
          },
        },
      },
    },
    watch: { enabled: true },
  },

  devServer: {
    host: '0.0.0.0',
    port: 3000,
  },

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: optimizeDepsInclude,
    },
    server: {
      watch: {
        usePolling: process.env.CHOKIDAR_USEPOLLING === 'true',
      },
    },
  },

  hooks: {
    'vite:extendConfig': (config) => {
      if (config.server && typeof config.server.hmr === 'object') {
        config.server.hmr.clientPort = 3000
      }

      // @nuxtjs/mdc adds unresolvable nested optimizeDeps entries via @nuxt/content
      const include = config.optimizeDeps?.include ?? []
      config.optimizeDeps!.include = [
        ...new Set([
          ...optimizeDepsInclude,
          ...include.filter(dep => !dep.includes('@nuxtjs/mdc')),
        ]),
      ]
    },
  },
})
