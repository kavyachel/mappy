import { useState, useEffect, useCallback, useMemo } from 'react'
import './App.css'
import Map from './components/Map/Map'
import PinForm from './components/PinForm/PinForm'
import TagFilter from './components/TagFilter/TagFilter'
import Sidebar from './components/Sidebar/Sidebar'
import { addPin, fetchTags } from './api/pins'
import { TAG_DEFINITIONS } from './constants/tagDefinitions'

function App() {
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedTag, setSelectedTag] = useState(null)
  const [dbTags, setDbTags] = useState([])

  const loadTags = useCallback(async () => {
    try {
      const tags = await fetchTags()
      setDbTags(tags)
    } catch (error) {
      console.error('Error fetching tags:', error)
    }
  }, [])

  useEffect(() => {
    loadTags()
  }, [loadTags])

  const allTags = useMemo(() => [...TAG_DEFINITIONS, ...dbTags], [dbTags])

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
      <TagFilter
        selectedTag={selectedTag}
        onTagSelect={setSelectedTag}
        collapsed={showForm}
        onCircleClick={closeForm}
        tags={allTags}
      />

      {showForm && (
        <Sidebar onClose={closeForm}>
          <PinForm
            location={selectedLocation}
            onSubmit={handlePinSubmit}
            onClose={closeForm}
            tags={allTags}
            onTagCreated={loadTags}
          />
        </Sidebar>
      )}

      <Map
        onLocationSelect={handleMapClick}
        selectedLocation={selectedLocation}
        selectedTag={selectedTag}
        tags={allTags}
      />
    </>
  )
}

export default App
