import { useState, useEffect, useCallback } from 'react'
import { IoClose } from 'react-icons/io5'
import './App.css'
import Map from './components/Map/Map'
import PinForm from './components/PinForm/PinForm'
import PinList from './components/PinList/PinList'
import Sidebar from './components/Sidebar/Sidebar'
import { AlertProvider, useAlert } from './components/Alert/Alert'
import { addPin, updatePin } from './api/pins'
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
  const [editingPin, setEditingPin] = useState(null)
  const { showAlert } = useAlert()

  const refreshTags = useCallback(() => {
    fetchTags().then(setTags).catch((e) => showAlert(e.message))
  }, [showAlert])

  useEffect(() => {
    refreshTags()
  }, [refreshTags])
  
  const closeForm = () => {
    setShowForm(false)
    setSelectedLocation(null)
    setSelectedTag(null)
    setEditingPin(null)
  }

  const handleMapClick = (location) => {
    setSelectedLocation(location)
    setShowForm(true)
  }

  const handlePinSubmit = async (pin) => {
    try {
      if (editingPin) {
        await updatePin(editingPin.id, pin)
      } else {
        await addPin(pin)
      }
      closeForm()
    } catch (error) {
      showAlert(error.message)
    }
  }

  const handlePinEdit = (pin) => {
    setEditingPin(pin)
    setSelectedLocation({ lat: pin.lat, lng: pin.lng })
    setShowForm(true)
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
      <Sidebar
        onClose={closeForm}
        showOverlay={showForm}
        isHidden={!isSidebarOpen}
        title={showForm ? (editingPin ? 'Edit Pin' : 'Create a Pin') : 'My Pins'}
        action={showForm ? (
          <button type="button" className="btn-icon" onClick={closeForm}>
            <IoClose size={18} />
          </button>
        ) : null}
      >
        {showForm ? (
          <PinForm
            location={selectedLocation}
            onSubmit={handlePinSubmit}
            tags={tags}
            onTagCreated={refreshTags}
            pin={editingPin}
          />
        ) : (
          pinsLoading ? (
            <div className="loading"></div>
          ) : (
            <PinList
              pins={pins}
              onPinClick={handlePinClick}
              onPinDelete={handlePinDelete}
              onPinEdit={handlePinEdit}
              tags={tags}
              selectedTag={selectedTag}
              onTagSelect={setSelectedTag}
            />
          )
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
