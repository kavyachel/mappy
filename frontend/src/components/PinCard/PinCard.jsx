import './PinCard.css'

function PinCard({ pin, onClick }) {
  const firstTag = pin.tags?.[0]

  return (
    <div className="pin-card" onClick={() => onClick(pin)}>
      <div className="pin-card-row">
        {firstTag && (
          <span className="pin-card-tag" style={{ background: firstTag.color }}>
            {firstTag.name}
          </span>
        )}
        <span className="pin-card-title">{pin.title}</span>
      </div>
      <div className="pin-card-coords">
        📍 {pin.location ? pin.location : `${pin.lat.toFixed(4)}, ${pin.lng.toFixed(4)}`}
      </div>
    </div>
  )
}

export default PinCard
