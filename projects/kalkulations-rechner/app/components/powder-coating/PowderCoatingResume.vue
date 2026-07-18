<script setup lang="ts">
import type {
  PowderCoatingQuote,
  PowderTypeCatalogEntry,
  PretreatmentCatalogEntry,
} from '@/composables/usePowderCoatingQuote'
import type { HangingCapacityResult } from '#shared/lib/hanging-cart-capacity'
import { POWDER_GRAMS_PER_M2 } from '#shared/lib/powder-constants'
import type { PowderConsumptionResult } from '#shared/lib/powder-consumption'
import type { SheetSurfaceResult } from '#shared/lib/sheet-metal-surface'
import type { SurfaceInputMode } from '#shared/types/powder-coating-calculation'
import { orientationLabel } from '#shared/lib/part-orientations'
import { formatDurationMinutes } from '#shared/lib/cart-pass-work-steps'
import CartPassCostDetailsPopover from '@/components/powder-coating/CartPassCostDetailsPopover.vue'
import CartPassCostInfo from '@/components/powder-coating/CartPassCostInfo.vue'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const props = defineProps<{
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
  capacityResult: HangingCapacityResult | null
  quantity: number
  pretreatment: PretreatmentCatalogEntry | undefined
  powderType: PowderTypeCatalogEntry | undefined
  powderPreview: PowderConsumptionResult | null
  oversprayFactor: number
  quote: PowderCoatingQuote | null
  pending?: boolean
  error?: string | null
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

function isCartRunLine(label: string): boolean {
  return label.startsWith('Wagen-Durchgänge')
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-1">
      <h2 class="text-lg font-medium">
        Kalkulationsergebnis
      </h2>
      <p class="text-sm text-muted-foreground">
        Zusammenfassung aller Eingaben und berechneter Kosten.
      </p>
    </div>

    <div v-if="pending" class="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
      Kalkulation wird durchgeführt…
    </div>

    <div v-else-if="error" class="rounded-md border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
      {{ error }}
    </div>

    <template v-else-if="quote">
      <section class="space-y-3 rounded-lg border p-4">
        <h3 class="text-sm font-medium">
          {{ surfaceInputMode === 'step' ? 'Oberfläche (STEP)' : 'Blechoberfläche' }}
        </h3>
        <dl class="grid gap-2 text-sm sm:grid-cols-2">
          <div
            v-if="surfaceInputMode === 'step'"
            class="flex justify-between gap-3 sm:block"
          >
            <dt class="text-muted-foreground">STEP-Datei</dt>
            <dd class="font-medium">{{ stepFileName ?? '—' }}</dd>
          </div>
          <div
            v-else
            class="flex justify-between gap-3 sm:block"
          >
            <dt class="text-muted-foreground">Material</dt>
            <dd class="font-medium">{{ materialLabel }}</dd>
          </div>
          <div class="flex justify-between gap-3 sm:block">
            <dt class="text-muted-foreground">
              {{ surfaceInputMode === 'step' ? 'Außenfläche' : 'Oberfläche' }}
            </dt>
            <dd class="font-medium">
              {{ surfaceResult ? areaFormatter.format(surfaceResult.totalAreaM2) : '—' }} m²
            </dd>
          </div>
          <div
            v-if="surfaceInputMode === 'step' && stepTotalSurfaceAreaM2 != null"
            class="flex justify-between gap-3 sm:block sm:col-span-2"
          >
            <dt class="text-muted-foreground">Gesamtfläche (alle Flächen)</dt>
            <dd class="font-medium">{{ areaFormatter.format(stepTotalSurfaceAreaM2) }} m²</dd>
          </div>
        </dl>
      </section>

      <section class="space-y-3 rounded-lg border p-4">
        <h3 class="text-sm font-medium">
          Bauteil, Aufhängung & Wagen
        </h3>
        <dl class="grid gap-2 text-sm sm:grid-cols-2">
          <div class="flex justify-between gap-3 sm:block">
            <dt class="text-muted-foreground">Bauteil (X×Y×Z)</dt>
            <dd class="font-medium">{{ partDimensions.x }}×{{ partDimensions.y }}×{{ partDimensions.z }} mm</dd>
          </div>
          <div class="flex justify-between gap-3 sm:block">
            <dt class="text-muted-foreground">Wagen (X×Y×Z)</dt>
            <dd class="font-medium">{{ cartDimensions.x }}×{{ cartDimensions.y }}×{{ cartDimensions.z }} mm</dd>
          </div>
          <div class="flex justify-between gap-3 sm:block">
            <dt class="text-muted-foreground">Teile pro Wagen</dt>
            <dd class="font-medium">{{ capacityResult?.partsPerCart ?? '—' }}</dd>
          </div>
          <div class="flex justify-between gap-3 sm:block">
            <dt class="text-muted-foreground">Benötigte Wagen</dt>
            <dd class="font-medium">{{ capacityResult?.cartsNeeded ?? '—' }}</dd>
          </div>
          <div
            v-if="quote.breakdown.cartPassStepCosts?.length"
            class="sm:col-span-2"
          >
            <CartPassCostInfo
              :cart-pass-step-costs="quote.breakdown.cartPassStepCosts"
              :cost-per-cart-pass-eur="quote.breakdown.costPerCartPassEur"
              :minutes-per-cart-pass="quote.breakdown.minutesPerCartPass"
              :total-cart-pass-minutes="quote.breakdown.totalCartPassMinutes"
            />
          </div>
          <div
            v-if="quote?.breakdown.partialLastCartApplied"
            class="sm:col-span-2 text-xs text-muted-foreground"
          >
            Letzter Wagen anteilig berechnet:
            {{ quote.breakdown.partsOnLastCart }} Teile
            ({{ Math.round(quote.breakdown.lastCartLoadFraction * 100) }}% Beladung)
          </div>
          <div v-if="capacityResult" class="sm:col-span-2 text-xs text-muted-foreground">
            {{ orientationLabel(capacityResult.selectedOrientation) }}
            · {{ hangingMode === 'stackable' ? 'Stapelbar' : 'Nebeneinander' }}
            · Abstand {{ partSpacingMm.x }}×{{ partSpacingMm.y }}×{{ partSpacingMm.z }} mm
          </div>
        </dl>
      </section>

      <section class="space-y-3 rounded-lg border p-4">
        <h3 class="text-sm font-medium">
          Beschichtung & Vorbehandlung
        </h3>
        <dl class="grid gap-2 text-sm sm:grid-cols-2">
          <div class="flex justify-between gap-3 sm:block">
            <dt class="text-muted-foreground">Stückzahl</dt>
            <dd class="font-medium">{{ formatDeNumber(quantity) }}</dd>
          </div>
          <div class="flex justify-between gap-3 sm:block">
            <dt class="text-muted-foreground">Vorbehandlung</dt>
            <dd class="font-medium">{{ pretreatment?.label ?? 'Keine Vorbehandlung' }}</dd>
          </div>
          <div class="flex justify-between gap-3 sm:block">
            <dt class="text-muted-foreground">Pulvertyp</dt>
            <dd class="font-medium">{{ powderType?.label ?? '—' }}</dd>
          </div>
          <div v-if="powderPreview" class="flex justify-between gap-3 sm:block">
            <dt class="text-muted-foreground">Pulver gesamt</dt>
            <dd class="font-medium">{{ kgFormatter.format(powderPreview.powderKgTotal) }} kg</dd>
          </div>
          <div v-if="powderPreview" class="sm:col-span-2">
            <dt class="text-muted-foreground">Pulververbrauch</dt>
            <dd class="mt-1 text-xs leading-relaxed text-muted-foreground">
              {{ surfaceResult ? areaFormatter.format(surfaceResult.totalAreaM2) : '—' }} m²
              × {{ POWDER_GRAMS_PER_M2 }} g/m²
              × Overspray {{ formatDeNumber(oversprayFactor) }}
              × {{ formatDeNumber(quantity) }} Stück
              = {{ kgFormatter.format(powderPreview.powderKgTotal) }} kg
            </dd>
          </div>
          <div
            v-if="powderPreview && powderType && powderMaterialCost !== null"
            class="sm:col-span-2"
          >
            <dt class="text-muted-foreground">Pulvermaterial</dt>
            <dd class="mt-1 text-xs leading-relaxed text-muted-foreground">
              {{ kgFormatter.format(powderPreview.powderKgTotal) }} kg
              × {{ formatDeNumber(powderType.costEurPerKg) }} €/kg
              = {{ formatCurrency(powderMaterialCost) }}
            </dd>
          </div>
        </dl>
      </section>

      <Separator />

      <section class="space-y-4">
        <h3 class="text-sm font-medium">
          Kostenaufstellung
        </h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Position</TableHead>
              <TableHead class="text-right">
                Betrag
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="line in quote.lines" :key="line.label">
              <TableCell>
                <div class="flex items-center gap-1">
                  <span>{{ line.label }}</span>
                  <CartPassCostDetailsPopover
                    v-if="isCartRunLine(line.label) && quote.breakdown.cartPassStepCosts?.length"
                    :cart-pass-step-costs="quote.breakdown.cartPassStepCosts"
                    :cost-per-cart-pass-eur="quote.breakdown.costPerCartPassEur"
                  />
                </div>
                <p
                  v-if="isCartRunLine(line.label) && quote.breakdown.costPerCartPassEur != null && capacityResult"
                  class="mt-1 text-xs text-muted-foreground"
                >
                  {{ formatCurrency(quote.breakdown.costPerCartPassEur) }} pro Durchgang
                  × {{ capacityResult.cartsNeeded }} Wagen
                  <template v-if="quote.breakdown.partialLastCartApplied">
                    (letzter anteilig)
                  </template>
                </p>
              </TableCell>
              <TableCell class="text-right">
                {{ formatCurrency(line.amount) }}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell class="font-medium">
                Zwischensumme
              </TableCell>
              <TableCell class="text-right font-medium">
                {{ formatCurrency(quote.subtotal) }}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <div v-if="quote.minimumApplied" class="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">
            Mindestpauschale
          </Badge>
          <span>
            Mindestbetrag von {{ formatCurrency(quote.minimumCharge) }} angewendet.
          </span>
        </div>

        <div class="space-y-3 border-t pt-4">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-lg font-semibold">Gesamt</span>
              <p
                v-if="quote.breakdown.totalCartPassMinutes && quote.breakdown.totalCartPassMinutes > 0"
                class="mt-0.5 text-[11px] font-normal text-muted-foreground/75"
              >
                Arbeitszeit Wagen-Durchgänge: ca. {{ formatDurationMinutes(quote.breakdown.totalCartPassMinutes) }}
              </p>
            </div>
            <span class="text-2xl font-semibold">
              {{ formatCurrency(quote.total) }}
            </span>
          </div>
          <div v-if="costPerPart !== null" class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground">Kosten pro Teil</span>
            <span class="font-semibold">{{ formatCurrency(costPerPart) }}</span>
          </div>
        </div>
      </section>
    </template>

    <div v-else class="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
      Keine Kalkulationsdaten vorhanden.
    </div>
  </div>
</template>
