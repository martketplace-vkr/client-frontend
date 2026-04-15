import { getProductPrice, toText } from '../helpers'

export function normalizeQuantity(value) {
  const parsed = Number.parseInt(toText(value), 10)
  if (!Number.isInteger(parsed) || parsed < 0) {
    return 0
  }

  return parsed
}

export function parsePriceValue(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
  }

  const normalized = toText(value).replace(/\s+/g, '').replace(',', '.')
  const match = normalized.match(/-?\d+(?:\.\d+)?/)

  if (!match) {
    return 0
  }

  const parsed = Number.parseFloat(match[0])
  return Number.isFinite(parsed) ? parsed : 0
}

export function getCartCount(items) {
  return items.reduce((sum, item) => sum + normalizeQuantity(item.quantity), 0)
}

export function getCartTotal(items) {
  return items.reduce(
    (sum, item) => sum + parsePriceValue(getProductPrice(item.snapshot || item)) * normalizeQuantity(item.quantity),
    0,
  )
}

export function buildCartLines(items) {
  return items.map((item) => ({
    ...item,
    quantity: normalizeQuantity(item.quantity),
    lineTotal: parsePriceValue(getProductPrice(item.snapshot || item)) * normalizeQuantity(item.quantity),
  }))
}
