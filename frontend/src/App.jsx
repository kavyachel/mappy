import { useState } from 'react'
import './App.css'
import Map from './components/Map/Map'
import PinForm from './components/PinForm/PinForm'
import TagFilter from './components/TagFilter/TagFilter'
import { addPin } from './api/pins.js'
import Sidebar from './components/Sidebar/Sidebar.jsx'

function App() {
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedTag, setSelectedTag] = useState(null)

  const handleMapClick = (location) => {
    setSelectedLocation(location)
    setShowForm(true)
  }

  const handlePinSubmit = async (pin) => {
    try {
      const resp = await addPin(pin)

      if (!resp) {
        throw new Error('Failed to create pin')
      }

      setShowForm(false)
      setSelectedLocation(null)
    } catch (error) {
      console.error('Error creating pin:', error)
    }
  }

  return (
    <>
      <TagFilter
        selectedTag={selectedTag}
        onTagSelect={setSelectedTag}
      />

      {showForm && (
        <Sidebar>
          <PinForm
            location={selectedLocation}
            onSubmit={handlePinSubmit}
            onClose={() => {
              setShowForm(false)
              setSelectedLocation(null)
            }}
          />
        </Sidebar>
      )}

      <Map
        onLocationSelect={handleMapClick}
        selectedLocation={selectedLocation}
        selectedTag={selectedTag}
      />
    </>
  )
}

export default App;
