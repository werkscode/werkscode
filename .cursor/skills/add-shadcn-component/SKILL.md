---
name: add-shadcn-component
description: Adds shadcn-vue UI components to the WERKSCODE Nuxt app with i18n-aware usage. Use when the user asks to add a shadcn component or new UI component.
disable-model-invocation: true
---

# Add shadcn Component

## Checklist

```
- [ ] Add component via CLI
- [ ] Verify it landed in app/components/ui/
- [ ] Import from @/components/ui/...
- [ ] Wrap user-facing labels with i18n keys
- [ ] Add optimizeDeps entry only if Vite warns
```

## Install

On host:

```bash
pnpm dlx shadcn-vue@latest add <component>
```

In Docker (dev stack running):

```bash
make dev-shell
pnpm dlx shadcn-vue@latest add <component>
```

Or rebuild after adding to `package.json`: `make dev-rebuild`

## Config

`nuxt.config.ts`:

```ts
shadcn: {
  prefix: '',
  componentDir: '@/components/ui',
}
```

## Usage

```vue
import { Button } from '@/components/ui/button'
```

Layout components are separate — `app/components/layout/` with `pathPrefix: false`.

## Toasts

Use existing pattern: `toast` from `vue-sonner`, `<Toaster />` in layout.

## Vite optimizeDeps

If dev warns about a new dependency, add to `optimizeDepsInclude` in `nuxt.config.ts`. Only add when Vite actually complains — don't pre-emptively list everything.

## i18n

Any visible label, placeholder, or aria text → `add-i18n-strings` skill. Never hardcode German or English in the component.

## Public repo

No hardcoded secrets, credentials, or private business labels in components. See [`.cursor/public-repo-standards.md`](../../public-repo-standards.md).
