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
  <PageShell width="narrow">
    <PageHeader
      :title="t('blog.title')"
      :description="t('blog.description')"
    />

    <div v-if="posts?.length" class="grid gap-4">
      <Card
        v-for="post in posts"
        :key="post.path"
        class="group transition-shadow hover:shadow-md"
      >
        <CardHeader>
          <CardTitle class="group-hover:text-primary transition-colors">
            <NuxtLink :to="post.path">
              {{ post.title }}
            </NuxtLink>
          </CardTitle>
          <CardDescription v-if="post.description">
            {{ post.description }}
          </CardDescription>
        </CardHeader>
        <CardContent class="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <time v-if="post.date">{{ post.date }}</time>
          <template v-if="post.tags?.length">
            <span aria-hidden="true">&middot;</span>
            <Badge
              v-for="tag in post.tags"
              :key="tag"
              variant="secondary"
              class="text-xs"
            >
              {{ tag }}
            </Badge>
          </template>
        </CardContent>
      </Card>
    </div>

    <EmptyState v-else>
      {{ t('blog.empty') }}
    </EmptyState>
  </PageShell>
</template>
