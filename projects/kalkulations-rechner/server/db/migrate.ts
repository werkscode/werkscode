import type { Pool } from 'pg'

export async function migrate(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      global_overspray NUMERIC NOT NULL,
      default_part_spacing_x_mm INTEGER NOT NULL,
      default_part_spacing_y_mm INTEGER NOT NULL,
      default_part_spacing_z_mm INTEGER NOT NULL,
      minimum_charge_eur NUMERIC NOT NULL,
      cart_dim_x INTEGER NOT NULL,
      cart_dim_y INTEGER NOT NULL,
      cart_dim_z INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pretreatments (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      rate_eur_per_m2 NUMERIC NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS powder_types (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      cost_eur_per_kg NUMERIC NOT NULL,
      coat_thickness_um INTEGER NOT NULL,
      density_kg_m3 INTEGER NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS calculations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      process_type TEXT NOT NULL DEFAULT 'powder_coating',
      title TEXT,
      input_json JSONB NOT NULL,
      result_json JSONB NOT NULL,
      catalog_snapshot JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS calculations_process_type_created_at_idx
      ON calculations (process_type, created_at DESC);

    CREATE TABLE IF NOT EXISTS cart_pass_work_steps (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      minutes_per_cart_pass NUMERIC NOT NULL,
      hourly_rate_eur NUMERIC NOT NULL,
      sort_order INTEGER NOT NULL
    );
  `)

  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'calculations'
          AND column_name = 'artikel_number'
      ) THEN
        ALTER TABLE calculations ADD COLUMN artikel_number TEXT;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'calculations'
          AND column_name = 'description'
      ) THEN
        ALTER TABLE calculations ADD COLUMN description TEXT;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'calculations'
          AND column_name = 'image_data'
      ) THEN
        ALTER TABLE calculations ADD COLUMN image_data TEXT;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'calculations'
          AND column_name = 'created_by'
      ) THEN
        ALTER TABLE calculations ADD COLUMN created_by TEXT;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'calculations'
          AND column_name = 'customer'
      ) THEN
        ALTER TABLE calculations ADD COLUMN customer TEXT;
      END IF;
    END $$;
  `)

  await pool.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'app_settings'
          AND column_name = 'global_transfer_efficiency'
      ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'app_settings'
          AND column_name = 'global_overspray'
      ) THEN
        UPDATE app_settings
        SET global_transfer_efficiency = 1.0 / global_transfer_efficiency
        WHERE global_transfer_efficiency > 0
          AND global_transfer_efficiency <= 1;

        ALTER TABLE app_settings
        RENAME COLUMN global_transfer_efficiency TO global_overspray;
      END IF;
    END $$;
  `)

  await pool.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'app_settings'
          AND column_name = 'default_part_spacing_mm'
      ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'app_settings'
          AND column_name = 'default_part_spacing_x_mm'
      ) THEN
        ALTER TABLE app_settings
          ADD COLUMN default_part_spacing_x_mm INTEGER,
          ADD COLUMN default_part_spacing_y_mm INTEGER,
          ADD COLUMN default_part_spacing_z_mm INTEGER;

        UPDATE app_settings
        SET
          default_part_spacing_x_mm = default_part_spacing_mm,
          default_part_spacing_y_mm = default_part_spacing_mm,
          default_part_spacing_z_mm = default_part_spacing_mm;

        ALTER TABLE app_settings
          ALTER COLUMN default_part_spacing_x_mm SET NOT NULL,
          ALTER COLUMN default_part_spacing_y_mm SET NOT NULL,
          ALTER COLUMN default_part_spacing_z_mm SET NOT NULL;

        ALTER TABLE app_settings
          DROP COLUMN default_part_spacing_mm;
      END IF;

      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'app_settings'
          AND column_name = 'cost_per_cart_run_eur'
      ) THEN
        ALTER TABLE app_settings DROP COLUMN cost_per_cart_run_eur;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'app_settings'
          AND column_name = 'thread_sealing_rate_eur'
      ) THEN
        ALTER TABLE app_settings
          ADD COLUMN thread_sealing_rate_eur NUMERIC NOT NULL DEFAULT 0;
      END IF;
    END $$;
  `)
}
