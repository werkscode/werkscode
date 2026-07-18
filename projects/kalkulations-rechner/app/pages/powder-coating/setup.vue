<script setup lang="ts">
import { CheckCircle2Icon } from '@lucide/vue'
import { toast } from 'vue-sonner'
import PowderCoatingSetupForm from '@/components/powder-coating/PowderCoatingSetupForm.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { PowderCoatingSetup } from '@/composables/usePowderCoatingQuote'

const { setup, pending, saving, error, loadSetup, saveSetup } = usePowderCoatingSetup()
const { persistenceEnabled } = usePersistenceEnabled()

const showSaveSuccess = ref(false)
let saveSuccessTimer: ReturnType<typeof setTimeout> | undefined

try {
  await loadSetup()
}
catch {
  // Fehler wird in der UI angezeigt
}

function flashSaveSuccess() {
  showSaveSuccess.value = true
  if (saveSuccessTimer) {
    clearTimeout(saveSuccessTimer)
  }
  saveSuccessTimer = setTimeout(() => {
    showSaveSuccess.value = false
  }, 4000)
}

onUnmounted(() => {
  if (saveSuccessTimer) {
    clearTimeout(saveSuccessTimer)
  }
})

async function onSubmit(payload: PowderCoatingSetup) {
  try {
    await saveSetup(payload)
    flashSaveSuccess()
  }
  catch {
    toast.error('Speichern fehlgeschlagen')
  }
}
</script>

<template>
  <div class="min-w-0 space-y-8">
    <section class="space-y-3">
      <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">
        Einstellungen
      </h1>
      <p class="max-w-2xl text-base text-muted-foreground">
        Kosten, Wagenmaße und Stammdaten für die Pulverbeschichtungs-Kalkulation.
      </p>
    </section>

    <div
      v-if="!persistenceEnabled"
      class="rounded-lg border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-950 dark:text-sky-100"
      role="status"
    >
      Demo-Modus: Änderungen werden nur in diesem Browser gespeichert (nicht auf dem Server).
    </div>

    <Card class="shadow-sm">
      <CardHeader>
        <CardTitle>Pulverbeschichtung — Setup</CardTitle>
        <CardDescription>
          <template v-if="persistenceEnabled">
            Änderungen werden in der Datenbank gespeichert und gelten für alle neuen Kalkulationen.
          </template>
          <template v-else>
            Änderungen gelten für neue Kalkulationen in diesem Browser (Pinia / localStorage).
          </template>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-1"
        >
          <div
            v-if="showSaveSuccess"
            class="mb-6 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-300"
            role="status"
            aria-live="polite"
          >
            <CheckCircle2Icon class="size-4 shrink-0" />
            Einstellungen wurden gespeichert.
          </div>
        </Transition>

        <div v-if="pending" class="space-y-4">
          <Skeleton class="h-4 w-48" />
          <Skeleton class="h-10 w-full" />
          <Skeleton class="h-10 w-full" />
          <Skeleton class="h-10 w-2/3" />
        </div>
        <div
          v-else-if="error"
          class="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive"
        >
          {{ error }}
        </div>
        <PowderCoatingSetupForm
          v-else-if="setup"
          :setup="setup"
          :saving="saving"
          :saved="showSaveSuccess"
          @submit="onSubmit"
        />
      </CardContent>
    </Card>
  </div>
</template>
