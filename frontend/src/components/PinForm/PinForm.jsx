import { Formik, Form, Field, ErrorMessage } from 'formik'
import { useState } from 'react'
import { IoAdd } from 'react-icons/io5'
import Tag from '../Tag/Tag'
import { useAlert } from '../Alert/Alert'
import { createTag } from '../../api/tags'
import { CUSTOM_ICON_OPTIONS } from '../../constants/tagIcons'
import './PinForm.css'

const CUSTOM_TAG_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#77DD77'
]

function PinForm({ location, onSubmit, tags, onTagCreated, pin }) {
  const isEditing = !!pin
  const builtInTagNames = new Set(tags.map(t => t.name))

  const [selectedTags, setSelectedTags] = useState(() => {
    if (pin?.tags) return pin.tags.map(t => t.name)
    return []
  })
  const [customTags, setCustomTags] = useState(() => {
    if (pin?.tags) {
      const custom = {}
      pin.tags.forEach(t => {
        if (!builtInTagNames.has(t.name)) custom[t.name] = { color: t.color, icon: t.icon || null }
      })
      return custom
    }
    return {}
  })
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customColor, setCustomColor] = useState(CUSTOM_TAG_COLORS[0])
  const [customIcon, setCustomIcon] = useState(null)
  const { showAlert } = useAlert()
  const [tagsChanged, setTagsChanged] = useState(false)

  const selectTag = (name) => {
    setSelectedTags(prev => {
      if (prev.includes(name)) return prev
      setTagsChanged(true)
      return [...prev, name]
    })
  }

  const removeTag = (name) => {
    setTagsChanged(true)
    setSelectedTags(prev => prev.filter(t => t !== name))
  }

  const addCustomTag = async () => {
    try {
      const name = customName.trim()
      if (!name) return
      if (selectedTags.includes(name)) return

      await createTag({ name, color: customColor, icon: customIcon })
      onTagCreated?.()

      setCustomTags(prev => ({ ...prev, [name]: { color: customColor, icon: customIcon } }))
      setTagsChanged(true)
      setSelectedTags(prev => [...prev, name])
      setCustomName('')
      setCustomColor(CUSTOM_TAG_COLORS[0])
      setCustomIcon(null)
      setShowCustomForm(false)
    } catch (error) {
      showAlert(error.message)
    }
  }

  return (
    <div className="pin-form">
      <p className='coords'>📍 {`${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}</p>

      <Formik
        enableReinitialize
        validateOnMount
        initialValues={{ title: pin?.title || '', description: pin?.description || '' }}
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
            tags: selectedTags.map(name => {
              const custom = customTags[name]
              const builtin = tags.find(t => t.name === name)
              return {
                name,
                color: custom?.color || builtin?.color || '#95A5A6',
                icon: custom?.icon || builtin?.icon || null
              }
            })
          })
        }}
      >
        {({ dirty, isValid }) => {
          const isDirty = dirty || tagsChanged
          return (
        <Form className="form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <Field type="text" id="title" name="title" className="input-field" maxLength="25"/>
            <ErrorMessage name="title" component="div" className="error-message" />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <Field
              as="textarea"
              id="description"
              name="description"
              className="input-field textarea-field"
              maxLength="75"
            />
          </div>

          <div className="form-group">
            <label>Tags</label>
            {selectedTags.length > 0 && (
              <div className="selected-tags">
                {selectedTags.map(name => {
                  const custom = customTags[name]
                  const builtin = tags.find(t => t.name === name)
                  return (
                    <Tag
                      key={name}
                      name={name}
                      color={custom?.color || builtin?.color}
                      icon={custom?.icon || builtin?.icon}
                      onRemove={removeTag}
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
                  onToggle={selectTag}
                />
              ))}
              <button
                type="button"
                className="btn-icon add-tag-btn"
                onClick={() => setShowCustomForm(!showCustomForm)}
              >
                <IoAdd size={18} />
              </button>
            </div>

            {showCustomForm && (
              <div className="custom-tag-form">
                <label htmlFor="tag">TAG NAME</label>
                <input
                  type="text"
                  className="custom-tag-input"
                  maxLength={20}
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                />
                <div className="swatches">
                  {Object.entries(CUSTOM_ICON_OPTIONS).map(([key, Icon]) => (
                    <button
                      key={key}
                      type="button"
                      className={`swatch icon ${customIcon === key ? 'selected' : ''}`}
                      onClick={() => setCustomIcon(customIcon === key ? null : key)}
                    >
                      <Icon size={16} />
                    </button>
                  ))}
                </div>
                <div className="swatches">
                  {CUSTOM_TAG_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`swatch color ${customColor === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setCustomColor(color)}
                    />
                  ))}
                </div>
                <button type="button" className={`btn secondary ${!customName.trim() ? 'btn-disabled' : ''}`} onClick={addCustomTag}>
                  ADD
                </button>
              </div>
            )}
          </div>

          <button type="submit" className={`btn ${!isValid || (isEditing && !isDirty) ? 'btn-disabled' : ''}`}>{isEditing ? 'UPDATE PIN' : 'SAVE PIN'}</button>
        </Form>
          )
        }}
      </Formik>
    </div>
  )
}

export default PinForm
