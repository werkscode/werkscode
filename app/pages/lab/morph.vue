<script setup lang="ts">
const MorphFieldCanvas = defineAsyncComponent(() =>
  import('~/components/lab/morph/MorphFieldCanvas.vue'),
)

const { t } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: () => t('seo.labMorph.title'),
  description: () => t('seo.labMorph.description'),
})
</script>

<template>
  <PageShell width="wide">
    <div class="mb-6 max-w-2xl">
      <p class="font-mono-label mb-2 text-muted-foreground">
        {{ t('lab.morph.eyebrow') }}
      </p>
      <h1 class="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {{ t('lab.morph.title') }}
      </h1>
      <p class="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
        {{ t('lab.morph.intro') }}
      </p>
      <p class="mt-2 text-sm text-muted-foreground">
        {{ t('lab.morph.hint') }}
      </p>
      <p class="mt-4">
        <NuxtLink
          :to="localePath('/blog/curiosity-without-a-ticket')"
          class="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {{ t('lab.morph.backToPost') }}
        </NuxtLink>
      </p>
    </div>

    <div class="h-[min(72vh,720px)] min-h-[420px] w-full overflow-hidden border border-border">
      <ClientOnly>
        <Suspense>
          <MorphFieldCanvas />
          <template #fallback>
            <div class="flex h-full min-h-[420px] items-center justify-center bg-[#001a33] text-sm text-[#a8e6ff]">
              {{ t('lab.morph.loading') }}
            </div>
          </template>
        </Suspense>
        <template #fallback>
          <div class="flex h-full min-h-[420px] items-center justify-center bg-[#001a33] text-sm text-[#a8e6ff]">
            {{ t('lab.morph.loading') }}
          </div>
        </template>
      </ClientOnly>
    </div>
  </PageShell>
</template>
