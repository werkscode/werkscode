<script setup lang="ts">
import { toast } from 'vue-sonner'

const { t } = useI18n()
const localePath = useLocalePath()
const { public: publicConfig } = useRuntimeConfig()

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

    <div class="mb-8 space-y-4 border-2 border-border/80 bg-muted/20 px-5 py-6 sm:px-6">
      <p class="text-sm leading-relaxed text-foreground">
        {{ t('contact.trust.who') }}
      </p>
      <p class="text-sm text-muted-foreground">
        {{ t('contact.trust.response') }}
      </p>
      <p class="text-sm text-muted-foreground">
        {{ t('contact.trust.privacy') }}
      </p>
      <nav class="flex flex-wrap gap-x-4 gap-y-2 pt-1 text-sm">
        <NuxtLink
          :to="localePath('/about')"
          class="whitespace-nowrap text-primary transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          {{ t('contact.links.about') }}
        </NuxtLink>
        <NuxtLink
          :to="localePath('/transparency')"
          class="whitespace-nowrap text-primary transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          {{ t('contact.links.transparency') }}
        </NuxtLink>
        <a
          :href="publicConfig.githubUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="whitespace-nowrap text-primary transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-ring"
        >
          {{ t('contact.links.github') }}
        </a>
      </nav>
    </div>

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
