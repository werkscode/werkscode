<script setup lang="ts">
type TocLink = {
  id: string
  depth: number
  text: string
  children?: TocLink[]
}

defineProps<{
  links: TocLink[]
  label: string
}>()
</script>

<template>
  <nav
    v-if="links.length"
    aria-label="Table of contents"
    class="mb-8 rounded-md border-2 border-border/80 bg-muted/20 px-4 py-4 lg:sticky lg:top-24 lg:mb-0"
  >
    <p class="font-mono-label mb-3 text-muted-foreground">
      {{ label }}
    </p>
    <ul class="space-y-2 text-sm">
      <template v-for="link in links" :key="link.id">
        <li>
          <a
            :href="`#${link.id}`"
            class="text-foreground/90 transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
          >
            {{ link.text }}
          </a>
          <ul
            v-if="link.children?.length"
            class="mt-2 space-y-1.5 border-l border-border/80 pl-3"
          >
            <li
              v-for="child in link.children"
              :key="child.id"
            >
              <a
                :href="`#${child.id}`"
                class="text-muted-foreground transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
              >
                {{ child.text }}
              </a>
            </li>
          </ul>
        </li>
      </template>
    </ul>
  </nav>
</template>
