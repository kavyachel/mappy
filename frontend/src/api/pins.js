import { fetchLocation } from "./mapbox"

const API_BASE = 'http://localhost:5001/api'
const API_KEY = import.meta.env.VITE_API_KEY

const headers = {
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY
}

// Fetch pins within viewport bounds, optionally filtered by tag
export const fetchPins = async (bounds, tag = null) => {
  const bbox = [
    bounds.south,
    bounds.west,
    bounds.north,
    bounds.east
  ]

  const params = new URLSearchParams({ viewport: bbox.join(',') })
  if (tag) {
    params.append('tag', tag)
  }

  const response = await fetch(`${API_BASE}/pins?${params}`, { headers })

  if (!response.ok) {
    throw new Error('Failed to fetch pins')
  }

  return response.json()
}

// Create a new pin
export const addPin = async (pin) => {
  const location = await fetchLocation(pin.lng, pin.lat)
  const response = await fetch(`${API_BASE}/pins`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: pin.title,
      description: pin.description,
      location,
      tags: pin.tags || [],
      lat: pin.lat,
      lng: pin.lng
    })
  })

  if (!response.ok) {
    throw new Error('Failed to create pin')
  }

  return response.json()
}
