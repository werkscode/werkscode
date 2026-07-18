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
      <NuxtLink
        v-if="featuredPost"
        :to="featuredPost.path"
        class="group block rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Card class="border-2 border-primary/30 transition-[border-color,box-shadow] group-hover:border-primary/50 group-hover:shadow-sm">
          <CardHeader class="gap-3">
            <p class="font-mono-label text-primary">
              {{ t('blog.featured') }}
            </p>
            <CardTitle class="font-heading text-2xl font-normal transition-colors group-hover:text-primary sm:text-3xl">
              {{ featuredPost.title }}
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
      </NuxtLink>

      <NuxtLink
        v-for="post in remainingPosts"
        :key="post.path"
        :to="post.path"
        class="group block rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Card class="relative border-2 border-border/80 pl-4 transition-[border-color,box-shadow] group-hover:border-primary/40 group-hover:shadow-sm before:absolute before:inset-y-3 before:left-0 before:w-1 before:rounded-full before:bg-primary/40">
          <CardHeader class="gap-2">
            <CardTitle class="font-heading text-xl font-normal transition-colors group-hover:text-primary">
              {{ post.title }}
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
      </NuxtLink>
    </div>

    <EmptyState v-else>
      {{ t('blog.empty') }}
    </EmptyState>
  </PageShell>
</template>
