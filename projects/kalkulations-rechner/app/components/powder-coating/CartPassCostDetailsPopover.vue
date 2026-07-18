<script setup lang="ts">
import type { CartPassStepCost, CartPassWorkStep } from '#shared/lib/cart-pass-work-steps'
import { computeCartPassWorkStepBreakdown } from '#shared/lib/cart-pass-work-steps'
import { InfoIcon } from '@lucide/vue'
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'reka-ui'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<{
  cartPassStepCosts?: CartPassStepCost[]
  cartPassWorkSteps?: CartPassWorkStep[]
  costPerCartPassEur?: number
  buttonClass?: string
}>(), {
  cartPassStepCosts: () => [],
  cartPassWorkSteps: () => [],
})

const currency = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
})

const numberFormatter = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

function formatCurrency(value: number): string {
  return currency.format(value)
}

function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

const breakdown = computed(() => {
  if (props.cartPassStepCosts.length > 0) {
    const costPerCartPassEur = props.costPerCartPassEur ?? props.cartPassStepCosts.reduce(
      (sum, step) => sum + step.costPerCartPassEur,
      0,
    )
    return { steps: props.cartPassStepCosts, costPerCartPassEur }
  }

  if (props.cartPassWorkSteps.length > 0) {
    const computed = computeCartPassWorkStepBreakdown(props.cartPassWorkSteps)
    return {
      steps: computed.steps,
      costPerCartPassEur: props.costPerCartPassEur ?? computed.costPerCartPassEur,
    }
  }

  return { steps: [], costPerCartPassEur: props.costPerCartPassEur ?? 0 }
})
</script>

<template>
  <PopoverRoot v-if="breakdown.steps.length > 0">
    <PopoverTrigger as-child>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        :class="cn('size-7 text-muted-foreground', buttonClass)"
        aria-label="Arbeitsgänge anzeigen"
      >
        <InfoIcon class="size-3.5" />
      </Button>
    </PopoverTrigger>
    <PopoverPortal>
      <PopoverContent
        side="top"
        :side-offset="6"
        :class="cn(
          'bg-popover text-popover-foreground z-50 w-72 rounded-lg border p-3 shadow-md outline-none',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        )"
      >
        <p class="mb-2 text-xs font-medium">
          Arbeitsgänge pro Durchgang
        </p>
        <ul class="space-y-1.5 text-xs">
          <li
            v-for="step in breakdown.steps"
            :key="step.id"
            class="flex items-start justify-between gap-3"
          >
            <span class="text-muted-foreground">{{ step.label }}</span>
            <span class="shrink-0 text-right">
              <span class="font-medium">{{ formatCurrency(step.costPerCartPassEur) }}</span>
              <span class="block text-[10px] text-muted-foreground">
                {{ formatNumber(step.minutesPerCartPass) }} min × {{ formatCurrency(step.hourlyRateEur) }}/h
              </span>
            </span>
          </li>
        </ul>
        <div class="mt-2 flex justify-between border-t pt-2 text-xs font-medium">
          <span>Summe</span>
          <span>{{ formatCurrency(breakdown.costPerCartPassEur) }}</span>
        </div>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
