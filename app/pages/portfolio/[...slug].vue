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
  <ContentArticle
    v-if="project"
    :title="project.title"
    :back-to="localePath('/portfolio')"
    :back-label="t('portfolio.back')"
  >
    <template v-if="project.tech?.length || project.link" #meta>
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
    </template>

    <ContentRenderer :value="project" />
  </ContentArticle>
</template>
