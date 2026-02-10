import { API_BASE, headers } from './config'

const apiError = async (response, fallback) => {
  try {
    const body = await response.json()
    throw new Error(body.error || fallback)
  } catch (e) {
    if (e.message !== fallback) throw e
    throw new Error(fallback)
  }
}

// Create a new tag
export const createTag = async (tag) => {
  const response = await fetch(`${API_BASE}/tags`, {
    method: 'POST',
    headers,
    body: JSON.stringify(tag)
  })
  if (!response.ok) await apiError(response, 'Failed to create tag')
  return response.json()
}

// Fetch all tags
export const fetchTags = async () => {
  const response = await fetch(`${API_BASE}/tags`, { headers })
  if (!response.ok) await apiError(response, 'Failed to fetch tags')
  return response.json()
}
