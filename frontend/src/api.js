/**
 * API client for CES backend.
 * In dev, Vite proxies /api to http://localhost:3002.
 * In prod, set VITE_API_BASE to your backend URL (e.g. https://api.example.com).
 */
const BASE = import.meta.env.VITE_API_BASE ?? ''

const FETCH_TIMEOUT = 10000

async function request(path, options = {}) {
  const url = `${BASE}${path}`
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT)
  const res = await fetch(url, {
    signal: controller.signal,
    headers: { 'Content-Type': 'application/json', ...options.headers },
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
  return res.json()
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
