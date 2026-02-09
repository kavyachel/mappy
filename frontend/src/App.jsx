import { useState, useEffect } from 'react'
import './App.css'
import Map from './components/Map/Map'
import PinForm from './components/PinForm/PinForm'
import TagFilter from './components/TagFilter/TagFilter'
import PinList from './components/PinList/PinList'
import Sidebar from './components/Sidebar/Sidebar'
import { AlertProvider, useAlert } from './components/Alert/Alert'
import { addPin, fetchTags } from './api/pins'

function AppContent() {
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedTag, setSelectedTag] = useState(null)
  const [pins, setPins] = useState([])
  const [flyToPin, setFlyToPin] = useState(null)
  const [tags, setTags] = useState([])
  const { showAlert } = useAlert()

  useEffect(() => {
    fetchTags().then(setTags).catch(() => showAlert('Failed to load tags'))
  }, [])
  
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

  const handlePinClick = (pin) => {
    setFlyToPin(pin)
  }

  return (
    <>
      <Sidebar onClose={closeForm} showOverlay={showForm} isHidden={!isSidebarOpen}>
        {showForm ? (
          <PinForm
            location={selectedLocation}
            onSubmit={handlePinSubmit}
            onClose={closeForm}
            tags={tags}
          />
        ) : (
          <> 
            <h2>Your Pins</h2>
            <TagFilter
              tags={tags}
              selectedTag={selectedTag}
              onTagSelect={setSelectedTag}
            />
            <div className="sidebar-divider" />
            <div className="sidebar-content-list">
              <PinList pins={pins} onPinClick={handlePinClick} />
            </div>
          </>
        )}
      </Sidebar>

      <Map
        onLocationSelect={handleMapClick}
        selectedLocation={selectedLocation}
        selectedTag={selectedTag}
        onPinsLoaded={setPins}
        flyToPin={flyToPin}
        setIsSidebarOpen={setIsSidebarOpen}
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
