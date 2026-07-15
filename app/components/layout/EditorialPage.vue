<script setup lang="ts">
const props = defineProps<{
  slug: string
}>()

const { t } = useI18n()
const { localizedPath } = useLocalizedContentPath()

const pagePath = computed(() => localizedPath(`/pages/${props.slug}`))

const { data: page } = await useAsyncData(
  () => `page-${pagePath.value}`,
  () => queryCollection('pages').path(pagePath.value).first(),
  { watch: [pagePath] },
)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: t('errors.pageNotFound') })
}
</script>

<template>
  <PageShell v-if="page" width="narrow">
    <article>
      <header class="space-y-4 border-b-2 border-foreground/10 pb-8">
        <h1 class="break-words text-4xl leading-[1.05] min-w-0 sm:text-5xl">
          {{ page.title }}
        </h1>
        <p
          v-if="page.description"
          class="text-lg leading-relaxed text-muted-foreground"
        >
          {{ page.description }}
        </p>
      </header>

      <div class="prose-content">
        <ContentRenderer :value="page" />
      </div>
    </article>
  </PageShell>
</template>
