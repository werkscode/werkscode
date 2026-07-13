import { defineCollection, defineContentConfig } from '@nuxt/content'
import { z } from 'zod'

export default defineContentConfig({
  collections: {
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
    portfolio: defineCollection({
      type: 'page',
      source: [
        { include: 'portfolio/**/*.md' },
        { include: 'de/portfolio/**/*.md' },
      ],
      schema: z.object({
        date: z.string(),
        tech: z.array(z.string()).optional(),
        featured: z.boolean().optional(),
        link: z.string().url().optional(),
      }),
      indexes: [
        { columns: ['date'] },
      ],
    }),
  },
})
