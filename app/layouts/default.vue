<template>
  <div class="relative flex min-h-screen flex-col">
    <div
      class="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      <div
        class="absolute -top-1/3 left-1/2 h-[70%] w-full max-w-4xl -translate-x-1/2 rounded-full bg-primary/8 blur-3xl dark:bg-primary/12"
      />
      <div
        class="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[3.5rem_3.5rem] mask-[radial-gradient(ellipse_at_top,black_10%,transparent_70%)] opacity-40"
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
