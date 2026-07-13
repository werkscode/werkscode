<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('seo.home.title'),
  description: () => t('seo.home.description'),
})

const localePath = useLocalePath()
</script>

<template>
  <PageShell>
    <PageHeader
      :title="t('home.title')"
      :description="t('home.description')"
    >
      <template #eyebrow>
        <AppLogo variant="icon" size="md" />
        <Badge variant="secondary">
          {{ t('home.badge') }}
        </Badge>
      </template>
      <div class="flex flex-wrap gap-3">
        <Button as-child>
          <NuxtLink :to="localePath('/blog')">
            {{ t('home.readBlog') }}
          </NuxtLink>
        </Button>
        <Button variant="outline" as-child>
          <NuxtLink :to="localePath('/portfolio')">
            {{ t('home.viewPortfolio') }}
          </NuxtLink>
        </Button>
      </div>
    </PageHeader>

    <Separator class="mb-12 sm:mb-16" />

    <section class="grid gap-6 sm:grid-cols-2">
      <Card class="transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle>{{ t('home.blogCard.title') }}</CardTitle>
          <CardDescription>
            {{ t('home.blogCard.description') }}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="link" class="px-0" as-child>
            <NuxtLink :to="localePath('/blog')">
              {{ t('home.blogCard.cta') }}
            </NuxtLink>
          </Button>
        </CardContent>
      </Card>
      <Card class="transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle>{{ t('home.portfolioCard.title') }}</CardTitle>
          <CardDescription>
            {{ t('home.portfolioCard.description') }}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="link" class="px-0" as-child>
            <NuxtLink :to="localePath('/portfolio')">
              {{ t('home.portfolioCard.cta') }}
            </NuxtLink>
          </Button>
        </CardContent>
      </Card>
    </section>
  </PageShell>
</template>
