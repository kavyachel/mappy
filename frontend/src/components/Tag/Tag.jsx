import './Tag.css'
import { TAG_ICONS } from '../../constants/tagIcons'

function Tag({ name, color, onRemove, selectable, selected, onToggle }) {
  const Icon = TAG_ICONS[name]
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
          className="btn-icon tag-remove"
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
