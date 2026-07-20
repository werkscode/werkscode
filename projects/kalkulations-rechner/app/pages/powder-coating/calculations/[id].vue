<script setup lang="ts">
import { toast } from 'vue-sonner'
import PowderCoatingWizard from '@/components/powder-coating/PowderCoatingWizard.vue'
import { Button } from '@/components/ui/button'
import type {
  CalculationMetadata,
  PowderCoatingCalculationInput,
} from '#shared/types/powder-coating-calculation'
import {
  emptyCalculationMetadataForm,
  formatCalculationLabel,
  storedToForm,
} from '#shared/types/powder-coating-calculation'

const route = useRoute()
const id = computed(() => String(route.params.id))

const { catalog, quote, loadCatalog } = usePowderCoatingQuote()
const { current, pending, saving, loadOne, saveCalculation } = usePowderCoatingCalculations()
const { persistenceEnabled } = usePersistenceEnabled()

const saveMetadata = ref(emptyCalculationMetadataForm())

const pageLabel = computed(() => {
  if (!current.value) {
    return 'Kalkulation'
  }
  return formatCalculationLabel(current.value)
})

usePageSeo({
  title: () => pageLabel.value,
  description: 'Gespeicherte Pulverbeschichtungs-Kalkulation bearbeiten.',
  path: () => `/powder-coating/calculations/${id.value}`,
  robots: 'noindex, nofollow',
})

await loadCatalog()

try {
  await loadOne(id.value)
}
catch {
  // Fehler wird in der UI angezeigt
}

watch(current, (value) => {
  if (value) {
    saveMetadata.value = storedToForm(value)
  }
}, { immediate: true })

async function onSave(metadata: CalculationMetadata, input: PowderCoatingCalculationInput) {
  try {
    const saved = await saveCalculation({ ...metadata, input }, id.value)
    saveMetadata.value = storedToForm(saved)
    toast.success(
      persistenceEnabled.value
        ? 'Kalkulation aktualisiert'
        : 'Kalkulation im Browser aktualisiert',
    )
  }
  catch {
    toast.error('Speichern fehlgeschlagen')
  }
}
</script>

<template>
  <div class="min-w-0 space-y-8">
    <section class="space-y-4">
      <div class="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <NuxtLink to="/powder-coating/calculations" class="hover:text-foreground hover:underline">
          Gespeicherte Kalkulationen
        </NuxtLink>
        <span>/</span>
        <span class="text-foreground">
          {{ pageLabel }}
        </span>
      </div>

      <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div
          v-if="current?.imageData"
          class="size-20 shrink-0 overflow-hidden rounded-lg border bg-muted sm:size-24"
        >
          <img
            :src="current.imageData"
            :alt="pageLabel"
            class="size-full object-cover"
          >
        </div>
        <div class="min-w-0 space-y-2">
          <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">
            {{ pageLabel }}
          </h1>
          <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <p v-if="current?.artikelNumber">
              Artikel-Nr. {{ current.artikelNumber }}
            </p>
            <p v-if="current?.customer">
              Kunde: {{ current.customer }}
            </p>
            <p v-if="current?.createdBy">
              Erstellt von: {{ current.createdBy }}
            </p>
          </div>
          <p v-if="current?.description" class="max-w-2xl text-sm text-muted-foreground whitespace-pre-wrap">
            {{ current.description }}
          </p>
        </div>
      </div>
    </section>

    <div v-if="pending" class="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
      Kalkulation wird geladen…
    </div>

    <div
      v-else-if="!current"
      class="space-y-4 rounded-lg border border-destructive/50 bg-destructive/5 p-6"
    >
      <p class="text-sm text-destructive">
        Kalkulation nicht gefunden.
      </p>
      <Button as-child variant="outline">
        <NuxtLink to="/powder-coating/calculations">
          Zur Übersicht
        </NuxtLink>
      </Button>
    </div>

    <PowderCoatingWizard
      v-else-if="catalog"
      :key="current.id"
      v-model:quote="quote"
      v-model:save-metadata="saveMetadata"
      :catalog="catalog"
      :calculation-id="current.id"
      :initial-metadata="current"
      :initial-input="current.input"
      :saving="saving"
      @save="onSave"
    />
  </div>
</template>
