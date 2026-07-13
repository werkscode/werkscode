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
  <article v-if="post" class="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
    <header class="space-y-4">
      <Button variant="ghost" size="sm" class="-ml-2" as-child>
        <NuxtLink :to="localePath('/blog')">
          {{ t('blog.back') }}
        </NuxtLink>
      </Button>
      <h1 class="text-4xl">
        {{ post.title }}
      </h1>
      <div v-if="post.date || post.tags?.length" class="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <time v-if="post.date">{{ post.date }}</time>
        <Badge
          v-for="tag in post.tags"
          :key="tag"
          variant="secondary"
        >
          {{ tag }}
        </Badge>
      </div>
    </header>

    <div class="prose prose-neutral dark:prose-invert mt-10 max-w-none">
      <ContentRenderer :value="post" />
    </div>
  </article>
</template>
