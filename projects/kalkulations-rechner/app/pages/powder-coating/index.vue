<script setup lang="ts">
import { toast } from 'vue-sonner'
import PowderCoatingWizard from '@/components/powder-coating/PowderCoatingWizard.vue'
import type {
  CalculationMetadata,
  PowderCoatingCalculationInput,
} from '#shared/types/powder-coating-calculation'
import { emptyCalculationMetadataForm } from '#shared/types/powder-coating-calculation'

const router = useRouter()
const { catalog, quote, loadCatalog } = usePowderCoatingQuote()
const { saving, saveCalculation } = usePowderCoatingCalculations()
const { persistenceEnabled } = usePersistenceEnabled()
const { public: publicConfig } = useRuntimeConfig()

const saveMetadata = ref(emptyCalculationMetadataForm())

await loadCatalog()

async function onSave(metadata: CalculationMetadata, input: PowderCoatingCalculationInput) {
  try {
    const saved = await saveCalculation({ ...metadata, input })
    toast.success(
      persistenceEnabled.value
        ? 'Kalkulation gespeichert'
        : 'Kalkulation im Browser gespeichert',
    )
    await router.push(`/powder-coating/calculations/${saved.id}`)
  }
  catch {
    toast.error('Speichern fehlgeschlagen')
  }
}
</script>

<template>
  <div class="min-w-0 space-y-8">
    <section class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div class="space-y-3">
        <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">
          Pulverbeschichtung
        </h1>
        <p class="max-w-2xl text-base text-muted-foreground">
          Schrittweise Kalkulation für Blechbauteile: Oberfläche, Aufhängung, Pulververbrauch und Kosten.
        </p>
      </div>
      <Button as-child variant="outline">
        <NuxtLink to="/powder-coating/calculations">
          Gespeicherte Kalkulationen
        </NuxtLink>
      </Button>
    </section>

    <div
      v-if="!persistenceEnabled"
      class="rounded-lg border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-950 dark:text-sky-100"
      role="status"
    >
      <p class="font-medium">
        Demo-Modus — Speichern nur in diesem Browser
      </p>
      <p class="mt-1 text-sky-900/90 dark:text-sky-100/90">
        Kalkulationen und Einstellungen bleiben lokal (Pinia / localStorage) und gehen nicht auf den Server.
        Für Datenbank-Persistenz: Repo klonen und
        <code class="rounded bg-sky-500/20 px-1 py-0.5 text-xs">make kalkulator-dev</code>
        (
        <code class="rounded bg-sky-500/20 px-1 py-0.5 text-xs">NUXT_PUBLIC_PERSISTENCE_ENABLED=true</code>).
        <a
          :href="publicConfig.githubUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="font-medium underline underline-offset-2 hover:no-underline"
        >GitHub</a>
      </p>
    </div>

    <PowderCoatingWizard
      v-if="catalog"
      v-model:quote="quote"
      v-model:save-metadata="saveMetadata"
      :catalog="catalog"
      :saving="saving"
      @save="onSave"
    />
  </div>
</template>
