import { API_BASE, headers } from './config'
import { fetchLocation } from './mapbox'

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

// Update an existing pin
export const updatePin = async (pinId, pin) => {
  const response = await fetch(`${API_BASE}/pins/${pinId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      title: pin.title,
      description: pin.description,
      tags: pin.tags || [],
      lat: pin.lat,
      lng: pin.lng
    })
  })
  if (!response.ok) throw new Error('Failed to update pin')
  return response.json()
}

// Delete a pin by ID
export const deletePin = async (pinId) => {
  const response = await fetch(`${API_BASE}/pins/${pinId}`, {
    method: 'DELETE',
    headers
  })

  if (!response.ok) {
    throw new Error('Failed to delete pin')
  }

  return response.json()
}