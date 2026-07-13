<script setup lang="ts">
const year = new Date().getFullYear()
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <footer class="border-t border-border/60">
    <div class="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
      <p>{{ t('footer.copyright', { year }) }}</p>
      <div class="flex gap-4">
        <NuxtLink :to="localePath('/blog')" class="hover:text-foreground transition-colors">
          {{ t('nav.blog') }}
        </NuxtLink>
        <NuxtLink :to="localePath('/portfolio')" class="hover:text-foreground transition-colors">
          {{ t('nav.portfolio') }}
        </NuxtLink>
        <NuxtLink :to="localePath('/contact')" class="hover:text-foreground transition-colors">
          {{ t('nav.contact') }}
        </NuxtLink>
      </div>
    </div>
  </footer>
</template>
