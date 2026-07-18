<script setup lang="ts">
import type { StepConvertResult } from '#shared/types/step-model'
import { Upload } from '@lucide/vue'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const emit = defineEmits<{
  converted: [result: StepConvertResult]
  error: [message: string]
}>()

const { loading, error, upload, reset } = useStepConversion()

const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const progress = ref(0)

const allowedExtensions = ['.step', '.stp']

function isValidFile(file: File): boolean {
  const name = file.name.toLowerCase()
  return allowedExtensions.some(ext => name.endsWith(ext))
}

async function handleUpload(file: File) {
  if (!isValidFile(file)) {
    emit('error', 'Ungültiges Dateiformat. Erlaubt: .step, .stp')
    return
  }

  selectedFile.value = file
  progress.value = 20

  const result = await upload(file)
  progress.value = result ? 100 : 0

  if (result) {
    emit('converted', result)
  }
  else if (error.value) {
    emit('error', error.value)
  }

  setTimeout(() => {
    progress.value = 0
  }, 500)
}

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    handleUpload(file)
  }
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) {
    handleUpload(file)
  }
}

function openFilePicker() {
  fileInput.value?.click()
}

function clearSelection() {
  selectedFile.value = null
  reset()
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>STEP-Datei hochladen</CardTitle>
      <CardDescription>
        Ziehen Sie eine .step- oder .stp-Datei hierher oder wählen Sie eine Datei aus.
      </CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <div
        class="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors"
        :class="isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'"
        @click="openFilePicker"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="onDrop"
      >
        <Upload class="mb-3 size-10 text-muted-foreground" />
        <p class="text-sm font-medium">
          Datei hier ablegen
        </p>
        <p class="mt-1 text-xs text-muted-foreground">
          oder klicken zum Auswählen
        </p>
        <input
          ref="fileInput"
          type="file"
          accept=".step,.stp"
          class="hidden"
          @change="onFileChange"
        >
      </div>

      <div v-if="selectedFile" class="flex items-center justify-between text-xs text-muted-foreground">
        <span>Ausgewählt: {{ selectedFile.name }}</span>
        <button
          type="button"
          class="text-primary hover:underline"
          @click.stop="clearSelection"
        >
          Entfernen
        </button>
      </div>

      <div v-if="loading || progress > 0" class="space-y-2">
        <p class="text-xs text-muted-foreground">
          {{ loading ? 'Konvertierung läuft…' : 'Fertig' }}
        </p>
        <div class="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            class="h-full rounded-full bg-primary transition-all duration-300"
            :style="{ width: `${progress}%` }"
          />
        </div>
      </div>

      <Button
        class="w-full"
        type="button"
        :disabled="loading"
        @click="openFilePicker"
      >
        Datei auswählen
      </Button>
    </CardContent>
  </Card>
</template>
