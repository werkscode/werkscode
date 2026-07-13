<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('seo.home.title'),
  description: () => t('seo.home.description'),
})

const localePath = useLocalePath()
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
    <section class="space-y-6">
      <Badge variant="secondary">
        {{ t('home.badge') }}
      </Badge>
      <h1 class="text-4xl sm:text-5xl lg:text-6xl">
        {{ t('home.title') }}
      </h1>
      <p class="max-w-2xl text-lg text-muted-foreground">
        {{ t('home.description') }}
      </p>
      <div class="flex flex-wrap gap-3 pt-2">
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
    </section>

    <Separator class="my-16" />

    <section class="grid gap-6 sm:grid-cols-2">
      <Card>
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
      <Card>
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
  </div>
</template>
