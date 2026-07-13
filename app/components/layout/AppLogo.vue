<script setup lang="ts">
const props = withDefaults(defineProps<{
  variant?: 'wordmark' | 'icon'
  size?: 'sm' | 'md' | 'lg'
}>(), {
  variant: 'wordmark',
  size: 'sm',
})

const { t } = useI18n()

type LogoSize = 'sm' | 'md' | 'lg'

const iconSizeClasses: Record<LogoSize, string> = {
  sm: 'size-8',
  md: 'size-12',
  lg: 'size-16',
}

const wordmarkSizeClasses: Record<LogoSize, string> = {
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-14',
}

const heightClass = computed(() => {
  const size = props.size as LogoSize
  return props.variant === 'icon'
    ? iconSizeClasses[size]
    : wordmarkSizeClasses[size]
})
</script>

<template>
  <span class="inline-flex shrink-0 items-center" :class="heightClass">
    <template v-if="variant === 'wordmark'">
      <img
        src="/wordmark.png"
        :alt="t('brand')"
        class="h-full w-auto dark:hidden"
      >
      <img
        src="/wordmark-dark.png"
        alt=""
        aria-hidden="true"
        class="hidden h-full w-auto dark:block"
      >
    </template>
    <template v-else>
      <img
        src="/logo.png"
        :alt="t('brand')"
        class="size-full object-contain dark:hidden"
      >
      <img
        src="/logo-dark.png"
        alt=""
        aria-hidden="true"
        class="hidden size-full object-contain dark:block"
      >
    </template>
  </span>
</template>
