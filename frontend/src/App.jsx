import { useState } from 'react'
import './App.css'
import Map from './components/Map/Map'
import PinForm from './components/PinForm/PinForm'
import TagFilter from './components/TagFilter/TagFilter'
import Sidebar from './components/Sidebar/Sidebar'
import { AlertProvider, useAlert } from './components/Alert/Alert'
import { addPin } from './api/pins'

function AppContent() {
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedTag, setSelectedTag] = useState(null)
  const { showAlert } = useAlert()

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
      showAlert('Failed to create pin')
    }
  }

  return (
    <>
      <TagFilter
        selectedTag={selectedTag}
        onTagSelect={setSelectedTag}
        collapsed={showForm}
        onCircleClick={closeForm}
      />

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

function App() {
  return (
    <AlertProvider>
      <AppContent />
    </AlertProvider>
  )
}

export default App
