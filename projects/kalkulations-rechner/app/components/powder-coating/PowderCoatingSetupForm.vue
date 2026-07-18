<script setup lang="ts">
import type {
  PowderCoatingSetup,
  PowderTypeCatalogEntry,
  PretreatmentCatalogEntry,
} from '@/composables/usePowderCoatingQuote'
import { POWDER_GRAMS_PER_M2 } from '#shared/lib/powder-constants'
import CartPassWorkStepsPanel from '@/components/powder-coating/CartPassWorkStepsPanel.vue'
import { CheckIcon, PlusIcon, Trash2Icon } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const props = defineProps<{
  setup: PowderCoatingSetup
  saving?: boolean
  saved?: boolean
  /** When false, show a read-only form without submit. */
  readonly?: boolean
}>()

const emit = defineEmits<{
  submit: [payload: PowderCoatingSetup]
}>()

const isReadonly = computed(() => Boolean(props.readonly))

function cloneSetup(value: PowderCoatingSetup): PowderCoatingSetup {
  const raw = toRaw(value)
  return {
    pretreatments: raw.pretreatments.map(pretreatment => ({ ...toRaw(pretreatment) })),
    powderTypes: raw.powderTypes.map(powderType => ({ ...toRaw(powderType) })),
    defaultCartDimensionsMm: { ...toRaw(raw.defaultCartDimensionsMm) },
    cartPassWorkSteps: (raw.cartPassWorkSteps ?? []).map(step => ({ ...toRaw(step) })),
    globalOverspray: raw.globalOverspray,
    defaultPartSpacingMm: { ...toRaw(raw.defaultPartSpacingMm) },
    minimumChargeEur: raw.minimumChargeEur,
    threadSealingRateEur: raw.threadSealingRateEur ?? 0,
  }
}

const form = ref<PowderCoatingSetup>(cloneSetup(props.setup))

watch(
  () => props.setup,
  (value) => {
    form.value = cloneSetup(value)
  },
  { deep: true },
)

function createPretreatment(): PretreatmentCatalogEntry {
  return {
    id: crypto.randomUUID(),
    label: 'Neue Vorbehandlung',
    rateEurPerM2: 0,
  }
}

function createPowderType(): PowderTypeCatalogEntry {
  return {
    id: crypto.randomUUID(),
    label: 'Neue Pulversorte',
    costEurPerKg: 10,
    coatThicknessUm: 60,
    densityKgM3: 1400,
  }
}

function addPretreatment() {
  form.value.pretreatments.push(createPretreatment())
}

function removePretreatment(index: number) {
  if (form.value.pretreatments.length <= 1) {
    return
  }
  form.value.pretreatments.splice(index, 1)
}

function addPowderType() {
  form.value.powderTypes.push(createPowderType())
}

function removePowderType(index: number) {
  if (form.value.powderTypes.length <= 1) {
    return
  }
  form.value.powderTypes.splice(index, 1)
}

function validateForm(): boolean {
  const { defaultCartDimensionsMm, defaultPartSpacingMm, cartPassWorkSteps, globalOverspray, minimumChargeEur, threadSealingRateEur } = form.value

  const dims = [defaultCartDimensionsMm.x, defaultCartDimensionsMm.y, defaultCartDimensionsMm.z]
  if (dims.some(value => !Number.isFinite(value) || value <= 0)) {
    toast.error('Bitte gültige Wagenmaße eingeben.')
    return false
  }

  const spacing = [defaultPartSpacingMm.x, defaultPartSpacingMm.y, defaultPartSpacingMm.z]
  if (spacing.some(value => !Number.isFinite(value) || value < 0)) {
    toast.error('Bitte gültige Standard-Teileabstände eingeben.')
    return false
  }

  if (!Number.isFinite(globalOverspray) || globalOverspray <= 0) {
    toast.error('Bitte einen gültigen Overspray-Faktor eingeben.')
    return false
  }

  if (!Number.isFinite(minimumChargeEur) || minimumChargeEur < 0) {
    toast.error('Bitte eine gültige Mindestpauschale eingeben.')
    return false
  }

  if (!Number.isFinite(threadSealingRateEur) || threadSealingRateEur < 0) {
    toast.error('Bitte einen gültigen Aufschlag pro Gewinde eingeben.')
    return false
  }

  const invalidStep = cartPassWorkSteps.find(
    step =>
      !step.label.trim()
      || !Number.isFinite(step.minutesPerCartPass)
      || step.minutesPerCartPass <= 0
      || !Number.isFinite(step.hourlyRateEur)
      || step.hourlyRateEur < 0,
  )
  if (invalidStep) {
    toast.error(`Bitte gültige Werte für „${invalidStep.label}“ eingeben.`)
    return false
  }

  for (const pretreatment of form.value.pretreatments) {
    if (!pretreatment.label.trim() || !Number.isFinite(pretreatment.rateEurPerM2) || pretreatment.rateEurPerM2 < 0) {
      toast.error('Bitte alle Vorbehandlungen vollständig ausfüllen.')
      return false
    }
  }

  for (const powderType of form.value.powderTypes) {
    if (
      !powderType.label.trim()
      || !Number.isFinite(powderType.costEurPerKg)
      || powderType.costEurPerKg <= 0
    ) {
      toast.error('Bitte alle Pulversorten vollständig ausfüllen.')
      return false
    }
  }

  return true
}

