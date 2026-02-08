import { useState } from 'react'
import './App.css'
import Map from './components/Map/Map'
import PinForm from './components/PinForm/PinForm'
import TagFilter from './components/TagFilter/TagFilter'
import Sidebar from './components/Sidebar/Sidebar'
import { addPin } from './api/pins'

function App() {
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedTag, setSelectedTag] = useState(null)

  const closeForm = () => {
    setShowForm(false)
    setSelectedLocation(null)
  }

  const handleMapClick = (location) => {
    setSelectedLocation(location)
    setShowForm(true)
  }

  const handlePinSubmit = async (pin) => {
    try {
      await addPin(pin)
      closeForm()
    } catch (error) {
      console.error('Error creating pin:', error)
    }
  }

  return (
    <>
      <TagFilter selectedTag={selectedTag} onTagSelect={setSelectedTag} />

      {showForm && (
        <Sidebar onClose={closeForm}>
          <PinForm
            location={selectedLocation}
            onSubmit={handlePinSubmit}
            onClose={closeForm}
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

export default App
