<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioOption } from '@/components/ui/radio-group'
import {
  calculateSheetSurfaceArea,
  sheetMaterials,
  type SheetMaterialId,
} from '#shared/lib/sheet-metal-surface'

const materialId = defineModel<SheetMaterialId>('materialId', { default: 'steel' })
const thicknessMm = defineModel<string>('thicknessMm', { default: '5' })
const weightKg = defineModel<string>('weightKg', { default: '4' })
const includeEdges = defineModel<boolean>('includeEdges', { default: true })

const surfaceAreaM2 = defineModel<number | null>('surfaceAreaM2', { default: null })

withDefaults(defineProps<{
  showDetails?: boolean
}>(), {
  showDetails: true,
})

const materialOptions = Object.values(sheetMaterials)

const areaFormatter = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 6,
  maximumFractionDigits: 6,
})

const result = computed(() => {
  const thickness = Number(thicknessMm.value)
  const weight = Number(weightKg.value)

  if (!Number.isFinite(thickness) || !Number.isFinite(weight)) {
    return null
  }

  return calculateSheetSurfaceArea({
    materialId: materialId.value,
    thicknessMm: thickness,
    weightKg: weight,
    includeEdges: includeEdges.value,
  })
})

watch(result, (value) => {
  surfaceAreaM2.value = value?.totalAreaM2 ?? null
}, { immediate: true })
</script>

<template>
  <div class="space-y-6 rounded-lg border bg-muted/30 p-4">
    <div class="space-y-1">
      <h3 class="text-sm font-medium">
        Blechoberfläche
      </h3>
      <p class="text-xs text-muted-foreground">
        Oberfläche aus Material, Blechdicke und Gewicht berechnen.
      </p>
    </div>

    <fieldset class="space-y-3">
      <legend class="text-sm font-medium">
        Material
      </legend>
      <RadioGroup v-model="materialId" class="flex flex-col gap-3">
        <RadioOption v-for="material in materialOptions" :id="`sheet-material-${material.id}`" :key="material.id"
          :value="material.id">
          {{ material.label }}
          <span class="text-muted-foreground">
            (ρ = {{ material.densityKgPerM3.toLocaleString('de-DE') }} kg/m³)
          </span>
        </RadioOption>
      </RadioGroup>
    </fieldset>

    <div class="grid gap-4 sm:grid-cols-2">
      <div class="space-y-2">
        <Label for="thickness-mm">Blechdicke (mm)</Label>
        <Input id="thickness-mm" v-model="thicknessMm" type="number" min="0.5" step="0.5" required />
      </div>

      <div class="space-y-2">
        <Label for="weight-kg">Gewicht (kg)</Label>
        <Input id="weight-kg" v-model="weightKg" type="number" min="0.01" step="0.01" required />
      </div>
    </div>

    <div v-if="showDetails && result" class="space-y-2 rounded-md border bg-background p-4">
      <p class="text-sm font-medium">
        Oberfläche
      </p>
      <p class="text-sm">
        Gesamtoberfläche{{ includeEdges ? ' (inkl. Kanten)' : ' (beide Seiten)' }}:
        <span class="font-semibold">{{ areaFormatter.format(result.totalAreaM2) }} m²</span>
      </p>
    </div>

    <label class="flex cursor-pointer items-center gap-2 text-sm">
      <input v-model="includeEdges" type="checkbox" class="size-4 rounded border accent-primary">
        Erweiterte Berechnung (inkl. Kanten)
    </label>

    <div v-if="showDetails && result" class="space-y-3">
      <p class="text-sm font-medium">
        Berechnung
      </p>
      <ol class="space-y-2 text-sm text-muted-foreground">
        <li v-for="(step, index) in result.steps" :key="step.label" class="rounded-md border bg-background px-3 py-2">
          <span class="font-medium text-foreground">{{ index + 1 }}. {{ step.label }}</span>
          <p class="mt-1 font-mono text-xs">
            {{ step.expression }}
          </p>
        </li>
      </ol>
    </div>
  </div>
</template>
