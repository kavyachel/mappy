import { Formik, Form, Field, ErrorMessage } from 'formik'
import { useState } from 'react'
import { IoClose, IoAdd } from 'react-icons/io5'
import Tag from '../Tag/Tag'
import { createTag } from '../../api/pins'
import './PinForm.css'

const NEW_TAG_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
]

const validateTagName = (name) => {
  if (!name) return 'Tag name is required'
  if (name.length < 2) return 'Tag name must be at least 2 characters'
  if (name.length > 30) return 'Tag name must be 30 characters or less'
  if (!/^[a-zA-Z0-9 ]+$/.test(name)) return 'Letters, numbers, and spaces only'
  return null
}

function PinForm({ location, onSubmit, onClose, tags = [], onTagCreated }) {
  const [selectedTags, setSelectedTags] = useState([])
  const [showNewTagForm, setShowNewTagForm] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState(NEW_TAG_COLORS[0])
  const [tagError, setTagError] = useState(null)

  const toggleTag = (name) => {
    setSelectedTags(prev =>
      prev.includes(name) ? prev.filter(t => t !== name) : [...prev, name]
    )
  }

  const addNewTag = async () => {
    const name = newTagName.trim()
    setTagError(null)

    const validationError = validateTagName(name)
    if (validationError) {
      setTagError(validationError)
      return
    }

    // Check if tag already exists (case-insensitive)
    const exists = tags.some(t => t.name.toLowerCase() === name.toLowerCase())
    if (exists) {
      if (!selectedTags.some(t => t.toLowerCase() === name.toLowerCase())) {
        setSelectedTags(prev => [...prev, tags.find(t => t.name.toLowerCase() === name.toLowerCase()).name])
      }
      setNewTagName('')
      setShowNewTagForm(false)
      return
    }

    try {
      await createTag(name, newTagColor)
      onTagCreated?.()
      setSelectedTags(prev => [...prev, name])
      setNewTagName('')
      setNewTagColor(NEW_TAG_COLORS[0])
      setShowNewTagForm(false)
    } catch (error) {
      setTagError('Failed to create tag')
    }
  }

  return (
    <div className="pin-form">
      <button type="button" className="close-btn" onClick={onClose}>
        <IoClose size={28} />
      </button>
      <div className="form-header">
        <h2>📍 Create a Pin</h2>
      </div>

      <Formik
        initialValues={{ title: '', description: '' }}
        validate={values => {
          if (!values.title.trim()) return { title: 'Title is required' }
          return {}
        }}
        onSubmit={(values) => {
          onSubmit({
            title: values.title.trim(),
            description: values.description?.trim() || null,
            lat: location.lat,
            lng: location.lng,
            tags: selectedTags
          })
        }}
      >
        <Form className="form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <Field type="text" id="title" name="title" className="input-field" />
            <ErrorMessage name="title" component="div" className="error-message" />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <Field
              as="textarea"
              id="description"
              name="description"
              className="input-field textarea-field"
              maxLength="300"
            />
          </div>

          <div className="form-group">
            <label>Tags</label>
            {selectedTags.length > 0 && (
              <div className="selected-tags">
                {selectedTags.map(name => {
                  const tagDef = tags.find(t => t.name === name)
                  return (
                    <Tag
                      key={name}
                      name={name}
                      color={tagDef?.color}
                      icon={tagDef?.icon}
                      onRemove={toggleTag}
                    />
                  )
                })}
              </div>
            )}
            <div className="available-tags">
              {tags.map(tag => (
                <Tag
                  key={tag.name}
                  name={tag.name}
                  color={tag.color}
                  icon={tag.icon}
                  selectable
                  selected={selectedTags.includes(tag.name)}
                  onToggle={toggleTag}
                />
              ))}
              <button
                type="button"
                className="add-tag-btn"
                onClick={() => setShowNewTagForm(!showNewTagForm)}
              >
                <IoAdd size={18} />
              </button>
            </div>

            {showNewTagForm && (
              <div className="new-tag-form">
                <input
                  type="text"
                  className="new-tag-input"
                  placeholder="Tag name (2-30 characters)"
                  value={newTagName}
                  maxLength={30}
                  onChange={(e) => {
                    setNewTagName(e.target.value)
                    setTagError(null)
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addNewTag())}
                />
                {tagError && <div className="error-message">{tagError}</div>}
                <div className="color-swatches">
                  {NEW_TAG_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`color-swatch ${newTagColor === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewTagColor(color)}
                    />
                  ))}
                </div>
                <button type="button" className="add-new-tag-btn" onClick={addNewTag}>
                  Add
                </button>
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary">Save Pin</button>
        </Form>
      </Formik>
    </div>
  )
}

export default PinForm
