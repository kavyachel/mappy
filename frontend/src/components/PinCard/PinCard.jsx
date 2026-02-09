import { useState, useRef, useEffect } from 'react'
import { IoEllipsisVertical } from 'react-icons/io5'
import './PinCard.css'

function PinCard({ pin, onClick }) {
  const firstTag = pin.tags?.[0]
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

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
      style={{ '--accent': firstTag?.color || '#9ca3af' }}
      onClick={() => onClick(pin)}
    >
      <div className="pin-card-menu" ref={menuRef}>
        <button
          className="pin-card-menu-btn"
          onClick={(e) => {
            e.stopPropagation()
            setMenuOpen(!menuOpen)
          }}
        >
          <IoEllipsisVertical size={14} />
        </button>
        {menuOpen && (
          <div className="pin-card-dropdown">
            <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false) }}>Edit</button>
            <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false) }}>Delete</button>
          </div>
        )}
      </div>

      <span className="pin-card-title">{pin.title}</span>
      <span className="pin-card-location">
        📍 {pin.location ? pin.location : `${pin.lat.toFixed(4)}, ${pin.lng.toFixed(4)}`}
      </span>
      {firstTag && (
        <span className="pin-card-tag" style={{ background: firstTag.color }}>
          {firstTag.name}
        </span>
      )}
    </div>
  )
}

export default PinCard
