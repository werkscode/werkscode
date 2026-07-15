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
      <header class="space-y-4 border-b-2 border-foreground/10 pb-8">
        <Button variant="ghost" size="sm" class="-ml-2 whitespace-nowrap" as-child>
          <NuxtLink :to="backTo">
            {{ backLabel }}
          </NuxtLink>
        </Button>
        <h1 class="break-words text-4xl leading-[1.05] min-w-0 sm:text-5xl">
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
          'prose-headings:font-heading prose-headings:font-normal prose-headings:tracking-tight',
          'prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline',
          'prose-code:rounded-sm prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-[0.9em]',
          'prose-code:before:content-none prose-code:after:content-none',
          'prose-blockquote:border-l-primary prose-blockquote:border-l-4 prose-blockquote:font-normal prose-blockquote:not-italic',
        )"
      >
        <slot />
      </div>
    </article>
  </PageShell>
</template>
