<script setup lang="ts">
const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()
const { localizedPath } = useLocalizedContentPath()

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
  >
    <template v-if="post.date || post.tags?.length" #meta>
      <time v-if="post.date">{{ post.date }}</time>
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
