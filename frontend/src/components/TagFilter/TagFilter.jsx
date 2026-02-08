import { MdMenu } from 'react-icons/md'
import './TagFilter.css'

function TagFilter({ selectedTag, onTagSelect, collapsed, onCircleClick, tags = [] }) {
  const selectedTagDef = tags.find(t => t.name === selectedTag)
  const SelectedIcon = selectedTagDef?.icon

  return (
    <div className={`tag-filter ${collapsed ? 'collapsed' : ''}`}>
      {collapsed ? (
        <div
          className="tag-filter-circle"
          style={selectedTagDef ? { background: selectedTagDef.color } : undefined}
          onClick={onCircleClick}
        >
          {SelectedIcon ? <SelectedIcon size={20} /> : <MdMenu size={20} />}
        </div>
      ) : (
        <div className="tag-filter-scroll">
          <button
            className={`tag-filter-btn ${selectedTag === null ? 'active' : ''}`}
            onClick={() => onTagSelect(null)}
          >
            All
          </button>
          {tags.map(tag => {
            const Icon = tag.icon
            return (
              <button
                key={tag.name}
                className={`tag-filter-btn ${selectedTag === tag.name ? 'active' : ''}`}
                onClick={() => onTagSelect(selectedTag === tag.name ? null : tag.name)}
                style={{ '--tag-color': tag.color }}
              >
                {Icon ? <Icon size={16} /> : <span className="tag-dot" style={{ background: tag.color }} />}
                <span>{tag.name}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default TagFilter
