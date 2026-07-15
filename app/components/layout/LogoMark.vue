<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
}>(), {
  title: 'WERKSCODE',
})
</script>

<template>
  <svg
    viewBox="0 0 100 100"
    role="img"
    :aria-label="title"
    class="block"
  >
    <rect
      x="6"
      y="6"
      width="88"
      height="88"
      rx="20"
      fill="var(--primary)"
    />
    <g fill="var(--primary-foreground)" opacity="0.5">
      <circle cx="22" cy="22" r="3" />
      <circle cx="78" cy="22" r="3" />
      <circle cx="22" cy="78" r="3" />
      <circle cx="78" cy="78" r="3" />
    </g>
    <polyline
      points="26,34 38,70 50,48 62,70 74,34"
      fill="none"
      stroke="var(--primary-foreground)"
      stroke-width="9"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
