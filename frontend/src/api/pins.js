const API_BASE = 'http://localhost:5000/api'

// Fetch pins within viewport bounds
export const fetchPins = async (bounds) => {
  const bbox = [
    bounds.south,
    bounds.west,
    bounds.north,
    bounds.east
  ]

  const response = await fetch(`${API_BASE}/pins?viewport=${bbox.join(',')}`)

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
