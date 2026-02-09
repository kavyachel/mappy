import { getTagDefinition } from '../../constants/tagDefinitions'
import './PinCard.css'

function PinCard({ pin, onClick }) {
  const firstTag = pin.tags?.[0]
  const def = firstTag ? getTagDefinition(firstTag) : null

  return (
    <div className="pin-card" onClick={() => onClick(pin)}>
      <div className="pin-card-row">
        {def && (
          <span className="pin-card-tag" style={{ background: def.color }}>
            {firstTag}
          </span>
        )}
        <span className="pin-card-title">{pin.title}</span>
      </div>
      <div className="pin-card-coords">
        {pin.lat.toFixed(4)}, {pin.lng.toFixed(4)}
      </div>
    </div>
  )
}

export default PinCard
