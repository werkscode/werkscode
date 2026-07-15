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
  { label: t('nav.transparency'), to: localePath('/transparency') },
  { label: t('nav.contact'), to: localePath('/contact') },
])

const mobileNavItems = computed(() =>
  navItems.value.filter(item => item.to !== localePath('/contact')),
)

const mobileOpen = ref(false)

function isActive(path: string) {
  if (path === localePath('/')) {
    return route.path === localePath('/')
  }
  return route.path.startsWith(path)
}
</script>

<template>
  <header class="sticky top-0 z-50 border-b-2 border-foreground/10 bg-background/90 backdrop-blur-md">
    <div class="mx-auto max-w-6xl px-4 sm:px-6">
      <div class="flex h-14 items-center justify-between gap-4 border-b border-border/60">
        <NuxtLink
          :to="localePath('/')"
          class="inline-flex min-w-0 items-center rounded-sm outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <AppLogo variant="wordmark" size="sm" />
        </NuxtLink>

        <div class="flex shrink-0 items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
          <Sheet v-model:open="mobileOpen">
            <SheetTrigger as-child>
              <Button variant="ghost" size="icon" class="md:hidden" :aria-label="t('nav.openMenu')">
                <Menu class="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" class="w-72">
              <SheetHeader>
                <SheetTitle class="sr-only">{{ t('nav.menu') }}</SheetTitle>
                <AppLogo variant="wordmark" size="sm" />
              </SheetHeader>
              <nav class="mt-8 flex flex-col gap-1">
                <NuxtLink
                  v-for="item in mobileNavItems"
                  :key="item.to"
                  :to="item.to"
                  class="rounded-sm px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
                  :class="isActive(item.to) ? 'bg-accent text-foreground' : 'text-muted-foreground'"
                  @click="mobileOpen = false"
                >
                  {{ item.label }}
                </NuxtLink>
              </nav>
              <div class="mt-6 border-t border-border/60 pt-6">
                <Button size="lg" class="w-full" as-child>
                  <NuxtLink
                    :to="localePath('/contact')"
                    @click="mobileOpen = false"
                  >
                    {{ t('nav.contact') }}
                  </NuxtLink>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <nav class="hidden h-11 items-center gap-1 md:flex">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="rounded-sm px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          :class="isActive(item.to) ? 'text-foreground underline decoration-primary decoration-2 underline-offset-8' : 'text-muted-foreground'"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>
