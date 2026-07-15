<script setup lang="ts">
type TocLink = {
  id: string
  depth: number
  text: string
  children?: TocLink[]
}

type AiAssistKey = 'drafting' | 'editing' | 'translation' | 'code' | 'research' | 'images'

const props = defineProps<{
  title: string
  backTo: string
  backLabel: string
  tocLinks?: TocLink[]
  tocLabel?: string
  aiAssist?: AiAssistKey[]
  showEndCta?: boolean
}>()

const { t } = useI18n()
const localePath = useLocalePath()

const aiAssistLabels = computed(() =>
  (props.aiAssist ?? []).map(key => t(`blog.aiAssist.${key}`)),
)

const hasToc = computed(() => Boolean(props.tocLinks?.length && props.tocLabel))
</script>

<template>
  <PageShell :width="hasToc ? 'default' : 'narrow'">
    <article>
      <header class="max-w-3xl space-y-4 border-b-2 border-foreground/10 pb-8">
        <Button variant="ghost" size="sm" class="-ml-2 whitespace-nowrap" as-child>
          <NuxtLink :to="backTo">
            {{ backLabel }}
          </NuxtLink>
        </Button>
        <h1 class="break-words text-4xl leading-[1.05] min-w-0 sm:text-5xl">
          {{ title }}
        </h1>
        <div
          v-if="$slots.meta"
          class="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
        >
          <slot name="meta" />
        </div>
        <p
          v-if="aiAssistLabels.length"
          class="text-sm text-muted-foreground"
        >
          {{ t('blog.aiAssist.label') }}: {{ aiAssistLabels.join(', ') }}.
          <NuxtLink
            :to="localePath('/transparency')"
            class="text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            {{ t('blog.endCta.transparency') }}
          </NuxtLink>
        </p>
      </header>

      <div
        class="mt-10"
        :class="hasToc
          ? 'lg:flex lg:items-stretch lg:gap-12 xl:gap-16'
          : 'max-w-3xl'"
      >
        <div class="min-w-0 w-full max-w-3xl">
          <ArticleToc
            v-if="hasToc"
            :links="tocLinks!"
            :label="tocLabel!"
            class="mb-8 lg:hidden"
          />

          <div class="prose-content mt-0">
            <slot />
          </div>

          <section
            v-if="showEndCta"
            class="mt-12 flex flex-col gap-4 border-2 border-foreground/10 bg-card px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6"
          >
            <p class="font-heading text-lg leading-snug sm:text-xl">
              {{ t('blog.endCta.text') }}
            </p>
            <div class="flex shrink-0 flex-wrap gap-3">
              <Button size="lg" as-child>
                <NuxtLink :to="localePath('/contact')">
                  {{ t('blog.endCta.contact') }}
                </NuxtLink>
              </Button>
              <Button variant="outline" size="lg" as-child>
                <NuxtLink :to="localePath('/transparency')">
                  {{ t('blog.endCta.transparency') }}
                </NuxtLink>
              </Button>
            </div>
          </section>
        </div>

        <aside
          v-if="hasToc"
          class="relative hidden w-56 shrink-0 lg:block xl:w-64"
        >
          <div class="sticky top-28">
            <ArticleToc
              :links="tocLinks!"
              :label="tocLabel!"
            />
          </div>
        </aside>
      </div>
    </article>
  </PageShell>
</template>
