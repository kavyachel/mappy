import './Tag.css'
import { TAG_ICONS, CUSTOM_ICON_OPTIONS } from '../../constants/tagIcons'

function Tag({ name, color, icon, onRemove, selectable, selected, onToggle }) {
  const Icon = TAG_ICONS[name] || (icon && CUSTOM_ICON_OPTIONS[icon])
  const bgColor = color || '#95A5A6'

  const handleClick = () => {
    if (selectable && onToggle) {
      onToggle(name)
    }
  }

  const isRemovable = !!onRemove

  return (
    <div
      className={`tag ${selectable ? 'tag-selectable' : ''} ${selected ? 'tag-selected' : ''} ${isRemovable ? 'tag-removable' : ''}`}
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
