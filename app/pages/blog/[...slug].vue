<script setup lang="ts">
const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()
const { localizedPath } = useLocalizedContentPath()
const { formatDate } = useFormattedDate()

const slug = Array.isArray(route.params.slug) ? route.params.slug.join('/') : route.params.slug
const postPath = computed(() => `${localizedPath('/blog')}/${slug}`)

const { data: post } = await useAsyncData(
  () => `blog-${postPath.value}`,
  () => queryCollection('blog').path(postPath.value).first(),
  { watch: [postPath] },
)

if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: t('blog.notFound') })
}

type TocLink = {
  id: string
  depth: number
  text: string
  children?: TocLink[]
}

const tocLinks = computed((): TocLink[] => {
  const body = post.value?.body as { toc?: { links?: TocLink[] } } | undefined
  return body?.toc?.links ?? []
})

useSeoMeta({
  title: () => `${post.value?.title} — ${t('seo.titleSuffix')}`,
  description: () => post.value?.description ?? '',
})
</script>

<template>
  <ContentArticle
    v-if="post"
    :title="post.title"
    :back-to="localePath('/blog')"
    :back-label="t('blog.back')"
    :toc-links="tocLinks"
    :toc-label="t('blog.toc')"
    :ai-assist="post.ai_assist"
    show-end-cta
  >
    <template v-if="post.date || post.tags?.length" #meta>
      <time v-if="post.date">{{ formatDate(post.date) }}</time>
      <Badge
        v-for="tag in post.tags"
        :key="tag"
        variant="secondary"
      >
        {{ tag }}
      </Badge>
    </template>

    <ContentRenderer :value="post" />
  </ContentArticle>
</template>
