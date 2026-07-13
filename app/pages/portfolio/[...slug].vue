<script setup lang="ts">
const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()
const { localizedPath } = useLocalizedContentPath()

const slug = Array.isArray(route.params.slug) ? route.params.slug.join('/') : route.params.slug
const projectPath = computed(() => `${localizedPath('/portfolio')}/${slug}`)

const { data: project } = await useAsyncData(
  () => `portfolio-${projectPath.value}`,
  () => queryCollection('portfolio').path(projectPath.value).first(),
  { watch: [projectPath] },
)

if (!project.value) {
  throw createError({ statusCode: 404, statusMessage: t('portfolio.notFound') })
}

useSeoMeta({
  title: () => `${project.value?.title} — ${t('seo.titleSuffix')}`,
  description: () => project.value?.description ?? '',
})
</script>

<template>
  <article v-if="project" class="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
    <header class="space-y-4">
      <Button variant="ghost" size="sm" class="-ml-2" as-child>
        <NuxtLink :to="localePath('/portfolio')">
          {{ t('portfolio.back') }}
        </NuxtLink>
      </Button>
      <h1 class="text-4xl">
        {{ project.title }}
      </h1>
      <div class="flex flex-wrap items-center gap-2">
        <Badge
          v-for="tech in project.tech"
          :key="tech"
          variant="secondary"
        >
          {{ tech }}
        </Badge>
        <Button
          v-if="project.link"
          variant="outline"
          size="sm"
          as-child
        >
          <a :href="project.link" target="_blank" rel="noopener noreferrer">
            {{ t('portfolio.visitProject') }}
          </a>
        </Button>
      </div>
    </header>

    <div class="prose prose-neutral dark:prose-invert mt-10 max-w-none">
      <ContentRenderer :value="project" />
    </div>
  </article>
</template>
