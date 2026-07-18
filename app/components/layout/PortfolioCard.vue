<script setup lang="ts">
const props = defineProps<{
  title: string
  description?: string
  path: string
  tech?: string[]
  featured?: boolean
  cover?: string
}>()

const { t } = useI18n()

const fallbackLabel = computed(() => {
  if (props.tech?.length) {
    return props.tech.slice(0, 2).map(item => item.charAt(0)).join('').toUpperCase()
  }
  return props.title.slice(0, 2).toUpperCase()
})
</script>

<template>
  <NuxtLink
    :to="path"
    class="group block h-full rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
  >
    <Card class="flex h-full flex-col overflow-hidden border-2 border-border/80 transition-[border-color,box-shadow] group-hover:border-primary/40 group-hover:shadow-sm">
      <div class="relative aspect-[16/10] overflow-hidden border-b border-border/80 bg-muted/30">
        <img
          v-if="cover"
          :src="cover"
          :alt="title"
          class="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        >
        <div
          v-else
          class="surface-hatch flex size-full items-center justify-center bg-muted/40"
        >
          <div class="flex items-center gap-3">
            <LogoMark class="size-10 opacity-80" :title="title" />
            <span class="font-mono-label text-2xl text-primary">
              {{ fallbackLabel }}
            </span>
          </div>
        </div>
      </div>

      <CardHeader class="gap-2">
        <div class="flex min-w-0 items-start justify-between gap-2">
          <CardTitle class="min-w-0 font-heading text-xl font-normal transition-colors group-hover:text-primary">
            {{ title }}
          </CardTitle>
          <Badge v-if="featured" variant="default" class="shrink-0">
            {{ t('portfolio.featured') }}
          </Badge>
        </div>
        <CardDescription
          v-if="description"
          class="text-base leading-relaxed"
        >
          {{ description }}
        </CardDescription>
      </CardHeader>

      <CardContent class="mt-auto space-y-3">
        <div v-if="tech?.length" class="flex flex-wrap gap-1.5">
          <Badge
            v-for="item in tech"
            :key="item"
            variant="secondary"
          >
            {{ item }}
          </Badge>
        </div>
        <span class="inline-flex h-auto items-center text-sm font-medium text-primary underline-offset-4 group-hover:underline">
          {{ t('portfolio.viewProject') }}
        </span>
      </CardContent>
    </Card>
  </NuxtLink>
</template>
