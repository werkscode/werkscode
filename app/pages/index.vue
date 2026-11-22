<script setup lang="ts">
const { t } = useI18n()
const { localizedPath } = useLocalizedContentPath()
const { formatDate } = useFormattedDate()
const blogBasePath = computed(() => localizedPath('/blog'))

const { data: latestPost } = await useAsyncData(
  () => `home-latest-${blogBasePath.value}`,
  () => queryCollection('blog')
    .where('draft', '<>', true)
    .where('path', 'LIKE', `${blogBasePath.value}%`)
    .order('date', 'DESC')
    .first(),
  { watch: [blogBasePath] },
)

useSeoMeta({
  title: () => t('seo.home.title'),
  description: () => t('seo.home.description') || undefined,
})

const localePath = useLocalePath()
</script>

<template>
  <PageShell width="wide">
    <PageHeader
      :title="t('home.title')"
      :description="t('home.description')"
    >
      <template #eyebrow>
        <AppLogo variant="icon" size="md" />
      </template>
      <nav class="flex flex-wrap gap-3">
        <Button size="lg" as-child>
          <NuxtLink :to="localePath('/blog')">
            {{ t('nav.blog') }}
          </NuxtLink>
        </Button>
        <Button variant="outline" size="lg" as-child>
          <NuxtLink :to="localePath('/about')">
            {{ t('nav.about') }}
          </NuxtLink>
        </Button>
        <Button variant="outline" size="lg" as-child>
          <NuxtLink :to="localePath('/contact')">
            {{ t('nav.contact') }}
          </NuxtLink>
        </Button>
      </nav>
    </PageHeader>

    <section
      v-if="latestPost"
      class="mb-14 sm:mb-16"
    >
      <p class="font-mono-label mb-4 text-primary">
        {{ t('home.latest.label') }}
      </p>
      <NuxtLink
        :to="latestPost.path"
        class="group block rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Card class="border-2 border-border/80 transition-[border-color,box-shadow] group-hover:border-primary/40 group-hover:shadow-sm">
          <CardHeader class="gap-3">
            <CardTitle class="font-heading text-2xl font-normal transition-colors group-hover:text-primary">
              {{ latestPost.title }}
            </CardTitle>
            <CardDescription
              v-if="latestPost.description"
              class="text-base leading-relaxed"
            >
              {{ latestPost.description }}
            </CardDescription>
          </CardHeader>
          <CardContent class="flex flex-wrap items-center gap-2">
            <time
              v-if="latestPost.date"
              class="font-mono-label normal-case tracking-normal text-muted-foreground"
            >
              {{ formatDate(latestPost.date) }}
            </time>
            <span class="inline-flex h-auto items-center text-base font-medium text-primary underline-offset-4 group-hover:underline">
              {{ t('home.latest.cta') }}
            </span>
          </CardContent>
        </Card>
      </NuxtLink>
    </section>
  </PageShell>
</template>
