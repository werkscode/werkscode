<script setup lang="ts">
const { t } = useI18n()
const { localizedPath } = useLocalizedContentPath()
const { formatDate } = useFormattedDate()
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

const featuredPost = computed(() => posts.value?.[0] ?? null)
const remainingPosts = computed(() => posts.value?.slice(1) ?? [])

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

    <div v-if="posts?.length" class="grid min-w-0 gap-6">
      <Card
        v-if="featuredPost"
        class="group border-2 border-primary/30 transition-[border-color,box-shadow] hover:border-primary/50 hover:shadow-sm"
      >
        <CardHeader class="gap-3">
          <p class="font-mono-label text-primary">
            {{ t('blog.featured') }}
          </p>
          <CardTitle class="font-heading text-2xl font-normal group-hover:text-primary transition-colors sm:text-3xl">
            <NuxtLink
              :to="featuredPost.path"
              class="outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {{ featuredPost.title }}
            </NuxtLink>
          </CardTitle>
          <CardDescription
            v-if="featuredPost.description"
            class="text-base leading-relaxed"
          >
            {{ featuredPost.description }}
          </CardDescription>
        </CardHeader>
        <CardContent class="flex flex-wrap items-center gap-2">
          <time
            v-if="featuredPost.date"
            class="font-mono-label normal-case tracking-normal text-muted-foreground"
          >
            {{ formatDate(featuredPost.date) }}
          </time>
          <template v-if="featuredPost.tags?.length">
            <span aria-hidden="true" class="text-muted-foreground">&middot;</span>
            <Badge
              v-for="tag in featuredPost.tags"
              :key="tag"
              variant="secondary"
              class="text-xs"
            >
              {{ tag }}
            </Badge>
          </template>
        </CardContent>
      </Card>

      <Card
        v-for="post in remainingPosts"
        :key="post.path"
        class="group relative border-2 border-border/80 pl-4 transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-sm before:absolute before:inset-y-3 before:left-0 before:w-1 before:rounded-full before:bg-primary/40"
      >
        <CardHeader class="gap-2">
          <CardTitle class="font-heading text-xl font-normal group-hover:text-primary transition-colors">
            <NuxtLink
              :to="post.path"
              class="outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {{ post.title }}
            </NuxtLink>
          </CardTitle>
          <CardDescription v-if="post.description" class="text-base leading-relaxed">
            {{ post.description }}
          </CardDescription>
        </CardHeader>
        <CardContent class="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <time
            v-if="post.date"
            class="font-mono-label normal-case tracking-normal"
          >
            {{ formatDate(post.date) }}
          </time>
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
