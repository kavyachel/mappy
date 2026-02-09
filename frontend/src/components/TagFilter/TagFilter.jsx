import { TAG_DEFINITIONS } from '../../constants/tagDefinitions'
import './TagFilter.css'

function TagFilter({ selectedTag, onTagSelect }) {
  return (
    <div className="tag-filter">
      <div className="tag-filter-scroll">
        <button
          className={`tag-filter-btn ${selectedTag === null ? 'active' : ''}`}
          onClick={() => onTagSelect(null)}
        >
          All
        </button>
        {TAG_DEFINITIONS.map(tag => {
          const Icon = tag.icon
          return (
            <button
              key={tag.name}
              className={`tag-filter-btn ${selectedTag === tag.name ? 'active' : ''}`}
              onClick={() => onTagSelect(selectedTag === tag.name ? null : tag.name)}
              style={{ '--tag-color': tag.color }}
            >
              <Icon size={14} />
              <span>{tag.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default TagFilter
