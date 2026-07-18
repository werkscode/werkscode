<script setup lang="ts">
import { CalculatorIcon, MenuIcon } from '@lucide/vue'
import { GithubIcon } from 'lucide-vue-next'
import AppNav from '@/components/layout/AppNav.vue'
import ThemeToggle from '@/components/layout/ThemeToggle.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const mobileNavOpen = ref(false)
const { public: publicConfig } = useRuntimeConfig()
</script>

<template>
  <div class="flex min-h-screen flex-col bg-background">
    <header class="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div class="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <div class="flex min-w-0 items-center gap-3">
          <Sheet v-model:open="mobileNavOpen">
            <SheetTrigger as-child>
              <Button
                variant="ghost"
                size="icon-sm"
                class="md:hidden"
                aria-label="Navigation öffnen"
              >
                <MenuIcon class="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" class="w-72">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <div class="mt-6">
                <p class="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Prozesse
                </p>
                <AppNav @navigate="mobileNavOpen = false" />
              </div>
            </SheetContent>
          </Sheet>

          <NuxtLink to="/" class="flex min-w-0 items-center gap-2.5">
            <span class="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted/50">
              <CalculatorIcon class="size-4" />
            </span>
            <span class="truncate text-lg font-semibold tracking-tight">
              Kalkulations-Tool
            </span>
          </NuxtLink>
        </div>

        <div class="flex shrink-0 items-center gap-2">
          <Badge variant="secondary" class="hidden sm:inline-flex">
            Proof of Concept
          </Badge>
          <Button
            as-child
            variant="ghost"
            size="icon-sm"
          >
            <a
              :href="publicConfig.githubUrl"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Quellcode auf GitHub"
              title="Quellcode auf GitHub"
            >
              <GithubIcon class="size-4" />
            </a>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>

    <div class="mx-auto flex w-full max-w-6xl flex-1 gap-8 px-4 py-8">
      <aside class="hidden w-56 shrink-0 md:block">
        <p class="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Prozesse
        </p>
        <AppNav />
      </aside>

      <Separator orientation="vertical" class="hidden md:block" />

      <main class="min-w-0 flex-1">
        <slot />
      </main>
    </div>

    <footer class="mt-auto border-t">
      <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 text-xs text-muted-foreground">
        <span>Kalkulations-Tool · WERKSCODE</span>
        <a
          :href="publicConfig.githubUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
        >
          <GithubIcon class="size-3.5" />
          Quellcode auf GitHub
        </a>
      </div>
    </footer>
  </div>
</template>
