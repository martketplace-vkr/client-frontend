import { getProductAcceptsCrypto, getProductEffectiveUSDTPrice, getProductPrice, toText } from '../helpers'

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

export function buildCartLines(items, preferredCurrency = 'rub') {
  return items.map((item) => {
    const product = item.snapshot || item
    const quantity = normalizeQuantity(item.quantity)
    const useUSDT = preferredCurrency === 'usdt' && getProductAcceptsCrypto(product) && getProductEffectiveUSDTPrice(product)
    const lineCurrency = useUSDT ? 'usdt' : 'rub'
    const price = useUSDT ? getProductEffectiveUSDTPrice(product) : getProductPrice(product)

    return {
      ...item,
      quantity,
      lineCurrency,
      unitPrice: parsePriceValue(price),
      lineTotal: parsePriceValue(price) * quantity,
    }
  })
}

export function getCheckoutTotals(items, preferredCurrency = 'rub') {
  return items.reduce(
    (totals, item) => {
      const product = item.snapshot || item
      const quantity = normalizeQuantity(item.quantity)
      const useUSDT = preferredCurrency === 'usdt' && getProductAcceptsCrypto(product) && getProductEffectiveUSDTPrice(product)
      const currency = useUSDT ? 'usdt' : 'rub'
      const value = useUSDT ? getProductEffectiveUSDTPrice(product) : getProductPrice(product)
      totals[currency] += parsePriceValue(value) * quantity
      return totals
    },
    { rub: 0, usdt: 0 },
  )
}
