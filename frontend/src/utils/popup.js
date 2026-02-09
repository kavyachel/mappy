export function createPopupHTML({ title, description, location, lng, lat, tags }) {
  const validTags = (tags || []).filter(tag => tag?.name)

  return `
    <div style="font-family: monospace; min-width: 300px; padding: 16px;">
      <h2 style="font-size: 20px; font-weight: 600; word-wrap: break-word;">
        ${title}
      </h2>
      ${description ? `
        <p style="margin: 0 0 10px 0; font-size: 14px; line-height: 1.4; color: #444; word-wrap: break-word;">
          ${description}
        </p>
      ` : ''}
      <div style="font-size: 14px; color: #666; margin-bottom: 10px;">
        📍 ${location ? location : `${lat.toFixed(4)}, ${lng.toFixed(4)}`}
      </div>
      ${validTags.length ? `
        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
          ${validTags.map(tag => `
            <span style="
              background: ${tag.color || '#95A5A6'};
              color: white;
              font-size: 14px;
              padding: 4px 8px;
              border-radius: 999px;
              font-weight: 500;
              white-space: nowrap;
            ">${tag.name}</span>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `
}
