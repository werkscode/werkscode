import type { Pool } from 'pg'
import {
  DEFAULT_CART_PASS_WORK_STEPS,
  DEFAULT_PART_SPACING_MM,
  GLOBAL_OVERSPRAY,
  MINIMUM_CHARGE_EUR,
  THREAD_SEALING_RATE_EUR,
  powderTypeOptions,
  pretreatmentOptions,
  pretreatmentRatesEurPerM2,
} from '../domain/powder-coating/defaults'

export async function seedIfEmpty(pool: Pool): Promise<void> {
  const settings = await pool.query('SELECT id FROM app_settings WHERE id = 1')
  if (settings.rowCount === 0) {
    await pool.query(
      `INSERT INTO app_settings (
        id, global_overspray,
        default_part_spacing_x_mm, default_part_spacing_y_mm, default_part_spacing_z_mm,
        minimum_charge_eur, thread_sealing_rate_eur,
        cart_dim_x, cart_dim_y, cart_dim_z
      ) VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        GLOBAL_OVERSPRAY,
        DEFAULT_PART_SPACING_MM.x,
        DEFAULT_PART_SPACING_MM.y,
        DEFAULT_PART_SPACING_MM.z,
        MINIMUM_CHARGE_EUR,
        THREAD_SEALING_RATE_EUR,
        2000,
        1500,
        1800,
      ],
    )
  }

  const workStepCount = await pool.query('SELECT COUNT(*)::int AS count FROM cart_pass_work_steps')
  if (workStepCount.rows[0].count === 0) {
    for (const [index, step] of DEFAULT_CART_PASS_WORK_STEPS.entries()) {
      await pool.query(
        `INSERT INTO cart_pass_work_steps (
          id, label, minutes_per_cart_pass, hourly_rate_eur, sort_order
        ) VALUES ($1, $2, $3, $4, $5)`,
        [step.id, step.label, step.minutesPerCartPass, step.hourlyRateEur, index],
      )
    }
  }

  const pretreatmentCount = await pool.query('SELECT COUNT(*)::int AS count FROM pretreatments')
  if (pretreatmentCount.rows[0].count === 0) {
    for (const [index, option] of pretreatmentOptions.entries()) {
      await pool.query(
        `INSERT INTO pretreatments (id, label, rate_eur_per_m2, sort_order)
         VALUES ($1, $2, $3, $4)`,
        [option.id, option.label, pretreatmentRatesEurPerM2[option.id] ?? 5, index],
      )
    }
  }

  const powderCount = await pool.query('SELECT COUNT(*)::int AS count FROM powder_types')
  if (powderCount.rows[0].count === 0) {
    for (const [index, option] of powderTypeOptions.entries()) {
      await pool.query(
        `INSERT INTO powder_types (
          id, label, cost_eur_per_kg, coat_thickness_um, density_kg_m3, sort_order
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          option.id,
          option.label,
          option.costEurPerKg,
          option.coatThicknessUm,
          option.densityKgM3,
          index,
        ],
      )
    }
  }
}
