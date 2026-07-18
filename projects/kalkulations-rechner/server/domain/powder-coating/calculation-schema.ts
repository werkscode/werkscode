import { z } from 'zod'
import { ORIENTATIONS_90 } from '#shared/lib/part-orientations'
import { sheetMaterials } from '#shared/lib/sheet-metal-surface'
import type { PowderCoatingCatalog } from './types'

const dimensionsSchema = z.object({
  x: z.coerce.number().positive(),
  y: z.coerce.number().positive(),
  z: z.coerce.number().positive(),
})

const spacingSchema = z.object({
  x: z.coerce.number().min(0),
  y: z.coerce.number().min(0),
  z: z.coerce.number().min(0),
})

const orientationSchema = z.object({
  alongCartX: z.enum(['x', 'y', 'z']),
  alongCartY: z.enum(['x', 'y', 'z']),
  alongCartZ: z.enum(['x', 'y', 'z']),
})

const validOrientationKeys = new Set(
  ORIENTATIONS_90.map(o => `${o.alongCartX}-${o.alongCartY}-${o.alongCartZ}`),
)

const sheetMaterialIds = Object.keys(sheetMaterials) as [string, ...string[]]

export function createPowderCoatingCalculationInputSchema(catalog: PowderCoatingCatalog) {
  const pretreatmentIds = catalog.pretreatments.map(option => option.id)
  const powderTypeIds = catalog.powderTypes.map(option => option.id)

  if (powderTypeIds.length === 0) {
    throw new Error('Catalog must contain powder types')
  }

  const quoteInputSchema = z.object({
    quantity: z.coerce.number().int().min(1),
    surfaceAreaM2: z.coerce.number().positive(),
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

  return z.object({
    surfaceInputMode: z.enum(['sheet-metal', 'step']).optional().default('sheet-metal'),
    materialId: z.enum(sheetMaterialIds),
    thicknessMm: z.coerce.number().positive(),
    weightKg: z.coerce.number().positive(),
    includeEdges: z.boolean(),
    stepFileName: z.string().trim().max(255).optional(),
    stepModelId: z.string().uuid().optional(),
    stepTotalSurfaceAreaM2: z.coerce.number().positive().optional(),
    quoteInput: quoteInputSchema,
  }).superRefine((data, ctx) => {
    if (data.surfaceInputMode === 'step' && !data.stepFileName) {
      ctx.addIssue({
        code: 'custom',
        message: 'STEP-Dateiname erforderlich im STEP-Modus',
        path: ['stepFileName'],
      })
    }
  })
}

const MAX_IMAGE_BYTES = 2 * 1024 * 1024

const imageDataSchema = z.string().nullable().optional().superRefine((value, ctx) => {
  if (!value) {
    return
  }

  if (!value.startsWith('data:image/')) {
    ctx.addIssue({
      code: 'custom',
      message: 'Ungültiges Bildformat',
    })
    return
  }

  const base64 = value.split(',')[1]
  if (!base64) {
    ctx.addIssue({
      code: 'custom',
      message: 'Ungültiges Bildformat',
    })
    return
  }

  const sizeBytes = Math.ceil((base64.length * 3) / 4)
  if (sizeBytes > MAX_IMAGE_BYTES) {
    ctx.addIssue({
      code: 'custom',
      message: 'Bild zu groß (max. 2 MB)',
    })
  }
})

function optionalTrimmedText(maxLength: number) {
  return z.union([
    z.string().trim().max(maxLength),
    z.null(),
  ]).optional().transform(value => value || null)
}

export function createSaveCalculationSchema(catalog: PowderCoatingCatalog) {
  return z.object({
    title: optionalTrimmedText(200),
    artikelNumber: optionalTrimmedText(100),
    description: optionalTrimmedText(2000),
    imageData: imageDataSchema,
    createdBy: optionalTrimmedText(100),
    customer: optionalTrimmedText(200),
    input: createPowderCoatingCalculationInputSchema(catalog),
  })
}
