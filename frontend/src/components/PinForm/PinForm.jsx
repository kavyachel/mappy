import { Formik, Form, Field, ErrorMessage } from 'formik'
import { useState } from 'react'
import { IoClose } from 'react-icons/io5'
import Tag from '../Tag/Tag'
import { TAG_DEFINITIONS } from '../../constants/tagDefinitions'
import './PinForm.css'

function PinForm({ location, onSubmit, onClose }) {
  const [selectedTags, setSelectedTags] = useState([])

  const toggleTag = (name) => {
    setSelectedTags(prev =>
      prev.includes(name) ? prev.filter(t => t !== name) : [...prev, name]
    )
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
                {selectedTags.map(name => (
                  <Tag key={name} name={name} onRemove={toggleTag} />
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
            </div>
          </div>

          <button type="submit" className="btn-primary">Save Pin</button>
        </Form>
      </Formik>
    </div>
  )
}

export default PinForm
