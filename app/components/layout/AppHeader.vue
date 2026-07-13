<script setup lang="ts">
import { Menu } from 'lucide-vue-next'

const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()

const navItems = computed(() => [
  { label: t('nav.home'), to: localePath('/') },
  { label: t('nav.blog'), to: localePath('/blog') },
  { label: t('nav.portfolio'), to: localePath('/portfolio') },
  { label: t('nav.about'), to: localePath('/about') },
  { label: t('nav.contact'), to: localePath('/contact') },
])

const mobileOpen = ref(false)

function isActive(path: string) {
  if (path === localePath('/')) {
    return route.path === localePath('/')
  }
  return route.path.startsWith(path)
}
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
    <div class="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
      <NuxtLink :to="localePath('/')" class="inline-flex items-center">
        <AppLogo variant="wordmark" size="sm" />
      </NuxtLink>

      <nav class="hidden items-center gap-1 md:flex">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          :class="isActive(item.to) ? 'bg-accent/60 text-primary' : 'text-muted-foreground'"
        >
          {{ item.label }}
        </NuxtLink>
        <LanguageSwitcher />
        <ThemeToggle />
      </nav>

      <div class="flex items-center gap-2 md:hidden">
        <LanguageSwitcher />
        <ThemeToggle />
        <Sheet v-model:open="mobileOpen">
          <SheetTrigger as-child>
            <Button variant="ghost" size="icon" :aria-label="t('nav.openMenu')">
              <Menu class="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" class="w-64">
            <SheetHeader>
              <SheetTitle class="sr-only">{{ t('nav.menu') }}</SheetTitle>
              <AppLogo variant="wordmark" size="sm" />
            </SheetHeader>
            <nav class="mt-6 flex flex-col gap-2">
              <NuxtLink
                v-for="item in navItems"
                :key="item.to"
                :to="item.to"
                class="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                :class="isActive(item.to) ? 'bg-accent/60 text-primary' : 'text-muted-foreground'"
                @click="mobileOpen = false"
              >
                {{ item.label }}
              </NuxtLink>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  </header>
</template>
