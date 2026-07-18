import type { PowderCoatingCalculationInput, PowderCoatingQuoteResult } from '#shared/types/powder-coating-calculation'
import { calculatePowderCoatingQuote } from './calculate'
import type { PowderCoatingCatalog } from './types'

export function buildQuoteFromCalculationInput(
  input: PowderCoatingCalculationInput,
  catalog: PowderCoatingCatalog,
): PowderCoatingQuoteResult {
  return calculatePowderCoatingQuote(input.quoteInput, catalog)
}
