import './Tag.css'

function Tag({ name, color, icon: Icon, onRemove, selectable, selected, onToggle }) {
  const bgColor = color || '#95A5A6'

  const handleClick = () => {
    if (selectable && onToggle) {
      onToggle(name)
    }
  }

  return (
    <div
      className={`tag ${selectable ? 'tag-selectable' : ''} ${selected ? 'tag-selected' : ''}`}
      onClick={handleClick}
      style={{ backgroundColor: bgColor }}
    >
      {Icon && <Icon className="tag-icon" />}
      <span>{name}</span>
      {onRemove && (
        <button
          className="tag-remove"
          onClick={(e) => {
            e.stopPropagation()
            onRemove(name)
          }}
          type="button"
        >
          ×
        </button>
      )}
    </div>
  )
}

export default Tag
