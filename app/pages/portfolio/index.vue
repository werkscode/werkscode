<script setup lang="ts">
const { t } = useI18n()
const { localizedPath } = useLocalizedContentPath()
const portfolioBasePath = computed(() => localizedPath('/portfolio'))

const { data: projects } = await useAsyncData(
  () => `portfolio-list-${portfolioBasePath.value}`,
  () => queryCollection('portfolio')
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
  <div class="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
    <h1 class="text-4xl">
      {{ t('portfolio.title') }}
    </h1>
    <p class="mt-4 text-muted-foreground">
      {{ t('portfolio.description') }}
    </p>

    <div v-if="projects?.length" class="mt-10 grid gap-6 sm:grid-cols-2">
      <Card
        v-for="project in projects"
        :key="project.path"
        class="group transition-shadow hover:shadow-md"
      >
        <CardHeader>
          <div class="flex items-start justify-between gap-2">
            <CardTitle class="group-hover:text-primary transition-colors">
              <NuxtLink :to="project.path">
                {{ project.title }}
              </NuxtLink>
            </CardTitle>
            <Badge v-if="project.featured" variant="default">
              {{ t('portfolio.featured') }}
            </Badge>
          </div>
          <CardDescription v-if="project.description">
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
          <Button variant="link" class="px-0" as-child>
            <NuxtLink :to="project.path">
              {{ t('portfolio.viewProject') }}
            </NuxtLink>
          </Button>
        </CardContent>
      </Card>
    </div>

    <p v-else class="mt-10 text-muted-foreground">
      {{ t('portfolio.empty') }}
    </p>
  </div>
</template>
