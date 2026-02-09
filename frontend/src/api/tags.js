// Create a new tag
export const createTag = async (tag) => {
    const response = await fetch(`${API_BASE}/tags`, {
        method: 'POST',
        headers,
        body: JSON.stringify(tag)
    })
    if (!response.ok) {
        throw new Error('Failed to create tag')
    }
    return response.json()
}

// Fetch all tags
export const fetchTags = async () => {
    const response = await fetch(`${API_BASE}/tags`, { headers })
    if (!response.ok) {
        throw new Error('Failed to fetch tags')
    }
    return response.json()
}