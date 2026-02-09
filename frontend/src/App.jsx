import { useState, useEffect, useCallback } from 'react'
import './App.css'
import Map from './components/Map/Map'
import PinForm from './components/PinForm/PinForm'
import TagFilter from './components/TagFilter/TagFilter'
import PinList from './components/PinList/PinList'
import Sidebar from './components/Sidebar/Sidebar'
import { AlertProvider, useAlert } from './components/Alert/Alert'
import { addPin } from './api/pins'
import { fetchTags } from './api/tags'

function AppContent() {
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedTag, setSelectedTag] = useState(null)
  const [pins, setPins] = useState([])
  const [flyToPin, setFlyToPin] = useState(null)
  const [tags, setTags] = useState([])
  const [mapRefreshKey, setMapRefreshKey] = useState(0)
  const [pinsLoading, setPinsLoading] = useState(true)
  const { showAlert } = useAlert()

  const refreshTags = useCallback(() => {
    fetchTags().then(setTags).catch(() => showAlert('Failed to load tags'))
  }, [showAlert])

  useEffect(() => {
    refreshTags()
  }, [refreshTags])
  
  const closeForm = () => {
    setShowForm(false)
    setSelectedLocation(null)
    setSelectedTag(null)
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

  const handlePinDelete = (pinId) => {
    setPins(prev => prev.filter(p => p.id !== pinId))
    setMapRefreshKey(prev => prev + 1)
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
            onTagCreated={refreshTags}
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
              {pinsLoading ? (
                <div className="loading"></div>
              ) : (
                <PinList pins={pins} onPinClick={handlePinClick} onPinDelete={handlePinDelete} />
              )}
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
        refreshKey={mapRefreshKey}
        setPinsLoading={setPinsLoading}
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
