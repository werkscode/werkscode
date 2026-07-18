import { z } from 'zod'
import { ORIENTATIONS_90 } from '#shared/lib/part-orientations'
import type { PowderCoatingCatalog } from './types'

const dimensionsSchema = z.object({
  x: z.coerce.number().positive('Maß muss größer als 0 sein'),
  y: z.coerce.number().positive('Maß muss größer als 0 sein'),
  z: z.coerce.number().positive('Maß muss größer als 0 sein'),
})

const spacingSchema = z.object({
  x: z.coerce.number().min(0, 'Abstand darf nicht negativ sein'),
  y: z.coerce.number().min(0, 'Abstand darf nicht negativ sein'),
  z: z.coerce.number().min(0, 'Abstand darf nicht negativ sein'),
})

const orientationSchema = z.object({
  alongCartX: z.enum(['x', 'y', 'z']),
  alongCartY: z.enum(['x', 'y', 'z']),
  alongCartZ: z.enum(['x', 'y', 'z']),
}).refine(
  (value) => {
    const axes = [value.alongCartX, value.alongCartY, value.alongCartZ]
    return new Set(axes).size === 3
  },
  { message: 'Ungültige Orientierung' },
)

const validOrientationKeys = new Set(
  ORIENTATIONS_90.map(o => `${o.alongCartX}-${o.alongCartY}-${o.alongCartZ}`),
)

export function createPowderCoatingInputSchema(catalog: PowderCoatingCatalog) {
  const pretreatmentIds = catalog.pretreatments.map(option => option.id)
  const powderTypeIds = catalog.powderTypes.map(option => option.id)

  if (powderTypeIds.length === 0) {
    throw new Error('Catalog must contain powder types')
  }

  return z.object({
    quantity: z.coerce.number().int().min(1, 'Stückzahl muss mindestens 1 sein'),
    surfaceAreaM2: z.coerce.number().positive('Oberfläche muss größer als 0 sein'),
    partDimensionsMm: dimensionsSchema,
    partSpacingMm: spacingSchema,
    hangingMode: z.enum(['stackable', 'side_by_side']),
    orientationMode: z.enum(['auto', 'manual']),
    partOrientation: orientationSchema.optional(),
    cartDimensionsMm: dimensionsSchema,
    pretreatmentId: z.string().refine(
      value => value === '' || pretreatmentIds.includes(value),
      { message: 'Ungültige Vorbehandlung' },
    ),
    powderTypeId: z.enum(powderTypeIds as [string, ...string[]]),
    partialLastCart: z.boolean().optional(),
    threadsPerPart: z.coerce.number().int().min(0).optional().default(0),
  }).superRefine((data, ctx) => {
    if (data.orientationMode === 'manual' && !data.partOrientation) {
      ctx.addIssue({
        code: 'custom',
        message: 'Orientierung erforderlich bei manuellem Modus',
        path: ['partOrientation'],
      })
    }

    if (data.partOrientation) {
      const key = `${data.partOrientation.alongCartX}-${data.partOrientation.alongCartY}-${data.partOrientation.alongCartZ}`
      if (!validOrientationKeys.has(key)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Ungültige 90°-Orientierung',
          path: ['partOrientation'],
        })
      }
    }
  })
}

export type PowderCoatingInputPayload = z.infer<ReturnType<typeof createPowderCoatingInputSchema>>
