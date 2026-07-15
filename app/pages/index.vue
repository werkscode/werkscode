<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('seo.home.title'),
  description: () => t('seo.home.description'),
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
        <Badge variant="outline" class="font-mono-label">
          {{ t('home.badge') }}
        </Badge>
      </template>
      <div class="flex flex-wrap gap-3">
        <Button size="lg" as-child>
          <NuxtLink :to="localePath('/blog')">
            {{ t('home.readBlog') }}
          </NuxtLink>
        </Button>
        <Button variant="outline" size="lg" as-child>
          <NuxtLink :to="localePath('/portfolio')">
            {{ t('home.viewPortfolio') }}
          </NuxtLink>
        </Button>
      </div>
    </PageHeader>

    <section class="mb-14 border-y border-border/80 bg-muted/30 px-5 py-8 sm:mb-16 sm:px-8 sm:py-10">
      <p class="font-mono-label mb-3 text-muted-foreground">
        {{ t('home.manifesto.label') }}
      </p>
      <p class="max-w-3xl font-heading text-xl leading-relaxed text-foreground sm:text-2xl">
        {{ t('home.manifesto.text') }}
      </p>
    </section>

    <section class="mb-14 sm:mb-16">
      <div class="mb-6 flex items-end justify-between gap-4 border-b border-border pb-4">
        <h2 class="font-heading text-2xl sm:text-3xl">
          {{ t('home.paths.title') }}
        </h2>
        <span class="font-mono-label hidden text-muted-foreground sm:inline">
          {{ t('home.paths.count') }}
        </span>
      </div>

      <div class="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card class="group border-2 border-border/80 transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-sm">
          <CardHeader class="gap-3">
            <p class="font-mono-label text-primary">
              {{ t('home.blogCard.label') }}
            </p>
            <CardTitle class="font-heading text-2xl font-normal">
              {{ t('home.blogCard.title') }}
            </CardTitle>
            <CardDescription class="text-base leading-relaxed">
              {{ t('home.blogCard.description') }}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="link" class="h-auto px-0 text-base" as-child>
              <NuxtLink :to="localePath('/blog')">
                {{ t('home.blogCard.cta') }}
              </NuxtLink>
            </Button>
          </CardContent>
        </Card>

        <Card class="group border-2 border-border/80 transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-sm">
          <CardHeader class="gap-3">
            <p class="font-mono-label text-primary">
              {{ t('home.portfolioCard.label') }}
            </p>
            <CardTitle class="font-heading text-2xl font-normal">
              {{ t('home.portfolioCard.title') }}
            </CardTitle>
            <CardDescription class="text-base leading-relaxed">
              {{ t('home.portfolioCard.description') }}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="link" class="h-auto px-0 text-base" as-child>
              <NuxtLink :to="localePath('/portfolio')">
                {{ t('home.portfolioCard.cta') }}
              </NuxtLink>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>

    <section class="flex flex-col gap-5 border-2 border-foreground/10 bg-card px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <div class="min-w-0">
        <p class="font-mono-label mb-2 text-muted-foreground">
          {{ t('home.contactStrip.label') }}
        </p>
        <p class="font-heading text-xl leading-snug sm:text-2xl">
          {{ t('home.contactStrip.text') }}
        </p>
      </div>
      <Button size="lg" class="shrink-0" as-child>
        <NuxtLink :to="localePath('/contact')">
          {{ t('home.contactStrip.cta') }}
        </NuxtLink>
      </Button>
    </section>
  </PageShell>
</template>
