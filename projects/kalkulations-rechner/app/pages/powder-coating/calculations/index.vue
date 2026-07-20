<script setup lang="ts">
import { HistoryIcon, PlusIcon, SearchIcon, Trash2Icon, XIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCalculationDateTime } from '#shared/lib/date-format'
import { formatCalculationLabel } from '#shared/types/powder-coating-calculation'

const router = useRouter()

usePageSeo({
  title: 'Gespeicherte Kalkulationen',
  description: 'Gespeicherte Pulverbeschichtungs-Kalkulationen durchsuchen und bearbeiten.',
  path: '/powder-coating/calculations',
  robots: 'noindex, nofollow',
})

const { calculations, pending, saving, error, loadList, deleteCalculation } = usePowderCoatingCalculations()
const {
  searchQuery,
  customerFilter,
  createdByFilter,
  customerOptions,
  createdByOptions,
  filteredCalculations,
  hasActiveFilters,
  resetFilters,
  allFilterValue,
} = useCalculationListFilters(calculations)

const currency = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
})

function formatCostPerPart(totalEur: number, quantity: number): string {
  if (!Number.isFinite(totalEur) || !Number.isFinite(quantity) || quantity <= 0) {
    return '—'
  }
  return currency.format(totalEur / quantity)
}

try {
  await loadList()
}
catch {
  // Fehler wird in der UI angezeigt
}

function openCalculation(id: string) {
  router.push(`/powder-coating/calculations/${id}`)
}

async function onDelete(id: string, label: string) {
  if (!confirm(`„${label}“ wirklich löschen?`)) {
    return
  }

  try {
    await deleteCalculation(id)
    toast.success('Kalkulation gelöscht')
  }
  catch {
    toast.error('Löschen fehlgeschlagen')
  }
}
</script>

<template>
  <div class="min-w-0 space-y-8">
    <section class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div class="space-y-3">
        <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">
          Gespeicherte Kalkulationen
        </h1>
        <p class="max-w-2xl text-base text-muted-foreground">
          Übersicht aller abgelegten Pulverbeschichtungs-Kalkulationen.
        </p>
      </div>
      <Button as-child>
        <NuxtLink to="/powder-coating">
          <PlusIcon class="size-4" />
          Neue Kalkulation
        </NuxtLink>
      </Button>
    </section>

    <div v-if="pending" class="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
      Kalkulationen werden geladen…
    </div>

    <div
      v-else-if="error"
      class="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive"
    >
      {{ error }}
    </div>

    <div
      v-else-if="calculations.length === 0"
      class="flex flex-col items-center gap-4 rounded-lg border border-dashed p-10 text-center"
    >
      <HistoryIcon class="size-10 text-muted-foreground/60" />
      <div class="space-y-1">
        <p class="font-medium">
          Noch keine Kalkulationen gespeichert
        </p>
        <p class="text-sm text-muted-foreground">
          Führen Sie eine Kalkulation durch und speichern Sie das Ergebnis im letzten Schritt.
        </p>
      </div>
      <Button as-child variant="outline">
        <NuxtLink to="/powder-coating">
          Zur Kalkulation
        </NuxtLink>
      </Button>
    </div>

    <div v-else class="space-y-4">
      <section class="surface-card space-y-4 p-4">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div class="min-w-0 flex-1 space-y-2">
            <Label for="calculation-search">Suche</Label>
            <div class="relative">
              <SearchIcon class="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="calculation-search"
                v-model="searchQuery"
                type="search"
                placeholder="Bezeichnung, Artikel-Nr., Kunde, Ersteller…"
                class="pl-8"
              />
            </div>
          </div>
          <div class="grid flex-1 gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <Label>Kunde</Label>
              <Select v-model="customerFilter">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Alle Kunden" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem :value="allFilterValue">
                    Alle Kunden
                  </SelectItem>
                  <SelectItem
                    v-for="customer in customerOptions"
                    :key="customer"
                    :value="customer"
                  >
                    {{ customer }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label>Erstellt von</Label>
              <Select v-model="createdByFilter">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Alle Ersteller" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem :value="allFilterValue">
                    Alle Ersteller
                  </SelectItem>
                  <SelectItem
                    v-for="creator in createdByOptions"
                    :key="creator"
                    :value="creator"
                  >
                    {{ creator }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>
            {{ filteredCalculations.length }} von {{ calculations.length }} Kalkulationen
          </span>
          <Button
            v-if="hasActiveFilters"
            type="button"
            variant="ghost"
            size="sm"
            @click="resetFilters"
          >
            <XIcon class="size-4" />
            Filter zurücksetzen
          </Button>
        </div>
      </section>

      <div
        v-if="filteredCalculations.length === 0"
        class="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground"
      >
        Keine Kalkulationen für die aktuelle Suche oder Filter gefunden.
      </div>

      <div v-else class="surface-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-14" />
              <TableHead>Bezeichnung</TableHead>
              <TableHead>Artikel-Nr.</TableHead>
              <TableHead>Kunde</TableHead>
              <TableHead>Erstellt von</TableHead>
              <TableHead class="text-right">
                Stückzahl
              </TableHead>
              <TableHead class="text-right">
                Pro Teil
              </TableHead>
              <TableHead class="text-right">
                Gesamt
              </TableHead>
              <TableHead>Erstellt</TableHead>
              <TableHead class="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="item in filteredCalculations"
              :key="item.id"
              class="cursor-pointer"
              @click="openCalculation(item.id)"
            >
              <TableCell>
                <div
                  class="flex size-10 items-center justify-center overflow-hidden rounded-md border bg-muted text-muted-foreground"
                >
                  <img
                    v-if="item.imageData"
                    :src="item.imageData"
                    :alt="formatCalculationLabel(item)"
                    class="size-full object-cover"
                  >
                  <span v-else class="text-xs">—</span>
                </div>
              </TableCell>
              <TableCell class="max-w-[220px]">
                <span class="block font-medium">
                  {{ formatCalculationLabel(item) }}
                </span>
                <p
                  v-if="item.description"
                  class="mt-0.5 truncate text-xs text-muted-foreground"
                >
                  {{ item.description }}
                </p>
              </TableCell>
              <TableCell class="text-muted-foreground">
                {{ item.artikelNumber || '—' }}
              </TableCell>
              <TableCell class="max-w-[160px] truncate text-muted-foreground">
                {{ item.customer || '—' }}
              </TableCell>
              <TableCell class="max-w-[140px] truncate text-muted-foreground">
                {{ item.createdBy || '—' }}
              </TableCell>
              <TableCell class="text-right">
                {{ item.quantity.toLocaleString('de-DE') }}
              </TableCell>
              <TableCell class="text-right">
                {{ formatCostPerPart(item.totalEur, item.quantity) }}
              </TableCell>
              <TableCell class="text-right">
                {{ currency.format(item.totalEur) }}
              </TableCell>
              <TableCell class="whitespace-nowrap text-muted-foreground">
                {{ formatCalculationDateTime(item.createdAt) }}
              </TableCell>
              <TableCell @click.stop>
                <div class="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    class="text-destructive hover:text-destructive"
                    :disabled="saving"
                    :aria-label="`Löschen: ${formatCalculationLabel(item)}`"
                    @click="onDelete(item.id, formatCalculationLabel(item))"
                  >
                    <Trash2Icon class="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  </div>
</template>
