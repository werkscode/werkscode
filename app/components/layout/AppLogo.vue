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

const iconOnlyClasses: Record<LogoSize, string> = {
  sm: 'size-8',
  md: 'size-12',
  lg: 'size-16',
}

const wordmarkIconClasses: Record<LogoSize, string> = {
  sm: 'size-7',
  md: 'size-9',
  lg: 'size-12',
}

const wordmarkTextClasses: Record<LogoSize, string> = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
}

const size = computed(() => props.size as LogoSize)
</script>

<template>
  <span v-if="variant === 'icon'" class="inline-flex shrink-0 items-center" :class="iconOnlyClasses[size]">
    <LogoMark class="size-full" :title="t('brand')" />
  </span>

  <span v-else class="inline-flex shrink-0 items-center gap-2.5">
    <LogoMark :class="wordmarkIconClasses[size]" :title="t('brand')" />
    <span
      class="font-sans font-bold uppercase leading-none tracking-tight"
      :class="wordmarkTextClasses[size]"
    >
      <span class="text-foreground">WERKS</span><span class="text-primary">CODE</span>
    </span>
  </span>
</template>
