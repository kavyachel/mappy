import { getTagDefinition } from '../../constants/tagDefinitions'
import './PinCard.css'

function PinCard({ pin, onClick }) {
  return (
    <div className="pin-card" onClick={() => onClick(pin)}>
      <div className="pin-card-title">{pin.title}</div>
      {pin.description && (
        <div className="pin-card-description">{pin.description}</div>
      )}
      {pin.tags?.length > 0 && (
        <div className="pin-card-tags">
          {pin.tags.map(tag => {
            const def = getTagDefinition(tag)
            return (
              <span
                key={tag}
                className="pin-card-tag"
                style={{ background: def?.color || '#007AD1' }}
              >
                {tag}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default PinCard
