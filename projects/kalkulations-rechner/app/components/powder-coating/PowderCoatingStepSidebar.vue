<script setup lang="ts">
import type {
  PowderCoatingQuote,
  PowderTypeCatalogEntry,
  PretreatmentCatalogEntry,
} from '@/composables/usePowderCoatingQuote'
import type { CartPassWorkStep } from '#shared/lib/cart-pass-work-steps'
import {
  computeMinutesPerCartPass,
  computeTotalCartPassMinutes,
  formatDurationMinutes,
} from '#shared/lib/cart-pass-work-steps'
import CartPassCostDetailsPopover from '@/components/powder-coating/CartPassCostDetailsPopover.vue'
import CartPassCostInfo from '@/components/powder-coating/CartPassCostInfo.vue'
import type { HangingCapacityResult } from '#shared/lib/hanging-cart-capacity'
import { POWDER_GRAMS_PER_M2 } from '#shared/lib/powder-constants'
import type { PowderConsumptionResult } from '#shared/lib/powder-consumption'
import type { SheetSurfaceResult } from '#shared/lib/sheet-metal-surface'
import type { SurfaceInputMode } from '#shared/types/powder-coating-calculation'
import { orientationLabel } from '#shared/lib/part-orientations'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const props = defineProps<{
  currentStep: number
  surfaceInputMode?: SurfaceInputMode
  stepFileName?: string | null
  stepTotalSurfaceAreaM2?: number | null
  materialLabel: string
  thicknessMm: number
  weightKg: number
  includeEdges: boolean
  surfaceResult: SheetSurfaceResult | null
  partDimensions: { x: number; y: number; z: number }
  cartDimensions: { x: number; y: number; z: number }
  hangingMode: string
  partSpacingMm: { x: number; y: number; z: number }
  orientationMode: string
  capacityResult: HangingCapacityResult | null
  quantity: number
  pretreatment: PretreatmentCatalogEntry | undefined
  powderType: PowderTypeCatalogEntry | undefined
  powderPreview: PowderConsumptionResult | null
  cartPassWorkSteps: CartPassWorkStep[]
  oversprayFactor: number
  quote: PowderCoatingQuote | null
  quoteInputIncomplete?: boolean
  partialLastCart?: boolean
  pending?: boolean
}>()

const areaFormatter = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 6,
  maximumFractionDigits: 6,
})

const kgFormatter = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
})

const currency = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
})

function formatDeNumber(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) {
    return '—'
  }
  return value.toLocaleString('de-DE')
}

function formatCurrency(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) {
    return '—'
  }
  return currency.format(value)
}

const costPerPart = computed(() => {
  if (
    !props.quote
    || !Number.isFinite(props.quote.total)
    || !Number.isFinite(props.quantity)
    || props.quantity <= 0
  ) {
    return null
  }
  return props.quote.total / props.quantity
})

const powderMaterialCost = computed(() => {
  if (!props.powderPreview || !props.powderType) {
    return null
  }
  return props.powderPreview.powderKgTotal * props.powderType.costEurPerKg
})

function stepCardClass(stepIndex: number) {
  return cn(
    'transition-colors shadow-sm',
    props.currentStep === stepIndex && 'border-primary shadow-md',
  )
}

function isCartRunLine(label: string): boolean {
  return label.startsWith('Wagen-Durchgänge')
}

const cartPassTimePreview = computed(() => {
  if (props.quote?.breakdown.minutesPerCartPass != null) {
    return {
      minutesPerCartPass: props.quote.breakdown.minutesPerCartPass,
      totalCartPassMinutes: props.quote.breakdown.totalCartPassMinutes,
    }
  }

  if (!props.capacityResult || props.quantity <= 0 || props.cartPassWorkSteps.length === 0) {
    return null
  }

  const minutesPerCartPass = computeMinutesPerCartPass(props.cartPassWorkSteps)
  if (minutesPerCartPass <= 0) {
    return null
  }

  const { totalMinutes } = computeTotalCartPassMinutes(
    minutesPerCartPass,
    props.capacityResult.cartsNeeded,
    props.capacityResult.partsPerCart,
    props.quantity,
    props.partialLastCart ?? false,
  )

  return { minutesPerCartPass, totalCartPassMinutes: totalMinutes }
})
</script>

