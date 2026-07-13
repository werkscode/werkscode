<script setup lang="ts">
const year = new Date().getFullYear()
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <footer class="border-t border-border/60 bg-background/50">
    <div class="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 py-10 text-sm text-muted-foreground sm:flex-row sm:px-6">
      <p>{{ t('footer.copyright', { year }) }}</p>
      <nav class="flex flex-wrap justify-center gap-x-5 gap-y-2">
        <NuxtLink :to="localePath('/blog')" class="transition-colors hover:text-foreground">
          {{ t('nav.blog') }}
        </NuxtLink>
        <NuxtLink :to="localePath('/portfolio')" class="transition-colors hover:text-foreground">
          {{ t('nav.portfolio') }}
        </NuxtLink>
        <NuxtLink :to="localePath('/about')" class="transition-colors hover:text-foreground">
          {{ t('nav.about') }}
        </NuxtLink>
        <NuxtLink :to="localePath('/contact')" class="transition-colors hover:text-foreground">
          {{ t('nav.contact') }}
        </NuxtLink>
      </nav>
    </div>
  </footer>
</template>
