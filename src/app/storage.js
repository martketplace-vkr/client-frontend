export const CART_KEY = 'marketplace.store.cart'
export const FAVORITES_KEY = 'marketplace.store.favorites'
export const RECENT_KEY = 'marketplace.store.recent'

export function readStoredCollection(key) {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function writeStoredCollection(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value))
}
