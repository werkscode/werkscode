import type { ModuleOptions as I18nModuleOptions } from '@nuxtjs/i18n'
import type { ModuleOptions as ShadcnModuleOptions } from 'shadcn-nuxt'

declare module 'nuxt/schema' {
  interface NuxtConfig {
    shadcn?: ShadcnModuleOptions
    i18n?: I18nModuleOptions
  }
}

declare module '@nuxt/schema' {
  interface NuxtConfig {
    shadcn?: ShadcnModuleOptions
    i18n?: I18nModuleOptions
  }
}

export {}
