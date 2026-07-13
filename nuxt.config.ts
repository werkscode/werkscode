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
    public: {
      appUrl: '',
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
      config.optimizeDeps = {
        ...config.optimizeDeps,
        include: [
          ...new Set([
            ...optimizeDepsInclude,
            ...include.filter(dep => !dep.includes('@nuxtjs/mdc')),
          ]),
        ],
      }
    },
  },
})
