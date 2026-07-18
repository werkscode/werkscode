import type { Pool } from 'pg'
import type {
  CalculationListItem,
  CalculationMetadata,
  PowderCoatingCalculationInput,
  PowderCoatingQuoteResult,
  StoredCalculation,
} from '#shared/types/powder-coating-calculation'

interface CalculationRow {
  id: string
  process_type: string
  title: string | null
  artikel_number: string | null
  description: string | null
  image_data: string | null
  created_by: string | null
  customer: string | null
  input_json: PowderCoatingCalculationInput
  result_json: PowderCoatingQuoteResult
  created_at: Date
  updated_at: Date
}

interface CalculationListRow {
  id: string
  process_type: string
  title: string | null
  artikel_number: string | null
  description: string | null
  image_data: string | null
  created_by: string | null
  customer: string | null
  input_json: PowderCoatingCalculationInput
  result_json: PowderCoatingQuoteResult
  created_at: Date
  updated_at: Date
}

function mapMetadata(
  row: Pick<CalculationRow, 'title' | 'artikel_number' | 'description' | 'image_data' | 'created_by' | 'customer'>,
): CalculationMetadata {
  return {
    title: row.title,
    artikelNumber: row.artikel_number,
    description: row.description,
    imageData: row.image_data,
    createdBy: row.created_by,
    customer: row.customer,
  }
}

function mapStoredCalculation(row: CalculationRow): StoredCalculation {
  return {
    id: row.id,
    processType: row.process_type,
    ...mapMetadata(row),
    input: row.input_json,
    result: row.result_json,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  }
}

function mapListItem(row: CalculationListRow): CalculationListItem {
  return {
    id: row.id,
    processType: row.process_type,
    title: row.title,
    artikelNumber: row.artikel_number,
    description: row.description,
    imageData: row.image_data,
    createdBy: row.created_by,
    customer: row.customer,
    quantity: row.input_json.quoteInput.quantity,
    totalEur: row.result_json.total,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  }
}

const listSelectColumns = `
  id,
  process_type,
  title,
  artikel_number,
  description,
  image_data,
  created_by,
  customer,
  input_json,
  result_json,
  created_at,
  updated_at
`

const detailSelectColumns = listSelectColumns

export async function listPowderCoatingCalculations(
  pool: Pool,
  limit = 200,
  offset = 0,
): Promise<CalculationListItem[]> {
  const result = await pool.query<CalculationListRow>(
    `SELECT ${listSelectColumns}
    FROM calculations
    WHERE process_type = 'powder_coating'
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2`,
    [limit, offset],
  )

  return result.rows.map(mapListItem)
}

export async function getPowderCoatingCalculation(
  pool: Pool,
  id: string,
): Promise<StoredCalculation | null> {
  const result = await pool.query<CalculationRow>(
    `SELECT ${detailSelectColumns}
    FROM calculations
    WHERE id = $1 AND process_type = 'powder_coating'`,
    [id],
  )

  if (result.rowCount === 0) {
    return null
  }

  return mapStoredCalculation(result.rows[0]!)
}

export async function createPowderCoatingCalculation(
  pool: Pool,
  data: CalculationMetadata & {
    input: PowderCoatingCalculationInput
    result: PowderCoatingQuoteResult
    catalogSnapshot?: unknown
  },
): Promise<StoredCalculation> {
  const result = await pool.query<CalculationRow>(
    `INSERT INTO calculations (
      process_type,
      title,
      artikel_number,
      description,
      image_data,
      created_by,
      customer,
      input_json,
      result_json,
      catalog_snapshot
    ) VALUES ('powder_coating', $1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING ${detailSelectColumns}`,
    [
      data.title,
      data.artikelNumber,
      data.description,
      data.imageData,
      data.createdBy,
      data.customer,
      JSON.stringify(data.input),
      JSON.stringify(data.result),
      data.catalogSnapshot ? JSON.stringify(data.catalogSnapshot) : null,
    ],
  )

  return mapStoredCalculation(result.rows[0]!)
}

export async function updatePowderCoatingCalculation(
  pool: Pool,
  id: string,
  data: Partial<CalculationMetadata> & {
    input: PowderCoatingCalculationInput
    result: PowderCoatingQuoteResult
    catalogSnapshot?: unknown
  },
): Promise<StoredCalculation | null> {
  const values: unknown[] = [id]
  const setClauses = [
    'input_json = $2',
    'result_json = $3',
    'updated_at = now()',
  ]

  values.push(JSON.stringify(data.input), JSON.stringify(data.result))

  if (data.title !== undefined) {
    setClauses.push(`title = $${values.length + 1}`)
    values.push(data.title)
  }

  if (data.artikelNumber !== undefined) {
    setClauses.push(`artikel_number = $${values.length + 1}`)
    values.push(data.artikelNumber)
  }

  if (data.description !== undefined) {
    setClauses.push(`description = $${values.length + 1}`)
    values.push(data.description)
  }

  if (data.imageData !== undefined) {
    setClauses.push(`image_data = $${values.length + 1}`)
    values.push(data.imageData)
  }

  if (data.createdBy !== undefined) {
    setClauses.push(`created_by = $${values.length + 1}`)
    values.push(data.createdBy)
  }

  if (data.customer !== undefined) {
    setClauses.push(`customer = $${values.length + 1}`)
    values.push(data.customer)
  }

  if (data.catalogSnapshot !== undefined) {
    setClauses.push(`catalog_snapshot = $${values.length + 1}`)
    values.push(JSON.stringify(data.catalogSnapshot))
  }

  const result = await pool.query<CalculationRow>(
    `UPDATE calculations SET ${setClauses.join(', ')}
    WHERE id = $1 AND process_type = 'powder_coating'
    RETURNING ${detailSelectColumns}`,
    values,
  )

  if (result.rowCount === 0) {
    return null
  }

  return mapStoredCalculation(result.rows[0]!)
}

export async function deletePowderCoatingCalculation(
  pool: Pool,
  id: string,
): Promise<boolean> {
  const result = await pool.query(
    `DELETE FROM calculations
    WHERE id = $1 AND process_type = 'powder_coating'`,
    [id],
  )

  return (result.rowCount ?? 0) > 0
}
