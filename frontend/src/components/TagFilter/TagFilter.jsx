import { TAG_ICONS } from '../../constants/tagIcons'
import './TagFilter.css'

function TagFilter({ tags, selectedTag, onTagSelect }) {
  return (
    <div className="tag-filter">
      <div className="tag-filter-scroll">
        <button
          className={`tag-filter-btn ${selectedTag === null ? 'active' : ''}`}
          onClick={() => onTagSelect(null)}
        >
          All
        </button>
        {tags.map(tag => {
          const Icon = TAG_ICONS[tag.name]
          return (
            <button
              key={tag.name}
              className={`tag-filter-btn ${selectedTag === tag.name ? 'active' : ''}`}
              onClick={() => onTagSelect(selectedTag === tag.name ? null : tag.name)}
              style={{ '--tag-color': tag.color }}
            >
              {Icon && <Icon size={14} />}
              <span>{tag.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default TagFilter
