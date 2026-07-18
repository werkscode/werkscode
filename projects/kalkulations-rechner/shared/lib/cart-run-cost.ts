export interface LastCartLoad {
  partsOnLastCart: number
  isPartial: boolean
  loadFraction: number
}

export interface CartRunCostResult {
  cost: number
  partsOnLastCart: number
  loadFraction: number
  partialLastCartApplied: boolean
}

export function getLastCartLoad(quantity: number, partsPerCart: number): LastCartLoad | null {
  if (!Number.isFinite(quantity) || quantity < 1 || !Number.isFinite(partsPerCart) || partsPerCart <= 0) {
    return null
  }

  const remainder = quantity % partsPerCart
  const partsOnLastCart = remainder === 0 ? partsPerCart : remainder

  return {
    partsOnLastCart,
    isPartial: remainder !== 0,
    loadFraction: partsOnLastCart / partsPerCart,
  }
}

export function calculateCartRunCost(
  cartsNeeded: number,
  partsPerCart: number,
  quantity: number,
  costPerCartRunEur: number,
  partialLastCart: boolean,
): CartRunCostResult {
  const lastCartLoad = getLastCartLoad(quantity, partsPerCart)

  if (!lastCartLoad || cartsNeeded <= 0) {
    return {
      cost: 0,
      partsOnLastCart: 0,
      loadFraction: 0,
      partialLastCartApplied: false,
    }
  }

  if (!partialLastCart || !lastCartLoad.isPartial) {
    return {
      cost: cartsNeeded * costPerCartRunEur,
      partsOnLastCart: lastCartLoad.partsOnLastCart,
      loadFraction: lastCartLoad.loadFraction,
      partialLastCartApplied: false,
    }
  }

  const fullCartRuns = cartsNeeded - 1
  const cost = (fullCartRuns + lastCartLoad.loadFraction) * costPerCartRunEur

  return {
    cost,
    partsOnLastCart: lastCartLoad.partsOnLastCart,
    loadFraction: lastCartLoad.loadFraction,
    partialLastCartApplied: true,
  }
}

export function formatCartRunLineLabel(
  cartsNeeded: number,
  partsPerCart: number,
  partsOnLastCart: number,
  partialLastCartApplied: boolean,
  loadFraction: number,
): string {
  if (!partialLastCartApplied || loadFraction >= 1) {
    return `Wagen-Durchgänge (${cartsNeeded}×)`
  }

  const percent = Math.round(loadFraction * 100)

  if (cartsNeeded === 1) {
    return `Wagen-Durchgänge (1×, ${partsOnLastCart}/${partsPerCart} Teile = ${percent}%)`
  }

  return `Wagen-Durchgänge (${cartsNeeded - 1}× voll + 1× mit ${partsOnLastCart} Teilen = ${percent}%)`
}
