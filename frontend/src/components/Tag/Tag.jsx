import './Tag.css'
import { getTagDefinition } from '../../constants/tagDefinitions'

function Tag({ name, color, onRemove, selectable, selected, onToggle }) {
  const definition = getTagDefinition(name)
  const Icon = definition?.icon
  const bgColor = color || definition?.color || '#95A5A6'

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
