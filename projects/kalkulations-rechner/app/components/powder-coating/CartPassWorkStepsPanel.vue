<script setup lang="ts">
import type { CartPassStepCost, CartPassWorkStep } from '#shared/lib/cart-pass-work-steps'
import {
  computeCartPassStepCost,
  computeCartPassWorkStepBreakdown,
} from '#shared/lib/cart-pass-work-steps'
import { ChevronDownIcon, ChevronUpIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const props = withDefaults(defineProps<{
  mode?: 'edit' | 'readonly'
  compact?: boolean
  steps?: CartPassWorkStep[]
  readonlySteps?: CartPassStepCost[]
}>(), {
  mode: 'readonly',
  compact: false,
  steps: () => [],
  readonlySteps: () => [],
})

const emit = defineEmits<{
  'update:steps': [steps: CartPassWorkStep[]]
}>()

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
  if (props.mode === 'readonly' && props.readonlySteps.length > 0) {
    const costPerCartPassEur = props.readonlySteps.reduce(
      (sum, step) => sum + step.costPerCartPassEur,
      0,
    )
    return { steps: props.readonlySteps, costPerCartPassEur }
  }

  if (props.steps.length > 0) {
    return computeCartPassWorkStepBreakdown(props.steps)
  }

  return { steps: [], costPerCartPassEur: 0 }
})

function updateStep(index: number, field: 'minutesPerCartPass' | 'hourlyRateEur', value: number) {
  if (props.mode !== 'edit' || !props.steps.length) {
    return
  }

  const next = [...props.steps]
  const step = next[index]
  if (!step) {
    return
  }

  next[index] = { ...step, [field]: value }
  emit('update:steps', next)
}

function stepCostForEdit(step: CartPassWorkStep): number {
  return computeCartPassStepCost(step)
}

function moveStep(index: number, direction: -1 | 1) {
  if (props.mode !== 'edit' || !props.steps.length) {
    return
  }

  const targetIndex = index + direction
  if (targetIndex < 0 || targetIndex >= props.steps.length) {
    return
  }

  const next = [...props.steps]
  const [moved] = next.splice(index, 1)
  if (!moved) {
    return
  }

  next.splice(targetIndex, 0, moved)
  emit('update:steps', next)
}
</script>

<template>
  <div class="space-y-2">
    <p v-if="!compact" class="text-xs text-muted-foreground">
      Kosten pro Schritt: Min ÷ 60 × Stundensatz (€/h)
      <template v-if="mode === 'edit'">
        · Reihenfolge per Pfeiltasten anpassen
      </template>
    </p>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead v-if="mode === 'edit'" class="w-12" />
          <TableHead>Arbeitsgang</TableHead>
          <TableHead class="text-right">
            Min./Durchgang
          </TableHead>
          <TableHead class="text-right">
            Stundensatz
          </TableHead>
          <TableHead class="text-right">
            Kosten/Durchgang
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="mode === 'edit'">
          <TableRow v-for="(step, index) in steps" :key="step.id">
            <TableCell class="w-12 p-1">
              <div class="flex flex-col items-center gap-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  :disabled="index === 0"
                  :aria-label="`${step.label} nach oben`"
                  @click="moveStep(index, -1)"
                >
                  <ChevronUpIcon class="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  :disabled="index === steps.length - 1"
                  :aria-label="`${step.label} nach unten`"
                  @click="moveStep(index, 1)"
                >
                  <ChevronDownIcon class="size-4" />
                </Button>
              </div>
            </TableCell>
            <TableCell class="font-medium">
              {{ step.label }}
            </TableCell>
            <TableCell class="text-right">
              <Input
                :model-value="step.minutesPerCartPass"
                type="number"
                min="0.01"
                step="0.5"
                class="ml-auto w-24 text-right"
                @update:model-value="updateStep(index, 'minutesPerCartPass', Number($event))"
              />
            </TableCell>
            <TableCell class="text-right">
              <Input
                :model-value="step.hourlyRateEur"
                type="number"
                min="0"
                step="0.5"
                class="ml-auto w-24 text-right"
                @update:model-value="updateStep(index, 'hourlyRateEur', Number($event))"
              />
            </TableCell>
            <TableCell class="text-right font-medium">
              {{ formatCurrency(stepCostForEdit(step)) }}
            </TableCell>
          </TableRow>
        </template>
        <template v-else>
          <TableRow v-for="step in breakdown.steps" :key="step.id">
            <TableCell class="font-medium">
              {{ step.label }}
            </TableCell>
            <TableCell class="text-right text-muted-foreground">
              {{ formatNumber(step.minutesPerCartPass) }}
            </TableCell>
            <TableCell class="text-right text-muted-foreground">
              {{ formatCurrency(step.hourlyRateEur) }}/h
            </TableCell>
            <TableCell class="text-right font-medium">
              {{ formatCurrency(step.costPerCartPassEur) }}
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell :colspan="mode === 'edit' ? 4 : 3" class="font-medium">
            Kosten pro Wagen-Durchgang
          </TableCell>
          <TableCell class="text-right font-semibold">
            {{ formatCurrency(breakdown.costPerCartPassEur) }}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  </div>
</template>
