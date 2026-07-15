---
name: add-api-route
description: Creates Nitro API routes with Zod validation and optional Drizzle persistence following WERKSCODE patterns. Use when the user asks to add an API endpoint or new server route.
disable-model-invocation: true
---

# Add API Route

## Checklist

```
- [ ] Create server/api/<name>.<method>.ts
- [ ] Define Zod schema for request body
- [ ] Validate with safeParse → 400 on failure
- [ ] Use useDb() if persisting to PostgreSQL
- [ ] Update schema + migration if DB changes needed
- [ ] Wire frontend with $fetch + toast
```

## Route template

```ts
import { z } from 'zod'
import { useDb } from '../utils/db'

const bodySchema = z.object({
  field: z.string().min(1).max(255),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid request',
      data: z.flattenError(parsed.error),
    })
  }

  // const db = useDb() — if needed

  return { success: true }
})
```

Reference implementation: `server/api/contact.post.ts`

## Database changes

1. Add table/columns in `server/db/schema.ts`
2. `pnpm db:generate` → `pnpm db:migrate`
3. Docker: `make dev-migrate`

## Frontend call

```ts
import { toast } from 'vue-sonner'

try {
  await $fetch('/api/endpoint', { method: 'POST', body: form })
  toast.success(t('contact.success'))
} catch {
  toast.error(t('contact.error'))
}
```

User-facing messages → `add-i18n-strings` skill.

## Existing routes

- `GET /api/health`
- `POST /api/contact` → `contact_messages` table (+ optional Resend notify)
- `GET /api/admin/contact-messages` → list (Bearer `NUXT_CONTACT_ADMIN_TOKEN`)
- `PATCH /api/admin/contact-messages/:id` → mark read

## Public repo

No real credentials in code — use env vars only. No private ERP or manufacturing app references in comments. See [`.cursor/public-repo-standards.md`](../../public-repo-standards.md).
