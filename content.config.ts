import { defineCollection, defineContentConfig } from '@nuxt/content'
import { z } from 'zod'

const aiAssist = z.array(
  z.enum(['drafting', 'editing', 'translation', 'code', 'research', 'images']),
).optional()

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
        ai_assist: aiAssist,
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
        description: z.string().optional(),
        cover: z.string().optional(),
        tech: z.array(z.string()).optional(),
        featured: z.boolean().optional(),
        link: z.string().url().optional(),
        draft: z.boolean().optional(),
        ai_assist: aiAssist,
      }),
      indexes: [
        { columns: ['date'] },
      ],
    }),
  },
})
