<script setup lang="ts">
import type {
  PowderCoatingCatalog,
  PowderCoatingQuote,
} from '@/composables/usePowderCoatingQuote'
import type {
  CalculationMetadata,
  CalculationMetadataForm,
  PowderCoatingCalculationInput,
  SurfaceInputMode,
} from '#shared/types/powder-coating-calculation'
import type { StepConvertResult } from '#shared/types/step-model'
import type { StepFace } from '#shared/types/step-model'
import { emptyCalculationMetadataForm, storedToForm } from '#shared/types/powder-coating-calculation'
import {
  computeCostPerCartPass,
  computeMinutesPerCartPass,
  computeTotalCartPassMinutes,
  formatDurationMinutes,
} from '#shared/lib/cart-pass-work-steps'
import { calculateCartRunCost, getLastCartLoad } from '#shared/lib/cart-run-cost'
import CartPassCostInfo from '@/components/powder-coating/CartPassCostInfo.vue'
import { calculateHangingCapacity } from '#shared/lib/hanging-cart-capacity'
import { buildHangingCartLayout } from '#shared/lib/hanging-cart-layout'
import {
  type HangingMode,
  type OrientationMode,
  ORIENTATIONS_90,
  orientationFromKey,
  orientationKey,
  orientationLabel,
} from '#shared/lib/part-orientations'
import { POWDER_GRAMS_PER_M2 } from '#shared/lib/powder-constants'
import { calculatePowderConsumption } from '#shared/lib/powder-consumption'
import { calculatePowderCoatingQuote } from '#shared/lib/powder-coating-quote'
import {
  calculateSheetSurfaceArea,
  sheetMaterials,
  type SheetMaterialId,
} from '#shared/lib/sheet-metal-surface'
import HangingCartScene from '@/components/powder-coating/HangingCartScene.vue'
import PartModelViewer from '@/components/powder-coating/PartModelViewer.vue'
import PowderCoatingResume from '@/components/powder-coating/PowderCoatingResume.vue'
import PowderCoatingSavePanel from '@/components/powder-coating/PowderCoatingSavePanel.vue'
import PowderCoatingStepSidebar from '@/components/powder-coating/PowderCoatingStepSidebar.vue'
import SheetMetalSurfaceCalculator from '@/components/powder-coating/SheetMetalSurfaceCalculator.vue'
import StepFileUpload from '@/components/powder-coating/StepFileUpload.vue'
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioOption } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const props = defineProps<{
  catalog: PowderCoatingCatalog
  calculationId?: string
  initialMetadata?: CalculationMetadata
  initialInput?: PowderCoatingCalculationInput
  saving?: boolean
  /** When false (public demo), hide the save panel. Default true for edit flows. */
  allowSave?: boolean
}>()

const emit = defineEmits<{
  save: [metadata: CalculationMetadata, input: PowderCoatingCalculationInput]
}>()

const quote = defineModel<PowderCoatingQuote | null>('quote', { default: null })
const saveMetadata = defineModel<CalculationMetadataForm>('saveMetadata', {
  default: () => emptyCalculationMetadataForm(),
})

const showSavePanel = computed(() => props.allowSave !== false)

const steps = [
  { id: 'surface', label: 'Blechoberfläche' },
  { id: 'part', label: 'Bauteil, Aufhängung & Wagen' },
  { id: 'coating', label: 'Beschichtung & Vorbehandlung' },
  { id: 'resume', label: 'Ergebnis' },
] as const

const currentStep = ref(0)

const areaFormatter = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 6,
  maximumFractionDigits: 6,
})

const materialId = ref<SheetMaterialId>('steel')
const thicknessMm = ref('5')
const weightKg = ref('4')
const includeEdges = ref(true)
const surfaceAreaM2 = ref<number | null>(null)
const surfaceInputMode = ref<SurfaceInputMode>('sheet-metal')
const stepResult = ref<StepConvertResult | null>(null)
const stepFileName = ref<string | null>(null)
const stepModelId = ref<string | null>(null)
const stepModelGlbUrl = ref<string | null>(null)
const stepUploadError = ref<string | null>(null)
const stepPreviewUnavailable = ref(false)
const stepAutoSurfaceAreaM2 = ref<number | null>(null)
const stepFaceOverrides = ref<Record<string, boolean>>({})

const stepFaces = computed(() => stepResult.value?.faces ?? [])
const stepSurfaceAreaManuallyAdjusted = computed(() => {
  if (stepAutoSurfaceAreaM2.value == null || surfaceAreaM2.value == null) {
    return false
  }
  return Math.abs(surfaceAreaM2.value - stepAutoSurfaceAreaM2.value) > 1e-9
})

const partX = ref('400')
const partY = ref('300')
const partZ = ref('300')
const hangingMode = ref<HangingMode>('side_by_side')
const partSpacingX = ref(String(props.catalog.defaultPartSpacingMm.x))
const partSpacingY = ref(String(props.catalog.defaultPartSpacingMm.y))
const partSpacingZ = ref(String(props.catalog.defaultPartSpacingMm.z))
const orientationMode = ref<OrientationMode>('auto')
const orientationKeyValue = ref(orientationKey(ORIENTATIONS_90[0]!))