function onSubmit() {
  if (isReadonly.value) {
    return
  }
  if (!validateForm()) {
    return
  }

  emit('submit', cloneSetup(form.value))
}
</script>

<template>
  <form class="space-y-10" novalidate @submit.prevent="onSubmit">
    <fieldset :disabled="isReadonly" class="min-w-0 space-y-10 border-0 p-0 disabled:opacity-90">
    <section class="space-y-4">
      <div class="space-y-1">
        <h2 class="text-lg font-medium">Wagenmaße</h2>
        <p class="text-sm text-muted-foreground">
          Standard-Bauraum für Kalkulationen. Im Wizard weiterhin pro Auftrag anpassbar.
        </p>
      </div>
      <div class="grid gap-4 sm:grid-cols-3">
        <div class="space-y-2">
          <Label for="cart-x">Breite X (mm)</Label>
          <Input id="cart-x" v-model.number="form.defaultCartDimensionsMm.x" type="number" min="1" required />
        </div>
        <div class="space-y-2">
          <Label for="cart-y">Tiefe Y (mm)</Label>
          <Input id="cart-y" v-model.number="form.defaultCartDimensionsMm.y" type="number" min="1" required />
        </div>
        <div class="space-y-2">
          <Label for="cart-z">Höhe Z (mm)</Label>
          <Input id="cart-z" v-model.number="form.defaultCartDimensionsMm.z" type="number" min="1" required />
        </div>
      </div>
    </section>

    <Separator />

    <section class="space-y-4">
      <div class="space-y-1">
        <h2 class="text-lg font-medium">Globale Parameter</h2>
        <p class="text-sm text-muted-foreground">
          Kostenfaktoren und Standardabstände für alle neuen Kalkulationen.
        </p>
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-2 sm:col-span-2">
          <Label>Kosten pro Wagen-Durchgang</Label>
          <p class="text-xs text-muted-foreground">
            Zusammensetzung aus Arbeitsgängen: Waschen, Trocknen, Aufhängen, Pulvern, Abhängen, Einbrennen.
          </p>
          <CartPassWorkStepsPanel
            :steps="form.cartPassWorkSteps"
            mode="edit"
            @update:steps="form.cartPassWorkSteps = $event"
          />
        </div>
        <div class="space-y-2">
          <Label for="min-charge">Mindestpauschale (€)</Label>
          <Input id="min-charge" v-model.number="form.minimumChargeEur" type="number" min="0" step="0.01" required />
        </div>
        <div class="space-y-2">
          <Label for="thread-sealing-rate">Aufschlag pro Gewinde (€)</Label>
          <Input id="thread-sealing-rate" v-model.number="form.threadSealingRateEur" type="number" min="0" step="0.01" required />
          <p class="text-xs text-muted-foreground">
            Gewinde müssen vor der Beschichtung abgedeckt werden. Dieser Satz gilt für alle Kalkulationen.
          </p>
        </div>
        <div class="space-y-2">
          <Label for="overspray">Overspray</Label>
          <Input id="overspray" v-model.number="form.globalOverspray" type="number" min="0.01" step="0.01" required />
          <p class="text-xs text-muted-foreground">
            Faktor auf den theoretischen Pulverbedarf (z. B. 1,54).
          </p>
        </div>
        <div class="space-y-2 sm:col-span-2">
          <Label>Standard-Teileabstand (mm)</Label>
          <div class="grid gap-4 sm:grid-cols-3">
            <div class="space-y-2">
              <Label for="spacing-x" class="text-xs text-muted-foreground">X</Label>
              <Input id="spacing-x" v-model.number="form.defaultPartSpacingMm.x" type="number" min="0" step="1" required />
            </div>
            <div class="space-y-2">
              <Label for="spacing-y" class="text-xs text-muted-foreground">Y</Label>
              <Input id="spacing-y" v-model.number="form.defaultPartSpacingMm.y" type="number" min="0" step="1" required />
            </div>
            <div class="space-y-2">
              <Label for="spacing-z" class="text-xs text-muted-foreground">Z</Label>
              <Input id="spacing-z" v-model.number="form.defaultPartSpacingMm.z" type="number" min="0" step="1" required />
            </div>
          </div>
        </div>
      </div>
    </section>

    <Separator />

    <section class="space-y-4">
      <div class="flex items-start justify-between gap-4">
        <div class="space-y-1">
          <h2 class="text-lg font-medium">Vorbehandlungen</h2>
          <p class="text-sm text-muted-foreground">
            Verfügbare Vorbehandlungsoptionen mit Preis pro Quadratmeter.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" @click="addPretreatment">
          <PlusIcon class="size-4" />
          Hinzufügen
        </Button>
      </div>
      <div class="space-y-3">
        <div
          v-for="(pretreatment, index) in form.pretreatments"
          :key="pretreatment.id"
          class="surface-card space-y-3 p-4"
        >
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm font-medium text-muted-foreground">
              Vorbehandlung {{ index + 1 }}
            </p>
            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  :disabled="form.pretreatments.length <= 1"
                  aria-label="Vorbehandlung entfernen"
                  @click="removePretreatment(index)"
                >
                  <Trash2Icon class="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Entfernen</TooltipContent>
            </Tooltip>
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            <div class="space-y-2">
              <Label>Bezeichnung</Label>
              <Input v-model="pretreatment.label" required />
            </div>
            <div class="space-y-2">
              <Label>Preis (€/m²)</Label>
              <Input v-model.number="pretreatment.rateEurPerM2" type="number" min="0" step="0.01" required />
            </div>
          </div>
        </div>
      </div>
    </section>

    <Separator />

    <section class="space-y-4">
      <div class="flex items-start justify-between gap-4">
        <div class="space-y-1">
          <h2 class="text-lg font-medium">Pulversorten</h2>
          <p class="text-sm text-muted-foreground">
            Stammdaten für Pulvertypen inklusive Preis (Verbrauch: {{ POWDER_GRAMS_PER_M2 }} g/m²).
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" @click="addPowderType">
          <PlusIcon class="size-4" />
          Hinzufügen
        </Button>
      </div>
      <div class="space-y-3">
        <div
          v-for="(powderType, index) in form.powderTypes"
          :key="powderType.id"
          class="surface-card space-y-3 p-4"
        >
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm font-medium text-muted-foreground">
              Pulversorte {{ index + 1 }}
            </p>
            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  :disabled="form.powderTypes.length <= 1"
                  aria-label="Pulversorte entfernen"
                  @click="removePowderType(index)"
                >
                  <Trash2Icon class="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Entfernen</TooltipContent>
            </Tooltip>
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            <div class="space-y-2 sm:col-span-2">
              <Label>Bezeichnung</Label>
              <Input v-model="powderType.label" required />
            </div>
            <div class="space-y-2">
              <Label>Preis (€/kg)</Label>
              <Input v-model.number="powderType.costEurPerKg" type="number" min="0.01" step="0.01" required />
            </div>
          </div>
        </div>
      </div>
    </section>

    <div v-if="!isReadonly" class="flex justify-end border-t pt-4">
      <Button
        type="submit"
        size="lg"
        :disabled="saving"
        :variant="saved && !saving ? 'outline' : 'default'"
        :class="saved && !saving && 'border-emerald-500/40 text-emerald-700 dark:text-emerald-300'"
      >
        <CheckIcon v-if="saved && !saving" class="size-4" />
        {{ saving ? 'Speichere…' : saved ? 'Gespeichert' : 'Einstellungen speichern' }}
      </Button>
    </div>
    </fieldset>
  </form>
</template>
