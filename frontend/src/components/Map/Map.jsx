import { useRef, useEffect, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { fetchPins } from '../../api/pins.js'
import { createPopupHTML } from '../../utils/popup.js'
import { NYC_CENTER, DEFAULT_ZOOM, GEOLOCATE_CONFIG } from '../../constants/map.js'
import { useAlert } from '../Alert/Alert'

function Map({ onLocationSelect, selectedLocation, selectedTag }) {
  const { showAlert } = useAlert()
  const mapRef = useRef()
  const mapContainerRef = useRef()
  const tempMarkerRef = useRef(null)
  const userLocationRef = useRef(null)
  const markersRef = useRef([])
  const onLocationSelectRef = useRef(onLocationSelect)
  const selectedTagRef = useRef(selectedTag)

  // Keep refs updated with latest values
  onLocationSelectRef.current = onLocationSelect
  selectedTagRef.current = selectedTag

  // Clear all pin markers from the map
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []
  }, [])

  // Add markers for pins
  const addMarkers = useCallback((pins, map) => {
    pins.forEach(pin => {
      const marker = new mapboxgl.Marker({ color: '#007AD1' })
        .setLngLat([pin.lng, pin.lat])
        .addTo(map)

      marker.getElement().addEventListener('click', (e) => {
        e.stopPropagation()

        const popup = new mapboxgl.Popup({ offset: 25, maxWidth: '400px' })
          .setLngLat([pin.lng, pin.lat])
          .setHTML(createPopupHTML({
            title: pin.title,
            description: pin.description,
            lng: pin.lng,
            lat: pin.lat,
            tags: pin.tags
          }))
          .addTo(map)

        map.flyTo({
          center: [pin.lng, pin.lat],
          zoom: 16,
          duration: 200
        })

        popup.on('close', () => {
          if (userLocationRef.current) {
            map.flyTo({
              center: [userLocationRef.current.lng, userLocationRef.current.lat],
              zoom: DEFAULT_ZOOM,
              duration: 500
            })
          }
        })
      })

      markersRef.current.push(marker)
    })
  }, [])

  // Load pins for current viewport
  const loadPins = useCallback(async (map) => {
    try {
      const bounds = map.getBounds()
      const pins = await fetchPins(
        {
          south: bounds.getSouth(),
          west: bounds.getWest(),
          north: bounds.getNorth(),
          east: bounds.getEast()
        },
        selectedTagRef.current
      )

      clearMarkers()
      addMarkers(pins, map)
    } catch (error) {
      showAlert('Failed to load pins')
    }
  }, [clearMarkers, addMarkers, showAlert])

  // Initialize map
  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_PUBLIC_MAPBOX_TOKEN

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      interactive: true,
      dragPan: true,
      center: NYC_CENTER,
      zoom: DEFAULT_ZOOM,
      style: 'mapbox://styles/kavyasub/cmlcjf8h9002y01sa5jf1ezw0'
    })
    mapRef.current = map

    const handleClick = (e) => {
      onLocationSelectRef.current?.({ lng: e.lngLat.lng, lat: e.lngLat.lat })
    }

    const geolocate = new mapboxgl.GeolocateControl(GEOLOCATE_CONFIG)
    map.addControl(geolocate)
    map.on('click', handleClick)

    geolocate.on('geolocate', (e) => {
      userLocationRef.current = { lng: e.coords.longitude, lat: e.coords.latitude }
      loadPins(map)
    })

    geolocate.on('error', () => {
      userLocationRef.current = { lng: NYC_CENTER[0], lat: NYC_CENTER[1] }
      loadPins(map)
    })

    map.on('load', () => geolocate.trigger())
    map.on('moveend', () => loadPins(map))

    return () => {
      clearMarkers()
      if (tempMarkerRef.current) {
        tempMarkerRef.current.remove()
      }
      map.off('click', handleClick)
      map.remove()
    }
  }, [loadPins, clearMarkers])

  // Handle selected location changes
  useEffect(() => {
    if (!mapRef.current) return

    // Clean up temp marker
    tempMarkerRef.current?.remove()
    tempMarkerRef.current = null

    if (selectedLocation) {
      mapRef.current.flyTo({
        center: [selectedLocation.lng, selectedLocation.lat],
        zoom: 16,
        duration: 200
      })

      tempMarkerRef.current = new mapboxgl.Marker({ color: '#6B7280' })
        .setLngLat([selectedLocation.lng, selectedLocation.lat])
        .addTo(mapRef.current)

    } else if (userLocationRef.current) {
      loadPins(mapRef.current)
      mapRef.current.flyTo({
        center: [userLocationRef.current.lng, userLocationRef.current.lat],
        zoom: DEFAULT_ZOOM,
        duration: 500
      })
    }
  }, [selectedLocation, loadPins])

  // Reload pins when tag filter changes
  useEffect(() => {
    if (!mapRef.current) return
    loadPins(mapRef.current)
  }, [selectedTag, loadPins])

  return <div id='map-container' ref={mapContainerRef} />
}

export default Map
