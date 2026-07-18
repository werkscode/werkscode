<script setup lang="ts">
import type { Component } from 'vue'
import {
  ArrowRightIcon,
  PaintbrushIcon,
} from '@lucide/vue'
import { GithubIcon } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ProcessCard {
  title: string
  description: string
  to?: string
  available: boolean
  icon: Component
}

const { public: publicConfig } = useRuntimeConfig()

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
  </div>
</template>
