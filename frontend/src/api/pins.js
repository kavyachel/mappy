const API_BASE = 'http://localhost:5000/api'

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

  const response = await fetch(`${API_BASE}/pins?${params}`)

  if (!response.ok) {
    throw new Error('Failed to fetch pins')
  }

  return response.json()
}

// Create a new pin
export const addPin = async (pin) => {
  const response = await fetch(`${API_BASE}/pins`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: pin.title,
      description: pin.description,
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

// Fetch all custom tags
export const fetchTags = async () => {
  const response = await fetch(`${API_BASE}/tags`)

  if (!response.ok) {
    throw new Error('Failed to fetch tags')
  }

  return response.json()
}

// Create a custom tag
export const createTag = async (name, color) => {
  const response = await fetch(`${API_BASE}/tags`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, color })
  })

  if (!response.ok) {
    throw new Error('Failed to create tag')
  }

  return response.json()
}
