import { API_BASE, headers, apiError } from './config'

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
