<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { localizedPath } = useLocalizedContentPath()
const portfolioBasePath = computed(() => localizedPath('/portfolio'))

const { data: projects } = await useAsyncData(
  () => `portfolio-list-${portfolioBasePath.value}`,
  () => queryCollection('portfolio')
    .where('draft', '<>', true)
    .where('path', 'LIKE', `${portfolioBasePath.value}%`)
    .order('date', 'DESC')
    .all(),
  { watch: [portfolioBasePath] },
)

useSeoMeta({
  title: () => t('seo.portfolio.title'),
  description: () => t('seo.portfolio.description'),
})
</script>

<template>
  <PageShell>
    <PageHeader
      :title="t('portfolio.title')"
      :description="t('portfolio.description')"
    />

    <div v-if="projects?.length" class="grid min-w-0 gap-5 sm:grid-cols-2">
      <PortfolioCard
        v-for="project in projects"
        :key="project.path"
        :title="project.title"
        :description="project.description"
        :path="project.path"
        :tech="project.tech"
        :featured="project.featured"
        :cover="project.cover"
      />
    </div>

    <EmptyState
      v-else
      :cta-to="localePath('/blog')"
      :cta-label="t('portfolio.emptyBlog')"
      :secondary-cta-to="localePath('/contact')"
      :secondary-cta-label="t('portfolio.emptyContact')"
    >
      {{ t('portfolio.empty') }}
      <template #hint>
        {{ t('portfolio.emptyHint') }}
      </template>
    </EmptyState>
  </PageShell>
</template>
