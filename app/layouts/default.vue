<template>
  <div class="relative flex min-h-screen flex-col">
    <div
      class="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      <div
        class="absolute inset-0 surface-hatch opacity-[0.35] dark:opacity-[0.15]"
      />
      <div
        class="absolute -right-1/4 top-0 h-[55%] w-[70%] max-w-3xl rounded-full bg-primary/6 blur-3xl dark:bg-primary/10"
      />
      <div
        class="absolute bottom-0 left-0 h-px w-full bg-border"
      />
    </div>

    <AppHeader />
    <main class="flex-1">
      <slot />
    </main>
    <AppFooter />
    <Toaster />
  </div>
</template>
