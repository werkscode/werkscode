<script setup lang="ts">
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

      <div class="prose-content">
        <slot />
      </div>
    </article>
  </PageShell>
</template>
