import { useState, useRef, useEffect } from 'react'
import { IoEllipsisVertical } from 'react-icons/io5'
import { deletePin } from '../../api/pins'
import { TAG_ICONS, CUSTOM_ICON_OPTIONS } from '../../constants/tagIcons'
import './PinCard.css'

function PinCard({ pin, onClick, onDelete, onEdit }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const handleDelete = async (e) => {
    e.stopPropagation()
    try {
      await deletePin(pin.id)
      onDelete?.(pin.id)
    } catch (error) {
      console.error('Failed to delete pin', error)
    }
  }

  useEffect(() => {
    if (!menuOpen) return
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  return (
    <div
      className="pin-card"
      style={{ '--accent': pin.tags?.[0]?.color || '#9ca3af' }}
      onClick={() => onClick(pin)}
    >
      <div className="pin-card-menu" ref={menuRef}>
        <button
          className="btn-icon pin-card-menu-btn"
          onClick={(e) => {
            e.stopPropagation()
            setMenuOpen(!menuOpen)
          }}
        >
          <IoEllipsisVertical size={14} />
        </button>
        {menuOpen && (
          <div className="pin-card-dropdown">
            <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit?.(pin) }}>Edit</button>
            <button onClick={handleDelete}>Delete</button>
          </div>
        )}
      </div>

      <span className="pin-card-title">{pin.title}</span>
      <span className="pin-card-location">
        📍 {pin.location ? pin.location : `${pin.lat.toFixed(4)}, ${pin.lng.toFixed(4)}`}
      </span>
      {pin.tags?.length > 0 && (
        <div className="pin-card-tags">
          {pin.tags.map(tag => {
            const Icon = TAG_ICONS[tag.name] || (tag.icon && CUSTOM_ICON_OPTIONS[tag.icon])
            return (
              <span key={tag.name} className="pin-card-tag" style={{ background: tag.color }}>
                {Icon && <Icon size={12} />}
                {tag.name}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default PinCard
