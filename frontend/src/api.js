/**
 * API client for CES backend.
 * In dev, Vite proxies /api to http://localhost:3002.
 * In prod, set VITE_API_BASE to your backend URL (e.g. https://api.example.com).
 */
const BASE = import.meta.env.VITE_API_BASE ?? ''
const TOKEN_KEY = 'ces_auth_token'

const FETCH_TIMEOUT = 10000

let authToken = localStorage.getItem(TOKEN_KEY) ?? ''

export function setAuthToken(token) {
  authToken = token || ''
  if (authToken) {
    localStorage.setItem(TOKEN_KEY, authToken)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export function getAuthToken() {
  return authToken
}

async function request(path, options = {}) {
  const url = `${BASE}${path}`
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT)

  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`
  }

  const res = await fetch(url, {
    signal: controller.signal,
    headers,
    ...options,
  })
  clearTimeout(timeoutId)
  if (!res.ok) {
    const err = new Error(`API error ${res.status}`)
    err.status = res.status
    try {
      err.body = await res.json()
    } catch {
      err.body = await res.text()
    }
    throw err
  }
  if (res.status === 204) {
    return null
  }
  const text = await res.text()
  if (!text) {
    return null
  }
  return JSON.parse(text)
}

/** GET /api/health */
export function getHealth() {
  return request('/api/health')
}

/** GET /api/movies/home – { currentlyRunning, comingSoon } */
export function getMoviesHome() {
  return request('/api/movies/home')
}

/** GET /api/movies – optional q, genre, status, date */
export function getMovies(params = {}) {
  const search = new URLSearchParams(params).toString()
  return request(`/api/movies${search ? `?${search}` : ''}`)
}

/** GET /api/movies/:id */
export function getMovie(id) {
  return request(`/api/movies/${id}`)
}

/** GET /api/movies/meta – { genres, showDates } */
export function getMoviesMeta() {
  return request('/api/movies/meta')
}

export function register(payload) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function verifyEmail(token) {
  return request('/api/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
  })
}

export function login(payload) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function forgotPassword(email) {
  return request('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export function resetPassword(token, newPassword) {
  return request('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  })
}

export function changePassword(currentPassword, newPassword) {
  return request('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  })
}

export function logout() {
  return request('/api/auth/logout', {
    method: 'POST',
  })
}

export function getMe() {
  return request('/api/users/me')
}

export function updateProfile(payload) {
  return request('/api/users/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function addPaymentCard(payload) {
  return request('/api/users/me/payment-cards', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function removePaymentCard(cardId) {
  return request(`/api/users/me/payment-cards/${cardId}`, {
    method: 'DELETE',
  })
}

export function getFavorites() {
  return request('/api/users/me/favorites')
}

export function addFavorite(movieId) {
  return request('/api/users/me/favorites', {
    method: 'POST',
    body: JSON.stringify({ movieId }),
  })
}

export function removeFavorite(movieId) {
  return request(`/api/users/me/favorites/${movieId}`, {
    method: 'DELETE',
  })
}
