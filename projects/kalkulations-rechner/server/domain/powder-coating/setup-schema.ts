import { CART_PASS_WORK_STEP_IDS } from '#shared/lib/cart-pass-work-steps'
import { z } from 'zod'

const dimensionsSchema = z.object({
  x: z.coerce.number().int().positive(),
  y: z.coerce.number().int().positive(),
  z: z.coerce.number().int().positive(),
})

const spacingSchema = z.object({
  x: z.coerce.number().int().nonnegative(),
  y: z.coerce.number().int().nonnegative(),
  z: z.coerce.number().int().nonnegative(),
})

const pretreatmentSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  rateEurPerM2: z.coerce.number().nonnegative(),
})

const powderTypeSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  costEurPerKg: z.coerce.number().positive(),
  coatThicknessUm: z.coerce.number().int().positive(),
  densityKgM3: z.coerce.number().int().positive(),
})

const cartPassWorkStepSchema = z.object({
  id: z.enum(CART_PASS_WORK_STEP_IDS),
  label: z.string().min(1),
  minutesPerCartPass: z.coerce.number().positive(),
  hourlyRateEur: z.coerce.number().nonnegative(),
})

export const powderCoatingSetupSchema = z.object({
  pretreatments: z.array(pretreatmentSchema).min(1),
  powderTypes: z.array(powderTypeSchema).min(1),
  defaultCartDimensionsMm: dimensionsSchema,
  cartPassWorkSteps: z
    .array(cartPassWorkStepSchema)
    .length(CART_PASS_WORK_STEP_IDS.length)
    .refine(
      steps => CART_PASS_WORK_STEP_IDS.every(id => steps.some(step => step.id === id)),
      { message: 'All cart pass work steps must be present' },
    ),
  globalOverspray: z.coerce.number().gt(0),
  defaultPartSpacingMm: spacingSchema,
  minimumChargeEur: z.coerce.number().nonnegative(),
  threadSealingRateEur: z.coerce.number().nonnegative(),
})

export type PowderCoatingSetupPayload = z.infer<typeof powderCoatingSetupSchema>
