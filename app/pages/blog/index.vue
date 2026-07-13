<script setup lang="ts">
const { t } = useI18n()
const { localizedPath } = useLocalizedContentPath()
const blogBasePath = computed(() => localizedPath('/blog'))

const { data: posts } = await useAsyncData(
  () => `blog-list-${blogBasePath.value}`,
  () => queryCollection('blog')
    .where('draft', '<>', true)
    .where('path', 'LIKE', `${blogBasePath.value}%`)
    .order('date', 'DESC')
    .all(),
  { watch: [blogBasePath] },
)

useSeoMeta({
  title: () => t('seo.blog.title'),
  description: () => t('seo.blog.description'),
})
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
    <h1 class="text-4xl">
      {{ t('blog.title') }}
    </h1>
    <p class="mt-4 text-muted-foreground">
      {{ t('blog.description') }}
    </p>

    <div v-if="posts?.length" class="mt-10 space-y-6">
      <article
        v-for="post in posts"
        :key="post.path"
        class="group"
      >
        <NuxtLink :to="post.path" class="block space-y-2">
          <h2 class="text-2xl group-hover:text-primary transition-colors">
            {{ post.title }}
          </h2>
          <p v-if="post.description" class="text-muted-foreground">
            {{ post.description }}
          </p>
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <time v-if="post.date">{{ post.date }}</time>
            <template v-if="post.tags?.length">
              <span>&middot;</span>
              <Badge
                v-for="tag in post.tags"
                :key="tag"
                variant="secondary"
                class="text-xs"
              >
                {{ tag }}
              </Badge>
            </template>
          </div>
        </NuxtLink>
        <Separator class="mt-6" />
      </article>
    </div>

    <p v-else class="mt-10 text-muted-foreground">
      {{ t('blog.empty') }}
    </p>
  </div>
</template>
