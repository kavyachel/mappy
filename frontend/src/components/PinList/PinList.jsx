import PinCard from '../PinCard/PinCard'
import TagFilter from '../TagFilter/TagFilter'
import './PinList.css'

function PinList({ pins, onPinClick, onPinDelete, onPinEdit, tags, selectedTag, onTagSelect }) {
  return (
    <div className="pin-list">
      <h2>My Pins</h2>
      <TagFilter
        tags={tags}
        selectedTag={selectedTag}
        onTagSelect={onTagSelect}
      />
      <div className="sidebar-divider" />
      <div className="sidebar-content-list">
        {(!pins || pins.length === 0) ? (
          <div className="pin-list-empty">No pins in this area</div>
        ) : (
          pins.map(pin => (
            <PinCard key={pin.id} pin={pin} onClick={onPinClick} onDelete={onPinDelete} onEdit={onPinEdit} />
          ))
        )}
      </div>
    </div>
  )
}

export default PinList
