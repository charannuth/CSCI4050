import { useState, useEffect } from 'react'
import { getMoviesHome } from '../api'

/**
 * Verifies backend connection and displays movie counts.
 * Remove or replace once the real Home page is implemented.
 */
export default function BackendStatus() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getMoviesHome()
      .then(setData)
      .catch((e) => setError(e.message))
  }, [])

  if (error) {
    return (
      <div className="mb-6 p-4 bg-red-900/30 border border-red-500 rounded-lg text-sm">
        Backend not reachable: {error}. Start the backend with <code className="bg-gray-800 px-1 rounded">cd backend && npm run dev</code>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="mb-6 p-4 bg-cinema-card rounded-lg text-cinema-muted text-sm">
        Connecting to backend…
      </div>
    )
  }

  return (
    <div className="mb-6 p-4 bg-green-900/20 border border-green-600 rounded-lg text-sm">
      Backend connected: {data.currentlyRunning?.length ?? 0} currently running, {data.comingSoon?.length ?? 0} coming soon
    </div>
  )
}
