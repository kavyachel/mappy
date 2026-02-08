const getTagColor = (tagName, allTags = []) => {
  const tag = allTags.find(t => t.name === tagName)
  return tag?.color || '#95A5A6'
}

export function createPopupHTML({ title, description, lng, lat, pinTags, allTags }) {
  const getTagName = (tag) => {
    if (typeof tag === 'string') return tag
    if (tag?.name) return tag.name
    return null
  }

  const validTags = (pinTags || []).map(getTagName).filter(Boolean)

  return `
    <div style="font-family: monospace; min-width: 300px; padding: 16px;">
      <h2 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; word-wrap: break-word;">
        ${title}
      </h2>
      ${description ? `
        <p style="margin: 0 0 10px 0; font-size: 14px; line-height: 1.4; color: #444; word-wrap: break-word;">
          ${description}
        </p>
      ` : ''}
      <div style="font-size: 12px; color: #666; margin-bottom: 10px;">
        📍 ${lat.toFixed(4)}, ${lng.toFixed(4)}
      </div>
      ${validTags.length ? `
        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
          ${validTags.map(tag => `
            <span style="
              background: ${getTagColor(tag, allTags)};
              color: white;
              font-size: 11px;
              padding: 4px 8px;
              border-radius: 999px;
              font-weight: 500;
              white-space: nowrap;
            ">${tag}</span>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `
}
