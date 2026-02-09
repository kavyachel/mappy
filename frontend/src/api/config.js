export const API_BASE = 'http://localhost:5001/api'

const API_KEY = import.meta.env.VITE_API_KEY

export const headers = {
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY
}
