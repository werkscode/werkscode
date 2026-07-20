<script setup lang="ts">
import type { FaqItem } from '@/utils/seo'

defineProps<{
  items: FaqItem[]
  heading?: string
}>()
</script>

<template>
  <section class="space-y-4" aria-labelledby="faq-heading">
    <h2 id="faq-heading" class="text-xl font-semibold tracking-tight">
      {{ heading ?? 'Häufige Fragen' }}
    </h2>
    <dl class="divide-y divide-border border-t border-b">
      <div
        v-for="item in items"
        :key="item.question"
        class="space-y-2 py-4"
      >
        <dt class="font-medium text-foreground">
          {{ item.question }}
        </dt>
        <dd class="text-sm leading-relaxed text-muted-foreground">
          {{ item.answer }}
        </dd>
      </div>
    </dl>
  </section>
</template>
