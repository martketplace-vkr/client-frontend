const ACCESS_TOKEN_KEY = 'marketplace.gateway.access_token'

export class ApiError extends Error {
  constructor(message, status = 0, payload = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

export function getStoredAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY) || ''
}

export function setStoredAccessToken(token) {
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token)
    return
  }

  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

export function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL || ''
}

export async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const headers = {}

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method,
    credentials: 'include',
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const contentType = response.headers.get('content-type') || ''
  let payload = null

  if (contentType.includes('application/json')) {
    payload = await response.json()
  } else {
    const text = await response.text()
    payload = text ? { message: text } : null
  }

  if (!response.ok) {
    throw new ApiError(
      payload?.message || payload?.error || `HTTP ${response.status}`,
      response.status,
      payload,
    )
  }

  return payload || {}
}
