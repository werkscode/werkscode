<script setup lang="ts">
import type { Component } from 'vue'
import {
  ArrowRightIcon,
  PaintbrushIcon,
} from '@lucide/vue'
import { GithubIcon } from 'lucide-vue-next'
import SeoFaq from '@/components/SeoFaq.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  DEFAULT_SITE_URL,
  GITHUB_URL,
  ORG_NAME,
  ORG_URL,
  SITE_NAME,
  absoluteUrl,
  faqToSchemaMainEntity,
  homeFaq,
  homeSeo,
} from '@/utils/seo'

interface ProcessCard {
  title: string
  description: string
  to?: string
  available: boolean
  icon: Component
}

const { public: publicConfig } = useRuntimeConfig()
const siteUrl = computed(() => (publicConfig.appUrl as string) || DEFAULT_SITE_URL)

usePageSeo({
  title: homeSeo.title,
  description: homeSeo.description,
  path: homeSeo.path,
})

useJsonLd(() => {
  const base = siteUrl.value
  const pageUrl = absoluteUrl(base, '/')
  const ogImage = absoluteUrl(base, '/og.png')
  const orgId = `${ORG_URL}/#organization`
  const websiteId = `${pageUrl}#website`
  const appId = `${pageUrl}#software`

  return [
    {
      '@type': 'Organization',
      '@id': orgId,
      name: ORG_NAME,
      url: ORG_URL,
      sameAs: [GITHUB_URL],
    },
    {
      '@type': 'WebSite',
      '@id': websiteId,
      name: SITE_NAME,
      url: pageUrl,
      inLanguage: 'de',
      publisher: { '@id': orgId },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': appId,
      name: SITE_NAME,
      description: homeSeo.description,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      inLanguage: 'de',
      url: pageUrl,
      image: ogImage,
      isPartOf: { '@id': websiteId },
      creator: { '@id': orgId },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'EUR',
      },
    },
    {
      '@type': 'FAQPage',
      '@id': `${pageUrl}#faq`,
      mainEntity: faqToSchemaMainEntity(homeFaq),
    },
  ]
})

const processes: ProcessCard[] = [
  {
    title: 'Pulverbeschichtung',
    description: 'Kalkulation für Oberflächenbehandlung, Vorbehandlung und Pulververbrauch.',
    to: '/powder-coating',
    available: true,
    icon: PaintbrushIcon,
  },
]
</script>

<template>
  <div class="space-y-10">
    <section class="space-y-4">
      <Badge variant="outline" class="text-xs">
        Proof of Concept
      </Badge>
      <div class="space-y-2">
        <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">
          Kalkulations-Tool
        </h1>
        <p class="max-w-2xl text-base text-muted-foreground">
          Proof of Concept für die Kalkulation metallverarbeitender Prozesse.
          Aktuell verfügbar: Pulverbeschichtung.
        </p>
      </div>
      <Button as-child variant="outline" size="sm">
        <a
          :href="publicConfig.githubUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2"
        >
          <GithubIcon class="size-4" />
          Auf GitHub ansehen
        </a>
      </Button>
    </section>

    <section class="grid gap-4 sm:grid-cols-2">
      <Card
        v-for="process in processes"
        :key="process.title"
        :class="cn(
          'transition-all duration-200',
          process.available
            ? 'hover:border-foreground/20 hover:shadow-md'
            : 'border-dashed bg-muted/20 opacity-80',
        )"
      >
        <CardHeader>
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-start gap-3">
              <span
                :class="cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-lg border',
                  process.available ? 'bg-muted/50' : 'bg-muted/30',
                )"
              >
                <component :is="process.icon" class="size-5" :class="!process.available && 'opacity-50'" />
              </span>
              <div class="space-y-1">
                <CardTitle class="text-base">
                  {{ process.title }}
                </CardTitle>
                <CardDescription>{{ process.description }}</CardDescription>
              </div>
            </div>
            <Badge v-if="!process.available" variant="outline" class="shrink-0">
              Bald verfügbar
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Button v-if="process.available && process.to" as-child>
            <NuxtLink :to="process.to" class="group">
              Kalkulation starten
              <ArrowRightIcon class="size-4 transition-transform group-hover:translate-x-0.5" />
            </NuxtLink>
          </Button>
        </CardContent>
      </Card>
    </section>

    <SeoFaq :items="homeFaq" />
  </div>
</template>
