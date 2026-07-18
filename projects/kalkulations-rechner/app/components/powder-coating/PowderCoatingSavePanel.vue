<script setup lang="ts">
import type { CalculationMetadataForm } from '#shared/types/powder-coating-calculation'
import { formToStored } from '#shared/types/powder-coating-calculation'
import { ImageIcon, SaveIcon, XIcon } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

defineProps<{
  calculationId?: string
  saving?: boolean
}>()

const emit = defineEmits<{
  save: [metadata: ReturnType<typeof formToStored>]
}>()

const metadata = defineModel<CalculationMetadataForm>('metadata', { required: true })

const imageInputRef = ref<HTMLInputElement | null>(null)
const imageError = ref<string | null>(null)

const MAX_IMAGE_BYTES = 2 * 1024 * 1024

function onImageSelect(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) {
    return
  }

  if (!file.type.startsWith('image/')) {
    imageError.value = 'Nur Bilddateien sind erlaubt.'
    return
  }

  if (file.size > MAX_IMAGE_BYTES) {
    imageError.value = 'Bild zu groß (max. 2 MB).'
    return
  }

  imageError.value = null
  const reader = new FileReader()
  reader.onload = () => {
    metadata.value = {
      ...metadata.value,
      imageData: String(reader.result),
    }
  }
  reader.readAsDataURL(file)
}

function removeImage() {
  metadata.value = {
    ...metadata.value,
    imageData: null,
  }
  imageError.value = null
  if (imageInputRef.value) {
    imageInputRef.value.value = ''
  }
}

function onSave() {
  emit('save', formToStored(metadata.value))
}
</script>

<template>
  <section class="space-y-4 rounded-lg border border-dashed p-4">
    <div class="space-y-1">
      <h3 class="text-sm font-medium">
        Kalkulation speichern
      </h3>
      <p class="text-sm text-muted-foreground">
        {{ calculationId ? 'Änderungen in der gespeicherten Kalkulation aktualisieren.' : 'Kalkulation für späteren Zugriff in der Datenbank ablegen.' }}
      </p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <div class="space-y-2">
        <Label for="calculation-title">Bezeichnung</Label>
        <Input id="calculation-title" v-model="metadata.title" type="text" maxlength="200"
          placeholder="z. B. Gehäuseblech Serie A" />
      </div>
      <div class="space-y-2">
        <Label for="calculation-artikel-number">Artikel-Nr.</Label>
        <Input id="calculation-artikel-number" v-model="metadata.artikelNumber" type="text" maxlength="100"
          placeholder="z. B. 00001545" />
      </div>
      <div class="space-y-2">
        <Label for="calculation-customer">Kunde</Label>
        <Input id="calculation-customer" v-model="metadata.customer" type="text" maxlength="200"
          placeholder="z. B. Muster GmbH" />
      </div>
      <div class="space-y-2">
        <Label for="calculation-created-by">Erstellt von</Label>
        <Input id="calculation-created-by" v-model="metadata.createdBy" type="text" maxlength="100"
          placeholder="z. B. Max Mustermann" />
      </div>
    </div>

    <div class="space-y-2">
      <Label for="calculation-description">Beschreibung</Label>
      <textarea id="calculation-description" v-model="metadata.description" rows="3" maxlength="2000"
        placeholder="Optionale Notizen zum Bauteil oder zur Kalkulation" :class="cn(
          'border-input focus-visible:border-ring focus-visible:ring-ring/50 w-full min-w-0 rounded-lg border bg-transparent px-2.5 py-2 text-base transition-colors focus-visible:ring-3 md:text-sm outline-none placeholder:text-muted-foreground',
        )" />
    </div>

    <div class="space-y-2">
      <Label for="calculation-image">Bild</Label>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div v-if="metadata.imageData" class="relative size-24 shrink-0 overflow-hidden rounded-lg border bg-muted">
          <img :src="metadata.imageData" alt="Vorschau" class="size-full object-cover">
          <Button type="button" variant="secondary" size="icon" class="absolute top-1 right-1 size-6"
            aria-label="Bild entfernen" @click="removeImage">
            <XIcon class="size-3.5" />
          </Button>
        </div>
        <div class="flex min-w-0 flex-1 flex-col gap-2">
          <Input id="calculation-image" ref="imageInputRef" type="file" accept="image/*"
            class="cursor-pointer file:cursor-pointer" @change="onImageSelect" />
          <p class="text-xs text-muted-foreground">
            Optional. JPEG, PNG oder WebP, max. 2 MB.
          </p>
          <p v-if="imageError" class="text-xs text-destructive">
            {{ imageError }}
          </p>
        </div>
        <div v-if="!metadata.imageData"
          class="flex size-24 shrink-0 items-center justify-center rounded-lg border border-dashed bg-muted/40 text-muted-foreground">
          <ImageIcon class="size-8 opacity-50" />
        </div>
      </div>
    </div>

    <Button type="button" :disabled="saving" @click="onSave">
      <SaveIcon class="size-4" />
      {{ calculationId ? 'Aktualisieren' : 'Speichern' }}
    </Button>
  </section>
</template>
