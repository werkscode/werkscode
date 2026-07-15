<script setup lang="ts">
const { t } = useI18n()
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
      <Card
        v-for="project in projects"
        :key="project.path"
        class="group border-2 border-border/80 transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-sm"
      >
        <CardHeader class="gap-2">
          <div class="flex min-w-0 items-start justify-between gap-2">
            <CardTitle class="min-w-0 font-heading text-xl font-normal group-hover:text-primary transition-colors">
              <NuxtLink
                :to="project.path"
                class="outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {{ project.title }}
              </NuxtLink>
            </CardTitle>
            <Badge v-if="project.featured" variant="default" class="shrink-0">
              {{ t('portfolio.featured') }}
            </Badge>
          </div>
          <CardDescription v-if="project.description" class="text-base leading-relaxed">
            {{ project.description }}
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-3">
          <div v-if="project.tech?.length" class="flex flex-wrap gap-1.5">
            <Badge
              v-for="tech in project.tech"
              :key="tech"
              variant="secondary"
            >
              {{ tech }}
            </Badge>
          </div>
          <Button variant="link" class="h-auto px-0" as-child>
            <NuxtLink :to="project.path">
              {{ t('portfolio.viewProject') }}
            </NuxtLink>
          </Button>
        </CardContent>
      </Card>
    </div>

    <EmptyState v-else>
      {{ t('portfolio.empty') }}
    </EmptyState>
  </PageShell>
</template>
