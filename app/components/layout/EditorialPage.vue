<script setup lang="ts">
import { cn } from '@/lib/utils'

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
      <header class="space-y-4 border-b border-border/60 pb-8">
        <h1 class="text-4xl sm:text-5xl">
          {{ page.title }}
        </h1>
        <p
          v-if="page.description"
          class="text-lg text-muted-foreground"
        >
          {{ page.description }}
        </p>
      </header>

      <div
        :class="cn(
          'prose prose-neutral dark:prose-invert mt-10 max-w-none',
          'prose-headings:font-heading prose-headings:tracking-tight',
          'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
          'prose-code:rounded-md prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5',
          'prose-code:before:content-none prose-code:after:content-none',
        )"
      >
        <ContentRenderer :value="page" />
      </div>
    </article>
  </PageShell>
</template>
