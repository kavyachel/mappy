export const API_BASE = 'http://localhost:5001/api'

const API_KEY = import.meta.env.VITE_API_KEY

export const headers = {
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY
}

export const apiError = async (response, fallback) => {
  try {
    const body = await response.json()
    throw new Error(body.error || fallback)
  } catch (e) {
    if (e.message !== fallback) throw e
    throw new Error(fallback)
  }
}
