import { useState } from 'react'
import './PinForm.css'

/**
 * @typedef {Object} Location
 * @property {number} lng
 * @property {number} lat
 */

/**
 * @param {Object} props
 * @param {Location} props.location
 * @param {function} props.onSubmit
 * @param {function} props.onClose
 */

function PinForm({ location, onSubmit, onClose }) {
  const [title, setTitle] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!title.trim()) {
      return
    }

    const pin = {
      title: title.trim(),
      lat: location.lat,
      lng: location.lng
    }

    console.log(pin)

    onSubmit(pin)
  }

  // this is just POC, will move to Formik later
  return (
    <div className="pin-form">
      <h2>Add New Pin</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter pin title"
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            Save Pin
          </button>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default PinForm
