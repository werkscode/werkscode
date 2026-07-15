<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const error = useError()

const isNotFound = computed(() => (error.value?.statusCode ?? 404) === 404)

const errorTitle = computed(() =>
  isNotFound.value ? t('errors.pageNotFound') : t('errors.genericTitle'),
)

const errorDescription = computed(() =>
  isNotFound.value ? t('errors.pageNotFoundDescription') : t('errors.genericDescription'),
)

useSeoMeta({
  title: () => errorTitle.value,
})

const recoveryLinks = computed(() => [
  { label: t('nav.home'), to: localePath('/') },
  { label: t('nav.blog'), to: localePath('/blog') },
  { label: t('nav.contact'), to: localePath('/contact') },
])

function handleError() {
  clearError({ redirect: localePath('/') })
}
</script>

<template>
  <NuxtLayout>
    <PageShell width="narrow">
      <div class="border-2 border-foreground/10 bg-card px-6 py-12 text-center sm:px-10 sm:py-16">
        <p class="font-mono-label mb-4 text-primary">
          {{ error?.statusCode ?? 404 }}
        </p>
        <h1 class="font-heading text-3xl sm:text-4xl">
          {{ errorTitle }}
        </h1>
        <p class="mx-auto mt-4 max-w-md text-muted-foreground">
          {{ errorDescription }}
        </p>

        <p class="font-mono-label mt-8 mb-3 text-muted-foreground">
          {{ t('errors.recovery') }}
        </p>
        <nav class="flex flex-wrap justify-center gap-3">
          <Button
            v-for="link in recoveryLinks"
            :key="link.to"
            :variant="link.to === localePath('/') ? 'default' : 'outline'"
            size="lg"
            as-child
          >
            <NuxtLink
              :to="link.to"
              class="whitespace-nowrap"
              @click="link.to === localePath('/') ? handleError() : undefined"
            >
              {{ link.label }}
            </NuxtLink>
          </Button>
        </nav>
      </div>
    </PageShell>
  </NuxtLayout>
</template>
