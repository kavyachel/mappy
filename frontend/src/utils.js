export function createPopupHTML({ title, description, lng, lat, tags }) {
  return `
    <div style="
      font-family: monospace;
      width: 260px;
      padding: 12px;
    ">
      <h2 style="
        margin: 0 0 8px 0;
        font-size: 18px;
        font-weight: 600;
      ">
        ${title}
      </h2>

      ${description ? `
        <p style="
          margin: 0 0 10px 0;
          font-size: 14px;
          line-height: 1.4;
          color: #444;
        ">
          ${description}
        </p>
      ` : ""}

      <div style="
        font-size: 12px;
        color: #666;
        margin-bottom: 10px;
      ">
        📍 ${lat.toFixed(4)}, ${lng.toFixed(4)}
      </div>

      ${tags && tags.length ? `
        <div style="
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        ">
          ${tags.map(tag => `
            <span style="
              background: #eef2ff;
              color: #3730a3;
              font-size: 11px;
              padding: 4px 8px;
              border-radius: 999px;
              font-weight: 500;
            ">
              ${tag}
            </span>
          `).join("")}
        </div>
      ` : ""}
    </div>
  `;
}
