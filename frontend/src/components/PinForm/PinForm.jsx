import { Formik, Form, Field, ErrorMessage } from 'formik'
import { useState } from 'react'
import { IoClose, IoAdd } from 'react-icons/io5'
import Tag from '../Tag/Tag'
import { TAG_DEFINITIONS, getTagDefinition } from '../../constants/tagDefinitions'
import './PinForm.css'

const CUSTOM_TAG_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
]

function PinForm({ location, onSubmit, onClose }) {
  const [selectedTags, setSelectedTags] = useState([])
  const [customTags, setCustomTags] = useState({}) // { name: color }
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customColor, setCustomColor] = useState(CUSTOM_TAG_COLORS[0])

  const toggleTag = (name) => {
    setSelectedTags(prev =>
      prev.includes(name) ? prev.filter(t => t !== name) : [...prev, name]
    )
  }

  const addCustomTag = () => {
    const name = customName.trim()
    if (!name) return
    if (selectedTags.includes(name)) return

    setCustomTags(prev => ({ ...prev, [name]: customColor }))
    setSelectedTags(prev => [...prev, name])
    setCustomName('')
    setCustomColor(CUSTOM_TAG_COLORS[0])
    setShowCustomForm(false)
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
            tags: selectedTags.map(name => ({
              name,
              color: customTags[name] || getTagDefinition(name)?.color || '#95A5A6'
            }))
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
                {selectedTags.map(name => (
                  <Tag
                    key={name}
                    name={name}
                    color={customTags[name]}
                    onRemove={toggleTag}
                  />
                ))}
              </div>
            )}
            <div className="available-tags">
              {TAG_DEFINITIONS.map(tag => (
                <Tag
                  key={tag.name}
                  name={tag.name}
                  selectable
                  selected={selectedTags.includes(tag.name)}
                  onToggle={toggleTag}
                />
              ))}
              <button
                type="button"
                className="add-tag-btn"
                onClick={() => setShowCustomForm(!showCustomForm)}
              >
                <IoAdd size={18} />
              </button>
            </div>

            {showCustomForm && (
              <div className="custom-tag-form">
                <input
                  type="text"
                  className="custom-tag-input"
                  placeholder="Tag name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                />
                <div className="color-swatches">
                  {CUSTOM_TAG_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`color-swatch ${customColor === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setCustomColor(color)}
                    />
                  ))}
                </div>
                <button type="button" className="add-custom-btn" onClick={addCustomTag}>
                  Add
                </button>
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary">SAVE PIN</button>
        </Form>
      </Formik>
    </div>
  )
}

export default PinForm
