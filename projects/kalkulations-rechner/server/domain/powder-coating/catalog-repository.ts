import type { Pool } from 'pg'
import type { CartPassWorkStepId } from '#shared/lib/cart-pass-work-steps'
import type {
  PowderCoatingCatalog,
  PowderCoatingSetup,
  PowderTypeCatalogEntry,
  PretreatmentCatalogEntry,
} from './types'

function toNumber(value: string | number): number {
  return typeof value === 'number' ? value : Number(value)
}

async function loadCartPassWorkSteps(pool: Pool) {
  const result = await pool.query(`
    SELECT id, label, minutes_per_cart_pass, hourly_rate_eur
    FROM cart_pass_work_steps
    ORDER BY sort_order, id
  `)

  return result.rows.map(row => ({
    id: row.id as CartPassWorkStepId,
    label: row.label as string,
    minutesPerCartPass: toNumber(row.minutes_per_cart_pass),
    hourlyRateEur: toNumber(row.hourly_rate_eur),
  }))
}

export async function loadPowderCoatingCatalog(pool: Pool): Promise<PowderCoatingCatalog> {
  const setup = await loadPowderCoatingSetup(pool)
  return {
    pretreatments: setup.pretreatments,
    powderTypes: setup.powderTypes,
    defaultCartDimensionsMm: setup.defaultCartDimensionsMm,
    cartPassWorkSteps: setup.cartPassWorkSteps,
    globalOverspray: setup.globalOverspray,
    defaultPartSpacingMm: setup.defaultPartSpacingMm,
    minimumChargeEur: setup.minimumChargeEur,
    threadSealingRateEur: setup.threadSealingRateEur,
  }
}

export async function loadPowderCoatingSetup(pool: Pool): Promise<PowderCoatingSetup> {
  const [settingsResult, pretreatmentsResult, powderTypesResult, cartPassWorkSteps] = await Promise.all([
    pool.query(`
      SELECT
        global_overspray,
        default_part_spacing_x_mm,
        default_part_spacing_y_mm,
        default_part_spacing_z_mm,
        minimum_charge_eur,
        thread_sealing_rate_eur,
        cart_dim_x,
        cart_dim_y,
        cart_dim_z
      FROM app_settings
      WHERE id = 1
    `),
    pool.query(`
      SELECT id, label, rate_eur_per_m2
      FROM pretreatments
      ORDER BY sort_order, label
    `),
    pool.query(`
      SELECT id, label, cost_eur_per_kg, coat_thickness_um, density_kg_m3
      FROM powder_types
      ORDER BY sort_order, label
    `),
    loadCartPassWorkSteps(pool),
  ])

  if (settingsResult.rowCount === 0) {
    throw new Error('App settings not initialized')
  }

  const settings = settingsResult.rows[0]

  const pretreatments: PretreatmentCatalogEntry[] = pretreatmentsResult.rows.map(row => ({
    id: row.id,
    label: row.label,
    rateEurPerM2: toNumber(row.rate_eur_per_m2),
  }))

  const powderTypes: PowderTypeCatalogEntry[] = powderTypesResult.rows.map(row => ({
    id: row.id,
    label: row.label,
    costEurPerKg: toNumber(row.cost_eur_per_kg),
    coatThicknessUm: Number(row.coat_thickness_um),
    densityKgM3: Number(row.density_kg_m3),
  }))

  return {
    pretreatments,
    powderTypes,
    defaultCartDimensionsMm: {
      x: Number(settings.cart_dim_x),
      y: Number(settings.cart_dim_y),
      z: Number(settings.cart_dim_z),
    },
    cartPassWorkSteps,
    globalOverspray: toNumber(settings.global_overspray),
    defaultPartSpacingMm: {
      x: Number(settings.default_part_spacing_x_mm),
      y: Number(settings.default_part_spacing_y_mm),
      z: Number(settings.default_part_spacing_z_mm),
    },
    minimumChargeEur: toNumber(settings.minimum_charge_eur),
    threadSealingRateEur: toNumber(settings.thread_sealing_rate_eur ?? 0),
  }
}

export async function savePowderCoatingSetup(
  pool: Pool,
  setup: PowderCoatingSetup,
): Promise<PowderCoatingSetup> {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    await client.query(
      `UPDATE app_settings SET
        global_overspray = $1,
        default_part_spacing_x_mm = $2,
        default_part_spacing_y_mm = $3,
        default_part_spacing_z_mm = $4,
        minimum_charge_eur = $5,
        thread_sealing_rate_eur = $6,
        cart_dim_x = $7,
        cart_dim_y = $8,
        cart_dim_z = $9
      WHERE id = 1`,
      [
        setup.globalOverspray,
        setup.defaultPartSpacingMm.x,
        setup.defaultPartSpacingMm.y,
        setup.defaultPartSpacingMm.z,
        setup.minimumChargeEur,
        setup.threadSealingRateEur,
        setup.defaultCartDimensionsMm.x,
        setup.defaultCartDimensionsMm.y,
        setup.defaultCartDimensionsMm.z,
      ],
    )

    for (const [index, step] of setup.cartPassWorkSteps.entries()) {
      await client.query(
        `INSERT INTO cart_pass_work_steps (
          id, label, minutes_per_cart_pass, hourly_rate_eur, sort_order
        ) VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE SET
          label = EXCLUDED.label,
          minutes_per_cart_pass = EXCLUDED.minutes_per_cart_pass,
          hourly_rate_eur = EXCLUDED.hourly_rate_eur,
          sort_order = EXCLUDED.sort_order`,
        [step.id, step.label, step.minutesPerCartPass, step.hourlyRateEur, index],
      )
    }

    const pretreatmentIds = setup.pretreatments.map(pretreatment => pretreatment.id)
    const powderTypeIds = setup.powderTypes.map(powderType => powderType.id)

    for (const [index, pretreatment] of setup.pretreatments.entries()) {
      await client.query(
        `INSERT INTO pretreatments (id, label, rate_eur_per_m2, sort_order)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE SET
           label = EXCLUDED.label,
           rate_eur_per_m2 = EXCLUDED.rate_eur_per_m2,
           sort_order = EXCLUDED.sort_order`,
        [pretreatment.id, pretreatment.label, pretreatment.rateEurPerM2, index],
      )
    }

    await client.query(
      `DELETE FROM pretreatments WHERE NOT (id = ANY($1::text[]))`,
      [pretreatmentIds],
    )

    for (const [index, powderType] of setup.powderTypes.entries()) {
      await client.query(
        `INSERT INTO powder_types (
          id, label, cost_eur_per_kg, coat_thickness_um, density_kg_m3, sort_order
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          label = EXCLUDED.label,
          cost_eur_per_kg = EXCLUDED.cost_eur_per_kg,
          coat_thickness_um = EXCLUDED.coat_thickness_um,
          density_kg_m3 = EXCLUDED.density_kg_m3,
          sort_order = EXCLUDED.sort_order`,
        [
          powderType.id,
          powderType.label,
          powderType.costEurPerKg,
          powderType.coatThicknessUm,
          powderType.densityKgM3,
          index,
        ],
      )
    }

    await client.query(
      `DELETE FROM powder_types WHERE NOT (id = ANY($1::text[]))`,
      [powderTypeIds],
    )

    await client.query('COMMIT')
    return loadPowderCoatingSetup(pool)
  }
  catch (error) {
    await client.query('ROLLBACK')
    throw error
  }
  finally {
    client.release()
  }
}
