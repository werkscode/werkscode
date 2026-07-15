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

      <div
        :class="cn(
          'prose prose-neutral dark:prose-invert mt-10 max-w-none',
          'prose-headings:font-heading prose-headings:font-normal prose-headings:tracking-tight',
          'prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline',
          'prose-code:rounded-sm prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-[0.9em]',
          'prose-code:before:content-none prose-code:after:content-none',
          'prose-blockquote:border-l-primary prose-blockquote:border-l-4 prose-blockquote:font-normal prose-blockquote:not-italic',
        )"
      >
        <ContentRenderer :value="page" />
      </div>
    </article>
  </PageShell>
</template>
