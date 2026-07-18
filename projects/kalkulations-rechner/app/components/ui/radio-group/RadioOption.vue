<script setup lang="ts">
import { Label } from '@/components/ui/label'
import RadioGroupItem from './RadioGroupItem.vue'

defineProps<{
  id: string
  value: string
}>()
</script>

<template>
  <div class="flex items-center gap-2">
    <RadioGroupItem :id="id" :value="value" />
    <Label :for="id" class="cursor-pointer font-normal leading-none">
      <slot />
    </Label>
  </div>
</template>
