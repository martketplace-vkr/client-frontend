export const emptyProfile = {
  email: '',
  firstName: '',
  lastName: '',
  avatarUrl: '',
}

export const emptyAddressForm = {
  country: '',
  city: '',
  street: '',
  postalCode: '',
}

export const emptyProductForm = {
  productId: '',
  categoryId: '',
  name: '',
  description: '',
  price: '',
  stockCount: '',
  attributesText: '',
  imagesText: '',
}

const rubFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
})

export function flattenCategories(categories, depth = 0) {
  return (categories || []).flatMap((category) => {
    const option = {
      value: toText(category?.id ?? category?.categoryId),
      label: `${'  '.repeat(depth)}${toText(category?.name)}`,
    }

    return [option, ...flattenCategories(category?.children, depth + 1)]
  })
}

export function normalizeProfile(profile) {
  return {
    email: toText(profile?.email),
    firstName: toText(profile?.firstName ?? profile?.first_name),
    lastName: toText(profile?.lastName ?? profile?.last_name),
    avatarUrl: toText(profile?.avatarUrl ?? profile?.avatar_url),
  }
}

export function normalizeAddress(address) {
  if (!address) {
    return null
  }

  return {
    id: toText(address?.id),
    country: toText(address?.country),
    city: toText(address?.city),
    street: toText(address?.street),
    postalCode: toText(address?.postalCode ?? address?.postal_code),
  }
}

export function getAddressParts(address) {
  const normalized = normalizeAddress(address)
  if (!normalized) {
    return []
  }

  return [normalized.country, normalized.city, normalized.street, normalized.postalCode].filter(Boolean)
}

export function buildProductPayload(form) {
  return {
    category_id: parsePositiveInteger(form.categoryId, 'Category ID'),
    name: toText(form.name).trim(),
    description: toText(form.description).trim(),
    price: toText(form.price).trim(),
    stock_count: parseNonNegativeInteger(form.stockCount, 'Stock count'),
    attributes: parseAttributeLines(form.attributesText),
    images: parseImageLines(form.imagesText),
  }
}

export function populateProductForm(product) {
  return {
    productId: getProductId(product),
    categoryId: getCategoryId(product),
    name: getProductName(product),
    description: getProductDescription(product),
    price: getProductPrice(product),
    stockCount: getStockCount(product),
    attributesText: getProductAttributes(product)
      .map((attribute) => `${toText(attribute.name)}: ${toText(attribute.value)}`)
      .join('\n'),
    imagesText: getProductImages(product)
      .map((image) => `${image?.isMain || image?.is_main ? '*' : ''}${toText(image?.url)}`)
      .join('\n'),
  }
}

export function resolveProductImage(product) {
  const images = getProductImages(product)
  const preferred = images.find((image) => image?.isMain || image?.is_main) || images[0]
  return toText(preferred?.url)
}

export function serializeProduct(product) {
  if (!product) {
    return null
  }

  return {
    id: getProductId(product),
    categoryId: getCategoryId(product),
    name: getProductName(product),
    description: getProductDescription(product),
    price: getProductPrice(product),
    stockCount: getStockCount(product),
    vendorId: getVendorId(product),
    attributes: getProductAttributes(product),
    images: getProductImages(product),
  }
}

export function getProductId(product) {
  return toText(product?.id ?? product?.productId)
}

export function getCategoryId(product) {
  return toText(product?.categoryId ?? product?.category_id)
}

export function getProductName(product) {
  return toText(product?.name)
}

export function getProductDescription(product) {
  return toText(product?.description)
}

export function getProductPrice(product) {
  return toText(product?.price)
}

export function getStockCount(product) {
  return toText(product?.stockCount ?? product?.stock_count)
}

export function getVendorId(product) {
  return toText(product?.vendorId ?? product?.vendor_id)
}

export function getProductAttributes(product) {
  return Array.isArray(product?.attributes) ? product.attributes : []
}

export function getProductImages(product) {
  return Array.isArray(product?.images) ? product.images : []
}

export function formatPrice(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return rubFormatter.format(value)
  }

  const normalized = toText(value).trim()
  if (!normalized) {
    return 'Цена не указана'
  }

  const parsed = parsePriceNumber(normalized)
  if (parsed !== null) {
    return rubFormatter.format(parsed)
  }

  return normalized
}

export function formatMoney(money, fallback = '0') {
  const amount = toText(money?.amount ?? money).trim()
  if (!amount) {
    return fallback
  }

  const currencyCode = toText(money?.currencyCode ?? money?.currency_code).trim()
  const suffix = currencyCode === '2001' ? 'USDT' : currencyCode

  return [amount, suffix].filter(Boolean).join(' ')
}

export function formatDateTime(value) {
  const raw = toText(value?.seconds ? Number(value.seconds) * 1000 : value).trim()
  if (!raw) {
    return '—'
  }

  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) {
    return raw
  }

  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function compactStatus(value) {
  return toText(value).replace(/^[A-Z_]+_STATUS_/, '').replace(/_/g, ' ').toLowerCase() || 'unknown'
}

export function copyText(value) {
  const text = toText(value)
  if (!text) {
    return Promise.resolve(false)
  }

  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).then(() => true)
  }

  return Promise.resolve(false)
}

export function productMatchesQuery(product, query) {
  const normalized = toText(query).trim().toLowerCase()
  if (!normalized) {
    return true
  }

  return [getProductName(product), getProductDescription(product), getProductPrice(product), getCategoryId(product)]
    .map((value) => value.toLowerCase())
    .some((value) => value.includes(normalized))
}

export function shortText(value, max = 140) {
  const normalized = toText(value).trim()
  if (normalized.length <= max) {
    return normalized
  }

  return `${normalized.slice(0, Math.max(0, max - 1)).trimEnd()}...`
}

export function toText(value) {
  if (typeof value === 'string') {
    return value
  }

  if (value === null || value === undefined) {
    return ''
  }

  return String(value)
}

function parsePositiveInteger(raw, label) {
  const value = Number.parseInt(toText(raw), 10)
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${label} must be a positive integer.`)
  }

  return value
}

function parseNonNegativeInteger(raw, label) {
  const value = Number.parseInt(toText(raw), 10)
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative integer.`)
  }

  return value
}

function parseAttributeLines(raw) {
  return toText(raw)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separatorIndex = line.search(/[:=]/)
      if (separatorIndex <= 0) {
        throw new Error(`Invalid attribute line: "${line}". Use "name: value".`)
      }

      return {
        name: line.slice(0, separatorIndex).trim(),
        value: line.slice(separatorIndex + 1).trim(),
      }
    })
}

function parseImageLines(raw) {
  const lines = toText(raw)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const parsed = lines.map((line, index) => {
    const isMain = line.startsWith('*')
    const url = isMain ? line.slice(1).trim() : line

    if (!url) {
      throw new Error(`Invalid image line at position ${index + 1}.`)
    }

    return { url, is_main: isMain }
  })

  if (parsed.length > 0 && !parsed.some((image) => image.is_main)) {
    parsed[0].is_main = true
  }

  return parsed
}

function parsePriceNumber(value) {
  const match = value.replace(/\s+/g, '').replace(',', '.').match(/-?\d+(?:\.\d+)?/)
  if (!match) {
    return null
  }

  const parsed = Number.parseFloat(match[0])
  return Number.isFinite(parsed) ? parsed : null
}