<template>
  <aside class="min-w-0 space-y-4">
    <div class="space-y-1">
      <h2 class="text-sm font-medium">
        Zwischenergebnisse
      </h2>
      <p class="text-xs text-muted-foreground">
        Ergebnisse aller Schritte werden hier fortlaufend angezeigt.
      </p>
    </div>

    <Card :class="stepCardClass(0)">
      <CardHeader class="pb-3">
        <CardTitle class="flex items-center gap-2 text-sm">
          <span class="flex size-6 items-center justify-center rounded-full border text-xs" :class="currentStep === 0 ? 'border-primary bg-primary text-primary-foreground' : 'text-muted-foreground'">1</span>
          {{ surfaceInputMode === 'step' ? 'Oberfläche (STEP)' : 'Blechoberfläche' }}
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-3 text-sm">
        <dl class="space-y-2">
          <div
            v-if="surfaceInputMode === 'step'"
            class="flex justify-between gap-3"
          >
            <dt class="text-muted-foreground">STEP-Datei</dt>
            <dd class="text-right font-medium">{{ stepFileName ?? '—' }}</dd>
          </div>
          <template v-else>
            <div class="flex justify-between gap-3">
              <dt class="text-muted-foreground">Material</dt>
              <dd class="text-right font-medium">{{ materialLabel }}</dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="text-muted-foreground">Dicke</dt>
              <dd class="text-right font-medium">{{ formatDeNumber(thicknessMm) }} mm</dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="text-muted-foreground">Gewicht</dt>
              <dd class="text-right font-medium">{{ formatDeNumber(weightKg) }} kg</dd>
            </div>
          </template>
        </dl>
        <Separator />
        <div v-if="surfaceResult">
          <p class="text-xs text-muted-foreground">
            <template v-if="surfaceInputMode === 'step'">
              Pulverbeschichtbare Außenfläche
            </template>
            <template v-else>
              Gesamtoberfläche{{ includeEdges ? ' (inkl. Kanten)' : '' }}
            </template>
          </p>
          <p class="text-lg font-semibold">{{ areaFormatter.format(surfaceResult.totalAreaM2) }} m²</p>
          <p
            v-if="surfaceInputMode === 'step' && stepTotalSurfaceAreaM2 != null"
            class="mt-1 text-xs text-muted-foreground"
          >
            Gesamtfläche (alle Flächen): {{ areaFormatter.format(stepTotalSurfaceAreaM2) }} m²
          </p>
        </div>
        <p v-else class="text-xs text-muted-foreground">Gültige Eingaben erforderlich.</p>
      </CardContent>
    </Card>

    <Card :class="stepCardClass(1)">
      <CardHeader class="pb-3">
        <CardTitle class="flex items-center gap-2 text-sm">
          <span class="flex size-6 items-center justify-center rounded-full border text-xs" :class="currentStep === 1 ? 'border-primary bg-primary text-primary-foreground' : 'text-muted-foreground'">2</span>
          Bauteil, Aufhängung & Wagen
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-3 text-sm">
        <dl class="space-y-2">
          <div class="flex justify-between gap-3">
            <dt class="text-muted-foreground">Bauteil</dt>
            <dd class="text-right font-medium">{{ partDimensions.x }}×{{ partDimensions.y }}×{{ partDimensions.z }} mm</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-muted-foreground">Wagen</dt>
            <dd class="text-right font-medium">{{ cartDimensions.x }}×{{ cartDimensions.y }}×{{ cartDimensions.z }} mm</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-muted-foreground">Modus</dt>
            <dd class="text-right font-medium">{{ hangingMode === 'stackable' ? 'Stapelbar' : 'Nebeneinander' }}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-muted-foreground">Abstand</dt>
            <dd class="text-right font-medium">{{ partSpacingMm.x }}×{{ partSpacingMm.y }}×{{ partSpacingMm.z }} mm</dd>
          </div>
        </dl>
        <Separator />
        <div v-if="capacityResult">
          <p class="text-xs text-muted-foreground">Teile pro Wagen</p>
          <p class="text-lg font-semibold">{{ capacityResult.partsPerCart }}</p>
          <p class="mt-1 text-xs text-muted-foreground">
            {{ orientationLabel(capacityResult.selectedOrientation) }}
          </p>
          <p v-if="!capacityResult.fitsInCart" class="mt-1 text-xs text-destructive">
            {{ capacityResult.reason }}
          </p>
        </div>
        <p v-else class="text-xs text-muted-foreground">Maße eingeben.</p>
      </CardContent>
    </Card>

    <Card :class="stepCardClass(2)">
      <CardHeader class="pb-3">
        <CardTitle class="flex items-center gap-2 text-sm">
          <span class="flex size-6 items-center justify-center rounded-full border text-xs" :class="currentStep === 2 ? 'border-primary bg-primary text-primary-foreground' : 'text-muted-foreground'">3</span>
          Beschichtung & Vorbehandlung
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-3 text-sm">
        <dl class="space-y-2">
          <div class="flex justify-between gap-3">
            <dt class="text-muted-foreground">Stückzahl</dt>
            <dd class="text-right font-medium">{{ formatDeNumber(quantity) }}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-muted-foreground">Vorbehandlung</dt>
            <dd class="text-right font-medium">{{ pretreatment?.label ?? 'Keine Vorbehandlung' }}</dd>
          </div>
          <div class="flex justify-between gap-3">
            <dt class="text-muted-foreground">Pulvertyp</dt>
            <dd class="text-right font-medium">{{ powderType?.label ?? '—' }}</dd>
          </div>
        </dl>
        <Separator />
        <div v-if="capacityResult && quantity > 0">
          <p class="text-xs text-muted-foreground">Benötigte Wagen</p>
          <p class="text-lg font-semibold">{{ capacityResult.cartsNeeded }}</p>
        </div>
        <CartPassCostInfo
          v-if="cartPassWorkSteps.length"
          :cart-pass-step-costs="quote?.breakdown.cartPassStepCosts ?? []"
          :cart-pass-work-steps="cartPassWorkSteps"
          :cost-per-cart-pass-eur="quote?.breakdown.costPerCartPassEur"
          :minutes-per-cart-pass="cartPassTimePreview?.minutesPerCartPass"
          :total-cart-pass-minutes="cartPassTimePreview?.totalCartPassMinutes"
          label-class="text-xs"
        />
        <div v-if="powderPreview" class="space-y-2">
          <div>
            <p class="text-xs text-muted-foreground">Pulver gesamt</p>
            <p class="font-semibold">{{ kgFormatter.format(powderPreview.powderKgTotal) }} kg</p>
            <p class="text-xs text-muted-foreground">
              {{ kgFormatter.format(powderPreview.powderKgPerPart) }} kg/Teil
            </p>
          </div>
          <p class="text-xs text-muted-foreground leading-relaxed">
            Verbrauch:
            {{ surfaceResult ? areaFormatter.format(surfaceResult.totalAreaM2) : '—' }} m²
            × {{ POWDER_GRAMS_PER_M2 }} g/m²
            × Overspray {{ formatDeNumber(oversprayFactor) }}
            × {{ formatDeNumber(quantity) }} Stück
          </p>
          <p
            v-if="powderType && powderMaterialCost !== null"
            class="text-xs text-muted-foreground leading-relaxed"
          >
            Pulverkosten:
            {{ kgFormatter.format(powderPreview.powderKgTotal) }} kg
            × {{ formatDeNumber(powderType.costEurPerKg) }} €/kg
            = {{ formatCurrency(powderMaterialCost) }}
          </p>
        </div>
      </CardContent>
    </Card>

    <Card :class="stepCardClass(3)">
      <CardHeader class="pb-3">
        <CardTitle class="flex items-center gap-2 text-sm">
          <span class="flex size-6 items-center justify-center rounded-full border text-xs" :class="currentStep === 3 ? 'border-primary bg-primary text-primary-foreground' : 'text-muted-foreground'">4</span>
          Kalkulation
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-3 text-sm">
        <div v-if="pending && !quote" class="space-y-2">
          <p class="text-xs text-muted-foreground">
            Berechne…
          </p>
          <Skeleton class="h-4 w-full" />
          <Skeleton class="h-4 w-3/4" />
          <Skeleton class="h-8 w-1/2" />
        </div>
        <div v-else-if="quote" class="space-y-3">
          <p
            v-if="quoteInputIncomplete"
            class="text-xs text-amber-600 dark:text-amber-500"
          >
            Eingaben unvollständig — letzter gültiger Stand.
          </p>
          <div v-if="quote.minimumApplied">
            <Badge variant="outline">Mindestpauschale</Badge>
          </div>
          <ul class="space-y-1.5 text-xs">
            <li v-for="(line, index) in quote.lines" :key="`${index}-${line.label}`" class="flex justify-between gap-3">
              <span class="flex items-center gap-0.5 text-muted-foreground">
                {{ line.label }}
                <CartPassCostDetailsPopover
                  v-if="isCartRunLine(line.label) && quote.breakdown.cartPassStepCosts?.length"
                  :cart-pass-step-costs="quote.breakdown.cartPassStepCosts"
                  :cost-per-cart-pass-eur="quote.breakdown.costPerCartPassEur"
                  button-class="size-6"
                />
              </span>
              <span class="shrink-0 font-medium">{{ formatCurrency(line.amount) }}</span>
            </li>
          </ul>
          <Separator />
          <div>
            <p class="text-xs text-muted-foreground">Gesamtbetrag</p>
            <p class="text-2xl font-semibold">{{ formatCurrency(quote.total) }}</p>
            <p
              v-if="quote.breakdown.totalCartPassMinutes && quote.breakdown.totalCartPassMinutes > 0"
              class="mt-0.5 text-[11px] text-muted-foreground/75"
            >
              Arbeitszeit Wagen-Durchgänge: ca. {{ formatDurationMinutes(quote.breakdown.totalCartPassMinutes) }}
            </p>
          </div>
          <div v-if="costPerPart !== null">
            <p class="text-xs text-muted-foreground">Kosten pro Teil</p>
            <p class="font-semibold">{{ formatCurrency(costPerPart) }}</p>
          </div>
        </div>
        <p v-else class="text-xs text-muted-foreground">
          Vervollständigen Sie die Eingaben in den vorherigen Schritten.
        </p>
      </CardContent>
    </Card>
  </aside>
</template>
