import { Formik, Form, Field, ErrorMessage } from 'formik'
import { useState } from 'react'
import { IoClose } from "react-icons/io5"
import Tag from '../Tag/Tag'
import { TAG_DEFINITIONS } from '../../data/tagDefinitions'
import './PinForm.css'

function PinForm({ location, onSubmit, onClose }) {
  const [selectedTags, setSelectedTags] = useState([])

  const toggleTag = (tagName) => {
    setSelectedTags(prev => 
      prev.includes(tagName) 
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    )
  }

  const removeTag = (tagName) => {
    setSelectedTags(prev => prev.filter(t => t !== tagName))
  }

  return (
    <div className="pin-form">
        <button type="button" className="close-btn" onClick={onClose}>
            <IoClose size={24} />
        </button>
        <div className='form-header'>
             <h2>📍 Add New Pin</h2>
        </div>
     
      <Formik
        initialValues={{ title: '', description: '' }}
        validate={values => {
          const errors = {}
          if (!values.title.trim()) {
            errors.title = 'Title is required'
          }
          return errors
        }}
        onSubmit={(values) => {
          const pin = {
            title: values.title.trim(),
            description: values.description?.trim() || null,
            lat: location.lat,
            lng: location.lng,
            tags: selectedTags
          }
          onSubmit(pin)
        }}
      >
        <Form className='form'>
            <div className='form-group'>
                <label htmlFor="title">Title:</label>
                <Field
                    type="text"
                    id="title"
                    name="title"
                    className="input-field"
                    required
                />
                <ErrorMessage name="title" component="div" className="error-message" />
            </div>
            
            <div className='form-group'>
                <label htmlFor="description">Description:</label>
                <Field
                    as="textarea"
                    id="description"
                    name="description"
                    className="input-field textarea-field"
                    maxLength="300"
                    rows="3"
                />  
            </div>
            
            <div className='form-group'>
                <label htmlFor="tags">Tags:</label>
                
                {/* Selected tags */}
                {selectedTags.length > 0 && (
                  <div className="selected-tags">
                    {selectedTags.map((tagName, index) => (
                      <Tag 
                        key={`selected-${tagName}-${index}`} 
                        name={tagName} 
                        onRemove={removeTag}
                      />
                    ))}
                  </div>
                )}
                
                {/* Available tags */}
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

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              SAVE PIN
            </button>
            
          </div>
        </Form>
      </Formik>
    </div>
  )
}

export default PinForm
