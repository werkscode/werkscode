<script setup lang="ts">
type ContactMessage = {
  id: string
  name: string
  email: string
  message: string
  readAt: string | null
  emailSentAt: string | null
  createdAt: string
}

type MessagesResponse = {
  messages: ContactMessage[]
  limit: number
  offset: number
}

const { t } = useI18n()
const token = ref('')
const isAuthenticated = ref(false)
const isLoading = ref(false)
const messages = ref<ContactMessage[]>([])
const expandedId = ref<string | null>(null)

const ADMIN_TOKEN_KEY = 'werkscode-admin-token'

useSeoMeta({
  title: () => t('admin.seo.title'),
  robots: 'noindex, nofollow',
})

function authHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${token.value}`,
  }
}

async function login() {
  if (!token.value.trim()) {
    return
  }

  isLoading.value = true

  try {
    await $fetch('/api/admin/contact-messages', {
      headers: authHeaders(),
    })
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token.value)
    isAuthenticated.value = true
    await loadMessages()
  }
  catch {
    isAuthenticated.value = false
    sessionStorage.removeItem(ADMIN_TOKEN_KEY)
  }
  finally {
    isLoading.value = false
  }
}

async function loadMessages() {
  isLoading.value = true

  try {
    const data = await $fetch<MessagesResponse>('/api/admin/contact-messages', {
      headers: authHeaders(),
    })
    messages.value = data.messages
  }
  catch {
    isAuthenticated.value = false
    sessionStorage.removeItem(ADMIN_TOKEN_KEY)
  }
  finally {
    isLoading.value = false
  }
}

async function markRead(message: ContactMessage) {
  if (message.readAt) {
    expandedId.value = expandedId.value === message.id ? null : message.id
    return
  }

  try {
    const data = await $fetch<{ readAt: string }>(`/api/admin/contact-messages/${message.id}`, {
      method: 'PATCH',
      headers: authHeaders(),
    })
    message.readAt = data.readAt
    expandedId.value = message.id
  }
  catch {
    // keep list usable on failure
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleString()
}

onMounted(() => {
  const stored = sessionStorage.getItem(ADMIN_TOKEN_KEY)

  if (stored) {
    token.value = stored
    isAuthenticated.value = true
    loadMessages()
  }
})
</script>

<template>
  <PageShell width="default">
    <PageHeader
      :title="t('admin.title')"
      :description="t('admin.description')"
    />

    <Card v-if="!isAuthenticated">
      <CardContent class="space-y-4 pt-6">
        <div class="space-y-2">
          <Label for="admin-token">{{ t('admin.tokenLabel') }}</Label>
          <Input
            id="admin-token"
            v-model="token"
            type="password"
            :placeholder="t('admin.tokenPlaceholder')"
            autocomplete="current-password"
            @keyup.enter="login"
          />
        </div>
        <Button :disabled="isLoading || !token.trim()" @click="login">
          {{ isLoading ? t('admin.loading') : t('admin.login') }}
        </Button>
      </CardContent>
    </Card>

    <div v-else class="space-y-4">
      <div class="flex items-center justify-between gap-4">
        <p class="text-sm text-muted-foreground">
          {{ t('admin.messageCount', { count: messages.length }) }}
        </p>
        <Button variant="outline" size="sm" :disabled="isLoading" @click="loadMessages">
          {{ t('admin.refresh') }}
        </Button>
      </div>

      <Card v-if="isLoading && messages.length === 0">
        <CardContent class="py-8 text-center text-muted-foreground">
          {{ t('admin.loading') }}
        </CardContent>
      </Card>

      <EmptyState v-else-if="messages.length === 0">
        {{ t('admin.empty') }}
      </EmptyState>

      <div v-else class="space-y-3">
        <Card
          v-for="message in messages"
          :key="message.id"
          class="cursor-pointer transition-colors hover:bg-muted/40"
          @click="markRead(message)"
        >
          <CardContent class="space-y-2 pt-6">
            <div class="flex flex-wrap items-center gap-2">
              <Badge v-if="!message.readAt" variant="default">
                {{ t('admin.unread') }}
              </Badge>
              <Badge v-if="message.emailSentAt" variant="secondary">
                {{ t('admin.emailSent') }}
              </Badge>
              <span class="text-sm text-muted-foreground">
                {{ formatDate(message.createdAt) }}
              </span>
            </div>

            <div class="flex flex-wrap items-baseline gap-2">
              <span class="font-medium">{{ message.name }}</span>
              <a
                :href="`mailto:${message.email}`"
                class="text-sm text-primary hover:underline"
                @click.stop
              >
                {{ message.email }}
              </a>
            </div>

            <p
              class="text-sm text-muted-foreground"
              :class="{ 'line-clamp-2': expandedId !== message.id }"
            >
              {{ message.message }}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  </PageShell>
</template>
