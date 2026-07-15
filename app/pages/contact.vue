<script setup lang="ts">
import { toast } from 'vue-sonner'

const { t } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: () => t('seo.contact.title'),
  description: () => t('seo.contact.description'),
})

const form = reactive({
  name: '',
  email: '',
  message: '',
  website: '',
})

const isSubmitting = ref(false)

async function onSubmit() {
  isSubmitting.value = true

  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: form,
    })

    toast.success(t('contact.toast.successTitle'), {
      description: t('contact.toast.successDescription'),
    })

    form.name = ''
    form.email = ''
    form.message = ''
    form.website = ''
  }
  catch {
    toast.error(t('contact.toast.errorTitle'), {
      description: t('contact.toast.errorDescription'),
    })
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <PageShell width="narrow">
    <PageHeader
      :title="t('contact.title')"
      :description="t('contact.description')"
    />

    <Card class="border-2 border-border/80">
      <CardContent class="pt-6">
        <form class="space-y-6" @submit.prevent="onSubmit">
          <div class="sr-only" aria-hidden="true">
            <Label for="website">{{ t('contact.website') }}</Label>
            <Input
              id="website"
              v-model="form.website"
              type="text"
              tabindex="-1"
              autocomplete="off"
            />
          </div>

          <div class="space-y-2">
            <Label for="name" class="font-mono-label normal-case tracking-normal text-foreground">
              {{ t('contact.name') }}
            </Label>
            <Input
              id="name"
              v-model="form.name"
              :placeholder="t('contact.namePlaceholder')"
              required
            />
          </div>

          <div class="space-y-2">
            <Label for="email" class="font-mono-label normal-case tracking-normal text-foreground">
              {{ t('contact.email') }}
            </Label>
            <Input
              id="email"
              v-model="form.email"
              type="email"
              :placeholder="t('contact.emailPlaceholder')"
              required
            />
          </div>

          <div class="space-y-2">
            <Label for="message" class="font-mono-label normal-case tracking-normal text-foreground">
              {{ t('contact.message') }}
            </Label>
            <Textarea
              id="message"
              v-model="form.message"
              :placeholder="t('contact.messagePlaceholder')"
              rows="5"
              required
            />
          </div>

          <Button type="submit" size="lg" :disabled="isSubmitting">
            {{ isSubmitting ? t('contact.submitting') : t('contact.submit') }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </PageShell>
</template>
