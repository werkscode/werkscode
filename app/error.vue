<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const error = useError()

useSeoMeta({
  title: () => t('errors.pageNotFound'),
})

function handleError() {
  clearError({ redirect: localePath('/') })
}
</script>

<template>
  <PageShell width="narrow">
    <div class="border-2 border-foreground/10 bg-card px-6 py-12 text-center sm:px-10 sm:py-16">
      <p class="font-mono-label mb-4 text-primary">
        {{ error?.statusCode ?? 404 }}
      </p>
      <h1 class="font-heading text-3xl sm:text-4xl">
        {{ t('errors.pageNotFound') }}
      </h1>
      <p class="mx-auto mt-4 max-w-md text-muted-foreground">
        {{ error?.statusMessage }}
      </p>
      <div class="mt-8">
        <Button size="lg" as-child>
          <NuxtLink :to="localePath('/')" @click="handleError">
            {{ t('nav.home') }}
          </NuxtLink>
        </Button>
      </div>
    </div>
  </PageShell>
</template>
