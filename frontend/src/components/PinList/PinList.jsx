import PinCard from '../PinCard/PinCard'
import './PinList.css'

function PinList({ pins, onPinClick }) {
  if (!pins || pins.length === 0) {
    return (
      <div className="pin-list-empty">
        No pins in this area
      </div>
    )
  }

  return (
    <div className="pin-list">
      {pins.map(pin => (
        <PinCard key={pin.id} pin={pin} onClick={onPinClick} />
      ))}
    </div>
  )
}

export default PinList
