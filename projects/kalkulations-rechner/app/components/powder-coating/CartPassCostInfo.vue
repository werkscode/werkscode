<script setup lang="ts">
import type { CartPassStepCost, CartPassWorkStep } from '#shared/lib/cart-pass-work-steps'
import {
  computeCartPassWorkStepBreakdown,
  computeMinutesPerCartPass,
  formatDurationMinutes,
} from '#shared/lib/cart-pass-work-steps'
import CartPassCostDetailsPopover from '@/components/powder-coating/CartPassCostDetailsPopover.vue'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<{
  cartPassStepCosts?: CartPassStepCost[]
  cartPassWorkSteps?: CartPassWorkStep[]
  costPerCartPassEur?: number
  minutesPerCartPass?: number
  totalCartPassMinutes?: number
  label?: string
  labelClass?: string
  valueClass?: string
  class?: string
}>(), {
  cartPassStepCosts: () => [],
  cartPassWorkSteps: () => [],
  label: 'Kosten pro Wagen-Durchgang',
})

const currency = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
})

function formatCurrency(value: number): string {
  return currency.format(value)
}

const costPerCartPass = computed(() => {
  if (props.costPerCartPassEur != null && Number.isFinite(props.costPerCartPassEur)) {
    return props.costPerCartPassEur
  }

  if (props.cartPassStepCosts.length > 0) {
    return props.cartPassStepCosts.reduce((sum, step) => sum + step.costPerCartPassEur, 0)
  }

  if (props.cartPassWorkSteps.length > 0) {
    return computeCartPassWorkStepBreakdown(props.cartPassWorkSteps).costPerCartPassEur
  }

  return 0
})

const resolvedMinutesPerCartPass = computed(() => {
  if (props.minutesPerCartPass != null && Number.isFinite(props.minutesPerCartPass)) {
    return props.minutesPerCartPass
  }

  if (props.cartPassStepCosts.length > 0) {
    return computeMinutesPerCartPass(props.cartPassStepCosts)
  }

  if (props.cartPassWorkSteps.length > 0) {
    return computeMinutesPerCartPass(props.cartPassWorkSteps)
  }

  return 0
})

const durationHint = computed(() => {
  const perPass = resolvedMinutesPerCartPass.value
  if (perPass <= 0) {
    return null
  }

  const perPassLabel = formatDurationMinutes(perPass)
  const total = props.totalCartPassMinutes

  if (total != null && Number.isFinite(total) && total > 0) {
    return `ca. ${perPassLabel}/Durchgang · ${formatDurationMinutes(total)} gesamt`
  }

  return `ca. ${perPassLabel} pro Durchgang`
})
</script>

<template>
  <div :class="cn('space-y-0.5', props.class)">
    <div class="flex items-center justify-between gap-3">
      <span :class="cn('text-muted-foreground', labelClass)">
        {{ label }}
      </span>
      <div class="flex items-center gap-1">
        <span :class="cn('font-semibold', valueClass)">
          {{ formatCurrency(costPerCartPass) }}
        </span>
        <CartPassCostDetailsPopover
          :cart-pass-step-costs="cartPassStepCosts"
          :cart-pass-work-steps="cartPassWorkSteps"
          :cost-per-cart-pass-eur="costPerCartPass"
        />
      </div>
    </div>
    <p
      v-if="durationHint"
      class="text-right text-[11px] leading-snug text-muted-foreground/75"
    >
      {{ durationHint }}
    </p>
  </div>
</template>
