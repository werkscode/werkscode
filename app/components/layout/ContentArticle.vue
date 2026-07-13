<script setup lang="ts">
import { cn } from '@/lib/utils'

defineProps<{
  title: string
  backTo: string
  backLabel: string
}>()
</script>

<template>
  <PageShell width="narrow">
    <article>
      <header class="space-y-4 border-b border-border/60 pb-8">
        <Button variant="ghost" size="sm" class="-ml-2" as-child>
          <NuxtLink :to="backTo">
            {{ backLabel }}
          </NuxtLink>
        </Button>
        <h1 class="text-4xl sm:text-5xl">
          {{ title }}
        </h1>
        <div
          v-if="$slots.meta"
          class="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
        >
          <slot name="meta" />
        </div>
      </header>

      <div
        :class="cn(
          'prose prose-neutral dark:prose-invert mt-10 max-w-none',
          'prose-headings:font-heading prose-headings:tracking-tight',
          'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
          'prose-code:rounded-md prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5',
          'prose-code:before:content-none prose-code:after:content-none',
        )"
      >
        <slot />
      </div>
    </article>
  </PageShell>
</template>
