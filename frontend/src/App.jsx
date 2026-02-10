import { useState, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
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
  const queryClient = useQueryClient()
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedTag, setSelectedTag] = useState(null)
  const [pins, setPins] = useState([])
  const [flyToPin, setFlyToPin] = useState(null)
  const [mapRefreshKey, setMapRefreshKey] = useState(0)
  const [pinsLoading, setPinsLoading] = useState(true)
  const [editingPin, setEditingPin] = useState(null)
  const { showAlert } = useAlert()

  const { data: tags = [] } = useQuery({ queryKey: ['tags'], queryFn: fetchTags, staleTime: Infinity })

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
      queryClient.invalidateQueries({ queryKey: ['pins'] })
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
    queryClient.invalidateQueries({ queryKey: ['pins'] })
    setMapRefreshKey(prev => prev + 1)
  }

  const handlePinClick = (pin) => {
    setFlyToPin(pin)
  }

  const onTagCreated = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['tags'] })
  }, [queryClient])

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
            onTagCreated={onTagCreated}
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
