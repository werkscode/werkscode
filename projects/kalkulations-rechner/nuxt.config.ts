import tailwindcss from '@tailwindcss/vite'

const themeInitScript = `(function(){try{var k='kalkulations-theme';var s=localStorage.getItem(k);var d=s==='dark'||(s!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d)}catch(e){}})()`

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/tailwind.css'],
  modules: ['@pinia/nuxt', 'pinia-plugin-persistedstate/nuxt', 'shadcn-nuxt'],
  runtimeConfig: {
    stepConverterUrl: 'http://localhost:8000',
    public: {
      // NUXT_PUBLIC_PERSISTENCE_ENABLED=true enables DB save/setup/history (local only by default)
      persistenceEnabled: false,
      githubUrl: 'https://github.com/werkscode/werkscode/tree/main/projects/kalkulations-rechner',
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
  build: {
    transpile: ['three'],
  },
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        '@lucide/vue',
        '@vueuse/core',
        'clsx',
        'reka-ui',
        'tailwind-merge',
        'vue-sonner',
      ],
    },
  },
  shadcn: {
    prefix: '',
    componentDir: '@/components/ui',
  },
})
