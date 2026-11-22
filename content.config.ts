import { defineCollection, defineContentConfig } from '@nuxt/content'
import { z } from 'zod'

export default defineContentConfig({
  collections: {
    pages: defineCollection({
      type: 'page',
      source: [
        { include: 'pages/**/*.md' },
        { include: 'de/pages/**/*.md' },
      ],
      schema: z.object({
        description: z.string().optional(),
        draft: z.boolean().optional(),
      }),
    }),
    blog: defineCollection({
      type: 'page',
      source: [
        { include: 'blog/**/*.md' },
        { include: 'de/blog/**/*.md' },
      ],
      schema: z.object({
        date: z.string(),
        description: z.string().optional(),
        tags: z.array(z.string()).optional(),
        draft: z.boolean().optional(),
      }),
      indexes: [
        { columns: ['date'] },
      ],
    }),
  },
})