const cartX = ref(String(props.catalog.defaultCartDimensionsMm.x))
const cartY = ref(String(props.catalog.defaultCartDimensionsMm.y))
const cartZ = ref(String(props.catalog.defaultCartDimensionsMm.z))

const NO_PRETREATMENT_ID = '__none__'

const quantity = ref('1')
const threadsPerPart = ref('0')
const partialLastCart = ref(false)
const pretreatmentId = ref(NO_PRETREATMENT_ID)
const powderTypeId = ref(props.catalog.powderTypes[0]?.id ?? '')

watch(
  () => props.catalog.defaultCartDimensionsMm,
  (dims) => {
    cartX.value = String(dims.x)
    cartY.value = String(dims.y)
    cartZ.value = String(dims.z)
  },
  { deep: true },
)

watch(
  () => props.catalog.defaultPartSpacingMm,
  (spacing) => {
    partSpacingX.value = String(spacing.x)
    partSpacingY.value = String(spacing.y)
    partSpacingZ.value = String(spacing.z)
  },
  { deep: true },
)

const surfaceResult = computed(() => {
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

const stepTotalSurfaceAreaM2 = computed(() => stepResult.value?.totalSurfaceAreaM2 ?? null)

const effectiveSurfaceResult = computed(() => {
  if (surfaceInputMode.value === 'step') {
    const area = surfaceAreaM2.value
    if (area == null || area <= 0) {
      return null
    }
    return {
      volumeM3: 0,
      thicknessM: 0,
      singleSidedAreaM2: area / 2,
      edgeAreaM2: 0,
      totalAreaM2: area,
      steps: [],
    }
  }
  return surfaceResult.value
})

watch(surfaceInputMode, (mode) => {
  stepUploadError.value = null
  if (mode === 'sheet-metal') {
    stepResult.value = null
    stepFileName.value = null
    stepModelId.value = null
    stepModelGlbUrl.value = null
    stepPreviewUnavailable.value = false
    stepAutoSurfaceAreaM2.value = null
    stepFaceOverrides.value = {}
  }
  else {
    surfaceAreaM2.value = stepResult.value?.surfaceAreaM2 ?? null
  }
})

function onStepConverted(result: StepConvertResult) {
  stepUploadError.value = null
  stepPreviewUnavailable.value = false
  stepResult.value = result
  stepFileName.value = result.fileName
  stepModelId.value = result.modelId
  stepModelGlbUrl.value = result.glbUrl
  stepAutoSurfaceAreaM2.value = result.surfaceAreaM2
  stepFaceOverrides.value = {}
  surfaceAreaM2.value = result.surfaceAreaM2
  partX.value = String(Math.max(1, Math.round(result.boundingBoxMm.x)))
  partY.value = String(Math.max(1, Math.round(result.boundingBoxMm.y)))
  partZ.value = String(Math.max(1, Math.round(result.boundingBoxMm.z)))
}

function onStepUploadError(message: string) {
  stepUploadError.value = message
}

function onFaceAreaChanged(state: { overrides: Record<string, boolean>; adjustedSurfaceAreaM2: number }) {
  stepFaceOverrides.value = state.overrides
  surfaceAreaM2.value = state.adjustedSurfaceAreaM2
}

async function fetchStepFaces(modelId: string): Promise<StepFace[]> {
  try {
    return await $fetch<StepFace[]>(`/api/step/faces/${modelId}`)
  }
  catch {
    return []
  }
}

async function ensureStepFacesLoaded() {
  if (surfaceInputMode.value !== 'step' || !stepModelId.value) {
    return
  }

  if ((stepResult.value?.faces?.length ?? 0) > 0) {
    return
  }

  const faces = await fetchStepFaces(stepModelId.value)
  if (!faces.length || !stepResult.value) {
    return
  }

  stepResult.value = {
    ...stepResult.value,
    faces,
  }
}

const partDimensions = computed(() => ({
  x: Number(partX.value),
  y: Number(partY.value),
  z: Number(partZ.value),
}))

const cartDimensions = computed(() => ({
  x: Number(cartX.value),
  y: Number(cartY.value),
  z: Number(cartZ.value),
}))

const partSpacingMm = computed(() => ({
  x: Number(partSpacingX.value),
  y: Number(partSpacingY.value),
  z: Number(partSpacingZ.value),
}))

const selectedOrientation = computed(() => orientationFromKey(orientationKeyValue.value))

const hangingBaseInput = computed(() => {
  const part = partDimensions.value
  const cart = cartDimensions.value
  if (part.x <= 0 || part.y <= 0 || part.z <= 0 || cart.x <= 0 || cart.y <= 0 || cart.z <= 0) {
    return null
  }

  return {
    cartDimensionsMm: cart,
    partDimensionsMm: part,
    partSpacingMm: partSpacingMm.value,
    hangingMode: hangingMode.value,
    orientationMode: orientationMode.value,
    partOrientation: orientationMode.value === 'manual' ? selectedOrientation.value ?? undefined : undefined,
  }
})

const capacityInput = computed(() => {
  if (!hangingBaseInput.value) {
    return null
  }

  const qty = Number(quantity.value)
  return {
    ...hangingBaseInput.value,
    quantity: Number.isFinite(qty) && qty >= 1 ? qty : 1,
  }
})

const capacityResult = computed(() => {
  if (!capacityInput.value) {
    return null
  }
  return calculateHangingCapacity(capacityInput.value)
})

const lastCartLoad = computed(() => {
  if (!capacityResult.value || capacityResult.value.partsPerCart <= 0) {
    return null
  }

  const qty = Number(quantity.value)
  if (!Number.isFinite(qty) || qty < 1) {
    return null
  }

  return getLastCartLoad(qty, capacityResult.value.partsPerCart)
})

watch(lastCartLoad, (load) => {
  if (!load?.isPartial) {
    partialLastCart.value = false
  }
})

const cartLayout = computed(() => {
  if (!capacityInput.value) {
    return null
  }
  return buildHangingCartLayout(capacityInput.value)
})

const selectedPretreatment = computed(() =>
  pretreatmentId.value === NO_PRETREATMENT_ID
    ? undefined
    : props.catalog.pretreatments.find(o => o.id === pretreatmentId.value),
)

const selectedPowderType = computed(() =>
  props.catalog.powderTypes.find(o => o.id === powderTypeId.value),
)

const powderPreview = computed(() => {
  if (!effectiveSurfaceResult.value || !selectedPowderType.value) {
    return null
  }
  const qty = Number(quantity.value)
  if (!Number.isFinite(qty) || qty < 1) {
    return null
  }
  return calculatePowderConsumption({
    surfaceAreaM2: effectiveSurfaceResult.value.totalAreaM2,
    quantity: qty,
    overspray: props.catalog.globalOverspray,
  })
})

function isStepComplete(step: number): boolean {
  if (step === 0) {
    if (surfaceInputMode.value === 'step') {
      return effectiveSurfaceResult.value !== null && effectiveSurfaceResult.value.totalAreaM2 > 0
    }
    return surfaceResult.value !== null && surfaceResult.value.totalAreaM2 > 0
  }
  if (step === 1) {
    const p = partDimensions.value
    const c = cartDimensions.value
    const threads = Number(threadsPerPart.value)
    return p.x > 0 && p.y > 0 && p.z > 0
      && c.x > 0 && c.y > 0 && c.z > 0
      && partSpacingMm.value.x >= 0
      && partSpacingMm.value.y >= 0
      && partSpacingMm.value.z >= 0
      && Number.isFinite(threads) && threads >= 0
      && (orientationMode.value === 'auto' || selectedOrientation.value !== null)
      && capacityResult.value !== null
      && capacityResult.value.partsPerCart > 0
  }
  if (step === 2) {
    const qty = Number(quantity.value)
    return Number.isFinite(qty) && qty >= 1
      && Boolean(powderTypeId.value)
  }
  return true
}

const canProceed = computed(() => isStepComplete(currentStep.value))

function canNavigateToStep(index: number): boolean {
  if (index === currentStep.value) {
    return false
  }
  if (index < currentStep.value) {
    return true
  }
  for (let step = 0; step < index; step++) {
    if (!isStepComplete(step)) {
      return false
    }
  }
  return true
}

const hasCalculatedOnce = ref(false)

const calculatePayload = computed(() => {
  if (!effectiveSurfaceResult.value || !capacityInput.value || !capacityResult.value?.fitsInCart) {
    return null
  }

  return {
    quantity: Number(quantity.value),
    surfaceAreaM2: effectiveSurfaceResult.value.totalAreaM2,
    partDimensionsMm: partDimensions.value,
    partSpacingMm: partSpacingMm.value,
    hangingMode: hangingMode.value,
    orientationMode: orientationMode.value,
    partOrientation: orientationMode.value === 'manual'
      ? selectedOrientation.value ?? undefined
      : undefined,
    cartDimensionsMm: cartDimensions.value,
    pretreatmentId: pretreatmentId.value === NO_PRETREATMENT_ID ? '' : pretreatmentId.value,
    powderTypeId: powderTypeId.value,
    partialLastCart: partialLastCart.value,
    threadsPerPart: Math.max(0, Math.floor(Number(threadsPerPart.value) || 0)),
  }
})

const liveQuote = computed(() => {
  if (!calculatePayload.value) {
    return null
  }

  return calculatePowderCoatingQuote(calculatePayload.value, props.catalog)
})

const quoteInputIncomplete = computed(() => hasCalculatedOnce.value && !calculatePayload.value)

const cartRunCostPreview = computed(() => {
  if (!capacityResult.value || capacityResult.value.partsPerCart <= 0) {
    return null
  }

  const qty = Number(quantity.value)
  if (!Number.isFinite(qty) || qty < 1) {
    return null
  }

  const { partsPerCart, cartsNeeded } = capacityResult.value
  const costPerCartPass = computeCostPerCartPass(props.catalog.cartPassWorkSteps)
  const full = calculateCartRunCost(
    cartsNeeded,
    partsPerCart,
    qty,
    costPerCartPass,
    false,
  )
  const partial = calculateCartRunCost(
    cartsNeeded,
    partsPerCart,
    qty,
    costPerCartPass,
    true,
  )

  const minutesPerCartPass = computeMinutesPerCartPass(props.catalog.cartPassWorkSteps)
  const fullTime = computeTotalCartPassMinutes(
    minutesPerCartPass,
    cartsNeeded,
    partsPerCart,
    qty,
    false,
  )
  const partialTime = computeTotalCartPassMinutes(
    minutesPerCartPass,
    cartsNeeded,
    partsPerCart,
    qty,
    true,
  )

  return { full, partial, costPerCartPass, fullTime, partialTime }
})

const threadSealingCostPreview = computed(() => {
  const threads = Math.max(0, Math.floor(Number(threadsPerPart.value) || 0))
  const qty = Number(quantity.value)
  const rate = props.catalog.threadSealingRateEur ?? 0

  if (!Number.isFinite(qty) || qty < 1 || threads <= 0 || rate <= 0) {
    return 0
  }

  return threads * qty * rate
})

watchEffect(() => {
  quote.value = liveQuote.value
})

function activateCalculation() {
  hasCalculatedOnce.value = true
}

function goNext() {
  if (!canProceed.value || currentStep.value >= steps.length - 1) {
    return
  }

  currentStep.value += 1

  if (currentStep.value === 3) {
    activateCalculation()
  }
}

function goBack() {
  if (currentStep.value === 0) {
    return
  }
  currentStep.value -= 1
}

function goToStep(index: number) {
  if (!canNavigateToStep(index)) {
    return
  }

  currentStep.value = index

  if (index === 3) {
    activateCalculation()
  }
}

function exportCalculationInput(): PowderCoatingCalculationInput | null {
  const payload = calculatePayload.value
  if (!payload || !effectiveSurfaceResult.value) {
    return null
  }

  return {
    surfaceInputMode: surfaceInputMode.value,
    materialId: materialId.value,
    thicknessMm: Number(thicknessMm.value),
    weightKg: Number(weightKg.value),
    includeEdges: includeEdges.value,
    stepFileName: surfaceInputMode.value === 'step' ? stepFileName.value ?? undefined : undefined,
    stepModelId: surfaceInputMode.value === 'step' ? stepModelId.value ?? undefined : undefined,
    stepTotalSurfaceAreaM2: surfaceInputMode.value === 'step'
      ? stepResult.value?.totalSurfaceAreaM2
      : undefined,
    quoteInput: payload,
  }
}

function importCalculationInput(input: PowderCoatingCalculationInput) {
  surfaceInputMode.value = input.surfaceInputMode ?? 'sheet-metal'
  materialId.value = input.materialId
  thicknessMm.value = String(input.thicknessMm)
  weightKg.value = String(input.weightKg)
  includeEdges.value = input.includeEdges
  surfaceAreaM2.value = input.quoteInput.surfaceAreaM2
  stepFileName.value = input.stepFileName ?? null
  stepModelId.value = input.stepModelId ?? null
  stepModelGlbUrl.value = input.stepModelId
    ? `/api/step/download/${input.stepModelId}`
    : null
  stepPreviewUnavailable.value = surfaceInputMode.value === 'step' && !input.stepModelId

  if (surfaceInputMode.value === 'step') {
    stepResult.value = {
      modelId: input.stepModelId ?? '',
      glbUrl: stepModelGlbUrl.value ?? '',
      fileName: input.stepFileName ?? 'Gespeicherte Kalkulation',
      surfaceAreaM2: input.quoteInput.surfaceAreaM2,
      totalSurfaceAreaM2: input.stepTotalSurfaceAreaM2 ?? input.quoteInput.surfaceAreaM2,
      boundingBoxMm: input.quoteInput.partDimensionsMm,
      faces: [],
    }
    void ensureStepFacesLoaded()
  }
  else {
    stepResult.value = null
  }

  partX.value = String(input.quoteInput.partDimensionsMm.x)
  partY.value = String(input.quoteInput.partDimensionsMm.y)
  partZ.value = String(input.quoteInput.partDimensionsMm.z)
  partSpacingX.value = String(input.quoteInput.partSpacingMm.x)
  partSpacingY.value = String(input.quoteInput.partSpacingMm.y)
  partSpacingZ.value = String(input.quoteInput.partSpacingMm.z)
  hangingMode.value = input.quoteInput.hangingMode
  orientationMode.value = input.quoteInput.orientationMode

  if (input.quoteInput.partOrientation) {
    orientationKeyValue.value = orientationKey(input.quoteInput.partOrientation)
  }

  cartX.value = String(input.quoteInput.cartDimensionsMm.x)
  cartY.value = String(input.quoteInput.cartDimensionsMm.y)
  cartZ.value = String(input.quoteInput.cartDimensionsMm.z)

  quantity.value = String(input.quoteInput.quantity)
  threadsPerPart.value = String(input.quoteInput.threadsPerPart ?? 0)
  partialLastCart.value = input.quoteInput.partialLastCart ?? false
  pretreatmentId.value = input.quoteInput.pretreatmentId || NO_PRETREATMENT_ID
  powderTypeId.value = input.quoteInput.powderTypeId

  hasCalculatedOnce.value = true
  currentStep.value = 3
  activateCalculation()
}

function onSave(metadata: CalculationMetadata) {
  const input = exportCalculationInput()
  if (!input) {
    return
  }
  emit('save', metadata, input)
}

onMounted(() => {
  if (props.initialInput) {
    importCalculationInput(props.initialInput)
  }
  if (props.initialMetadata) {
    saveMetadata.value = storedToForm(props.initialMetadata)
  }
})
</script>

<template>
  <div class="@container min-w-0">
    <div class="grid gap-6 @min-[720px]:grid-cols-[minmax(0,1fr)_minmax(220px,280px)]">
      <div class="surface-card min-w-0 space-y-8 p-6">
        <div class="space-y-4">
          <p class="text-sm text-muted-foreground">
            Schritt {{ currentStep + 1 }} von {{ steps.length }}:
            <span class="font-medium text-foreground">{{ steps[currentStep]?.label }}</span>
          </p>
          <nav aria-label="Fortschritt" class="space-y-3">
            <ol class="grid grid-cols-4 gap-1 sm:gap-2">
              <li v-for="(step, index) in steps" :key="step.id" class="min-w-0">
                <button type="button"
                  class="flex w-full min-w-0 flex-col items-center gap-1.5 text-center transition-opacity sm:gap-2"
                  :class="cn(
                    canNavigateToStep(index)
                      ? 'cursor-pointer hover:opacity-80'
                      : 'cursor-default',
                  )" :disabled="!canNavigateToStep(index)" :aria-current="index === currentStep ? 'step' : undefined"
                  @click="goToStep(index)">
                  <span
                    class="flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium transition-colors sm:size-8 sm:text-sm"
                    :class="cn(
                      index === currentStep && 'border-primary bg-primary text-primary-foreground',
                      index < currentStep && 'border-primary bg-primary/10 text-primary',
                      index > currentStep && 'border-border text-muted-foreground',
                    )">
                    <CheckIcon v-if="index < currentStep" class="size-3.5 sm:size-4" />
                    <span v-else>{{ index + 1 }}</span>
                  </span>
                  <span class="w-full px-0.5 text-[10px] font-medium leading-tight line-clamp-2 sm:text-xs"
                    :class="index === currentStep ? 'text-foreground' : 'text-muted-foreground'">
                    {{ step.label }}
                  </span>
                </button>
              </li>
            </ol>
            <div class="h-1 w-full overflow-hidden rounded-full bg-muted">
              <div class="h-full rounded-full bg-primary transition-all duration-300"
                :style="{ width: `${((currentStep + 1) / steps.length) * 100}%` }" />
            </div>
          </nav>
        </div>

        <!-- Step 1: Surface -->
        <div v-if="currentStep === 0" class="space-y-6">
          <div class="space-y-1">
            <h2 class="text-lg font-medium">Oberfläche ermitteln</h2>
            <p class="text-sm text-muted-foreground">
              Blechkalkulation oder STEP-Datei zur Oberflächenberechnung.
            </p>
          </div>

          <fieldset class="space-y-3">
            <legend class="text-sm font-medium">
              Eingabemodus
            </legend>
            <RadioGroup v-model="surfaceInputMode" class="flex flex-col gap-3 sm:flex-row sm:gap-6">
              <RadioOption id="surface-mode-sheet" value="sheet-metal">
                Blechkalkulation
              </RadioOption>
              <RadioOption id="surface-mode-step" value="step">
                STEP-Datei
              </RadioOption>
            </RadioGroup>
          </fieldset>

          <SheetMetalSurfaceCalculator
            v-if="surfaceInputMode === 'sheet-metal'"
            v-model:material-id="materialId"
            v-model:thickness-mm="thicknessMm"
            v-model:weight-kg="weightKg"
            v-model:include-edges="includeEdges"
            v-model:surface-area-m2="surfaceAreaM2"
            :show-details="false"
          />

          <template v-else>
            <StepFileUpload
              @converted="onStepConverted"
              @error="onStepUploadError"
            />

            <p
              v-if="stepUploadError"
              class="text-sm text-destructive"
            >
              {{ stepUploadError }}
            </p>

            <p
              v-if="stepPreviewUnavailable"
              class="text-sm text-amber-600 dark:text-amber-500"
            >
              STEP-Datei erneut hochladen für 3D-Vorschau.
            </p>

            <div
              v-if="effectiveSurfaceResult"
              class="space-y-2 rounded-md border bg-background p-4"
            >
              <p class="text-sm font-medium">
                Oberfläche aus STEP-Datei
              </p>
              <p class="text-sm">
                Pulverbeschichtbare Außenfläche:
                <span class="font-semibold">{{ areaFormatter.format(effectiveSurfaceResult.totalAreaM2) }} m²</span>
                <span
                  v-if="stepSurfaceAreaManuallyAdjusted"
                  class="ml-2 text-xs font-normal text-amber-600 dark:text-amber-500"
                >
                  (manuell angepasst)
                </span>
              </p>
              <p
                v-if="stepTotalSurfaceAreaM2 != null"
                class="text-sm text-muted-foreground"
              >
                Gesamtfläche (alle Flächen):
                <span class="font-medium text-foreground">{{ areaFormatter.format(stepTotalSurfaceAreaM2) }} m²</span>
              </p>
              <p
                v-if="stepFileName"
                class="text-xs text-muted-foreground"
              >
                Datei: {{ stepFileName }}
              </p>
            </div>

            <ClientOnly>
              <PartModelViewer
                v-if="stepModelGlbUrl && !stepPreviewUnavailable"
                :model-url="stepModelGlbUrl"
                :faces="stepFaces"
                @face-area-changed="onFaceAreaChanged"
              />
            </ClientOnly>
          </template>
        </div>

        <!-- Step 2: Part, hanging & cart -->
        <div v-else-if="currentStep === 1" class="space-y-6">
          <div class="space-y-1">
            <h2 class="text-lg font-medium">Bauteil, Aufhängung & Wagen</h2>
            <p class="text-sm text-muted-foreground">
              Begrenzungsbox, Aufhängemodus und Wagenbauraum festlegen.
            </p>
          </div>

          <div class="space-y-3">
            <h3 class="text-sm font-medium">Bauteil</h3>
            <div class="grid gap-4 sm:grid-cols-3">
              <div class="space-y-2">
                <Label for="part-x">Länge X (mm)</Label>
                <Input id="part-x" v-model="partX" type="number" min="1" step="1" required />
              </div>
              <div class="space-y-2">
                <Label for="part-y">Tiefe Y (mm)</Label>
                <Input id="part-y" v-model="partY" type="number" min="1" step="1" required />
              </div>
              <div class="space-y-2">
                <Label for="part-z">Höhe Z (mm)</Label>
                <Input id="part-z" v-model="partZ" type="number" min="1" step="1" required />
              </div>
            </div>
            <div class="space-y-2">
              <Label for="threads-per-part">Anzahl Gewinde pro Bauteil</Label>
              <Input
                id="threads-per-part"
                v-model="threadsPerPart"
                type="number"
                min="0"
                step="1"
                required
              />
              <p class="text-xs text-muted-foreground">
                Gewinde werden vor dem Beschichten abgedeckt. Aufschlag:
                {{ catalog.threadSealingRateEur.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) }}/Gewinde
                (aus Einstellungen).
              </p>
              <p
                v-if="threadSealingCostPreview > 0"
                class="text-xs text-muted-foreground"
              >
                Vorschau Gewindekosten:
                <span class="font-medium text-foreground">
                  {{ threadSealingCostPreview.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) }}
                </span>
                ({{ Number(threadsPerPart) || 0 }} × {{ Number(quantity) || 0 }} Stk.)
              </p>
            </div>
          </div>

          <div class="space-y-3">
            <h3 class="text-sm font-medium">Aufhängung</h3>
            <fieldset class="space-y-3">
              <legend class="text-sm font-medium">Aufhängemodus</legend>
              <RadioGroup v-model="hangingMode" class="flex flex-col gap-3 sm:flex-row sm:gap-6">
                <RadioOption id="hanging-side-by-side" value="side_by_side">
                  Nebeneinander (X/Y)
                </RadioOption>
                <RadioOption id="hanging-stackable" value="stackable">
                  Stapelbar (X/Y/Z)
                </RadioOption>
              </RadioGroup>
            </fieldset>

            <div class="space-y-2">
              <Label>Teileabstand (mm)</Label>
              <div class="grid gap-4 sm:grid-cols-3">
                <div class="space-y-2">
                  <Label for="spacing-x" class="text-xs text-muted-foreground">X</Label>
                  <Input id="spacing-x" v-model="partSpacingX" type="number" min="0" step="1" required />
                </div>
                <div class="space-y-2">
                  <Label for="spacing-y" class="text-xs text-muted-foreground">Y</Label>
                  <Input id="spacing-y" v-model="partSpacingY" type="number" min="0" step="1" required />
                </div>
                <div class="space-y-2">
                  <Label for="spacing-z" class="text-xs text-muted-foreground">Z</Label>
                  <Input id="spacing-z" v-model="partSpacingZ" type="number" min="0" step="1" required />
                </div>
              </div>
            </div>

            <fieldset class="space-y-3">
              <legend class="text-sm font-medium">Orientierung (90°)</legend>
              <RadioGroup v-model="orientationMode" class="flex flex-col gap-3 sm:flex-row sm:gap-6">
                <RadioOption id="orientation-auto" value="auto">
                  Automatisch (max. Teile/Wagen)
                </RadioOption>
                <RadioOption id="orientation-manual" value="manual">
                  Manuell
                </RadioOption>
              </RadioGroup>
            </fieldset>

            <div v-if="orientationMode === 'manual'" class="space-y-2">
              <Label>Orientierung</Label>
              <Select v-model="orientationKeyValue">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Orientierung wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="orientation in ORIENTATIONS_90" :key="orientationKey(orientation)"
                    :value="orientationKey(orientation)">
                    {{ orientationLabel(orientation) }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div class="space-y-3">
            <h3 class="text-sm font-medium">Aufhängewagen</h3>
            <p class="text-xs text-muted-foreground">
              Standardmaße aus den Einstellungen — hier pro Kalkulation anpassbar.
            </p>
            <div class="grid gap-4 sm:grid-cols-3">
              <div class="space-y-2">
                <Label for="cart-x">Breite X (mm)</Label>
                <Input id="cart-x" v-model="cartX" type="number" min="1" step="1" required />
              </div>
              <div class="space-y-2">
                <Label for="cart-y">Tiefe Y (mm)</Label>
                <Input id="cart-y" v-model="cartY" type="number" min="1" step="1" required />
              </div>
              <div class="space-y-2">
                <Label for="cart-z">Höhe Z (mm)</Label>
                <Input id="cart-z" v-model="cartZ" type="number" min="1" step="1" required />
              </div>
            </div>
          </div>

          <p v-if="capacityResult && capacityResult.partsPerCart === 0" class="text-sm text-destructive">
            {{ capacityResult.reason ?? 'Teil passt nicht auf den gewählten Wagen.' }}
          </p>

          <ClientOnly>
            <HangingCartScene
              :layout="cartLayout"
              :part-model-url="surfaceInputMode === 'step' ? stepModelGlbUrl : null"
            />
          </ClientOnly>
        </div>

        <!-- Step 3: Coating -->
        <div v-else-if="currentStep === 2" class="space-y-6">
          <div class="space-y-1">
            <h2 class="text-lg font-medium">Beschichtung</h2>
            <p class="text-sm text-muted-foreground">
              Stückzahl, Vorbehandlung und Pulversorte wählen.
            </p>
          </div>

          <div class="space-y-2">
            <Label for="quantity">Stückzahl</Label>
            <Input id="quantity" v-model="quantity" type="number" min="1" step="1" required />
          </div>

          <div class="rounded-lg border bg-muted/40 p-4">
            <CartPassCostInfo
              :cart-pass-step-costs="liveQuote?.breakdown.cartPassStepCosts ?? []"
              :cart-pass-work-steps="catalog.cartPassWorkSteps"
              :cost-per-cart-pass-eur="liveQuote?.breakdown.costPerCartPassEur"
              :minutes-per-cart-pass="liveQuote?.breakdown.minutesPerCartPass"
              :total-cart-pass-minutes="liveQuote?.breakdown.totalCartPassMinutes"
              label-class="text-sm"
              value-class="text-sm"
            />
          </div>

          <div
            v-if="lastCartLoad?.isPartial && capacityResult"
            class="rounded-lg border bg-muted/40 p-4 space-y-3"
          >
            <label class="flex items-start gap-3 cursor-pointer">
              <input
                v-model="partialLastCart"
                type="checkbox"
                class="mt-0.5 size-4 shrink-0 rounded border accent-primary"
              >
              <span class="space-y-1">
                <span class="block text-sm font-medium">
                  Letzter Wagen nicht voll beladen
                </span>
                <span class="block text-sm text-muted-foreground">
                  Der letzte Wagen enthält nur {{ lastCartLoad.partsOnLastCart }} von
                  {{ capacityResult.partsPerCart }} Teilen
                  ({{ Math.round(lastCartLoad.loadFraction * 100) }}%).
                  Wagenkosten und Arbeitszeit werden anteilig berechnet.
                </span>
                <span
                  v-if="cartRunCostPreview"
                  class="block text-sm text-muted-foreground"
                >
                  Wagenkosten:
                  {{ cartRunCostPreview.full.cost.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) }}
                  →
                  <span class="font-medium text-foreground">
                    {{ (partialLastCart ? cartRunCostPreview.partial : cartRunCostPreview.full).cost.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) }}
                  </span>
                </span>
                <span
                  v-if="cartRunCostPreview?.fullTime.totalMinutes"
                  class="block text-sm text-muted-foreground"
                >
                  Arbeitszeit:
                  {{ formatDurationMinutes(cartRunCostPreview.fullTime.totalMinutes) }}
                  →
                  <span class="font-medium text-foreground">
                    {{ formatDurationMinutes((partialLastCart ? cartRunCostPreview.partialTime : cartRunCostPreview.fullTime).totalMinutes) }}
                  </span>
                </span>
              </span>
            </label>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <Label>Vorbehandlung</Label>
              <Select v-model="pretreatmentId">
                <SelectTrigger
                  class="w-full"
                  :class="pretreatmentId === NO_PRETREATMENT_ID && 'text-muted-foreground'"
                >
                  <SelectValue placeholder="Keine Vorbehandlung" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem :value="NO_PRETREATMENT_ID">
                    Keine Vorbehandlung
                  </SelectItem>
                  <SelectItem
                    v-for="option in catalog.pretreatments"
                    :key="option.id"
                    :value="option.id"
                  >
                    {{ option.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label>Pulvertyp</Label>
              <Select v-model="powderTypeId">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Pulvertyp wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="option in catalog.powderTypes" :key="option.id" :value="option.id">
                    {{ option.label }} ({{ option.costEurPerKg }} €/kg)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div
            v-if="powderPreview && effectiveSurfaceResult"
            class="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground"
          >
            <p class="font-medium text-foreground">
              Pulververbrauch
            </p>
            <p class="mt-1">
              {{ areaFormatter.format(effectiveSurfaceResult.totalAreaM2) }} m²
              × {{ POWDER_GRAMS_PER_M2 }} g/m²
              × Overspray {{ Number(catalog.globalOverspray).toLocaleString('de-DE') }}
              × {{ Number(quantity).toLocaleString('de-DE') }} Stück
              = {{ powderPreview.powderKgTotal.toLocaleString('de-DE', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) }} kg
            </p>
            <p v-if="selectedPowderType" class="mt-2">
              Pulverkosten:
              {{ powderPreview.powderKgTotal.toLocaleString('de-DE', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) }} kg
              × {{ selectedPowderType.costEurPerKg.toLocaleString('de-DE') }} €/kg
              = {{ (powderPreview.powderKgTotal * selectedPowderType.costEurPerKg).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) }}
            </p>
          </div>
        </div>

        <!-- Step 4: Result -->
        <div v-else-if="currentStep === 3" class="space-y-6">
          <PowderCoatingResume
            :surface-input-mode="surfaceInputMode"
            :step-file-name="stepFileName"
            :step-total-surface-area-m2="stepTotalSurfaceAreaM2"
            :material-label="sheetMaterials[materialId].label"
            :thickness-mm="Number(thicknessMm)"
            :weight-kg="Number(weightKg)"
            :include-edges="includeEdges"
            :surface-result="effectiveSurfaceResult"
            :part-dimensions="partDimensions"
            :cart-dimensions="cartDimensions"
            :hanging-mode="hangingMode"
            :part-spacing-mm="partSpacingMm"
            :capacity-result="capacityResult"
            :quantity="Number(quantity)"
            :pretreatment="selectedPretreatment"
            :powder-type="selectedPowderType"
            :powder-preview="powderPreview"
            :overspray-factor="catalog.globalOverspray"
            :quote="hasCalculatedOnce ? liveQuote : null"
          />
          <PowderCoatingSavePanel
            v-if="showSavePanel && hasCalculatedOnce && liveQuote"
            v-model:metadata="saveMetadata"
            :calculation-id="calculationId"
            :saving="saving"
            @save="onSave"
          />
        </div>

        <div class="flex items-center justify-between border-t pt-4">
          <Button type="button" variant="outline" :disabled="currentStep === 0" @click="goBack">
            <ArrowLeftIcon class="size-4" />
            Zurück
          </Button>
          <Button v-if="currentStep < steps.length - 1" type="button" :disabled="!canProceed" class="group"
            @click="goNext">
            Weiter
            <ArrowRightIcon class="size-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </div>

      <PowderCoatingStepSidebar
        :current-step="currentStep"
        :surface-input-mode="surfaceInputMode"
        :step-file-name="stepFileName"
        :step-total-surface-area-m2="stepTotalSurfaceAreaM2"
        :material-label="sheetMaterials[materialId].label"
        :thickness-mm="Number(thicknessMm)"
        :weight-kg="Number(weightKg)"
        :include-edges="includeEdges"
        :surface-result="effectiveSurfaceResult" :part-dimensions="partDimensions" :cart-dimensions="cartDimensions"
        :hanging-mode="hangingMode" :part-spacing-mm="partSpacingMm" :orientation-mode="orientationMode"
        :capacity-result="capacityResult" :quantity="Number(quantity)" :pretreatment="selectedPretreatment"
        :powder-type="selectedPowderType" :powder-preview="powderPreview"
        :cart-pass-work-steps="catalog.cartPassWorkSteps"
        :overspray-factor="catalog.globalOverspray" :quote="liveQuote"
        :partial-last-cart="partialLastCart"
        :quote-input-incomplete="quoteInputIncomplete" />
    </div>
  </div>
</template>
