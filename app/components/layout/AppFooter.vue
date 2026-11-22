<script setup lang="ts">
const year = new Date().getFullYear()
const { t } = useI18n()
const localePath = useLocalePath()
const { public: publicConfig } = useRuntimeConfig()

const statement = computed(() => t('footer.statement'))
const authorship = computed(() => t('footer.authorship'))
const hasIntro = computed(() => Boolean(statement.value || authorship.value))
</script>

<template>
  <footer class="border-t-2 border-foreground/10 bg-background">
    <div class="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <p
        v-if="statement"
        class="max-w-2xl font-heading text-2xl leading-snug text-foreground sm:text-3xl"
      >
        {{ statement }}
      </p>
      <p
        v-if="authorship"
        class="max-w-2xl text-sm text-muted-foreground"
        :class="statement ? 'mt-3' : undefined"
      >
        {{ authorship }}
      </p>

      <div
        class="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"
        :class="hasIntro ? 'mt-10 border-t border-border/60 pt-8' : undefined"
      >
        <p class="text-sm text-muted-foreground">
          {{ t('footer.copyright', { year }) }}
        </p>
        <nav class="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <NuxtLink
            :to="localePath('/blog')"
            class="whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            {{ t('nav.blog') }}
          </NuxtLink>
          <NuxtLink
            :to="localePath('/about')"
            class="whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            {{ t('nav.about') }}
          </NuxtLink>
          <NuxtLink
            :to="localePath('/transparency')"
            class="whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            {{ t('nav.transparency') }}
          </NuxtLink>
          <NuxtLink
            :to="localePath('/contact')"
            class="whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            {{ t('nav.contact') }}
          </NuxtLink>
          <a
            :href="publicConfig.githubUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            {{ t('footer.github') }}
          </a>
        </nav>
      </div>
    </div>
  </footer>
</template>
