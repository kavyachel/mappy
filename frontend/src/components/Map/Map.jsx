import { useRef, useEffect, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { fetchPins } from '../../api/pins.js'
import { createPopupHTML } from '../../utils/popup.js'
import { NYC_CENTER, DEFAULT_ZOOM, GEOLOCATE_CONFIG } from '../../constants/map.js'
import { useAlert } from '../Alert/Alert'
import './Map.css'

const LOCATION_CACHE_KEY = 'mappy_last_location'
const SIDEBAR_PADDING = { left: 400, top: 0, right: 0, bottom: 0 }
const DURATION = 400

const getCachedLocation = () => {
  try {
    const cached = localStorage.getItem(LOCATION_CACHE_KEY)
    if (cached) return JSON.parse(cached)
  } catch {}
  return null
}

const setCachedLocation = (lng, lat) => {
  try {
    localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify({ lng, lat }))
  } catch {}
}

function Map({ onLocationSelect, selectedLocation, selectedTag, onPinsLoaded, flyToPin, setIsSidebarOpen, refreshKey, setPinsLoading }) {
  const { showAlert } = useAlert()
  const mapRef = useRef()
  const mapContainerRef = useRef()
  const tempMarkerRef = useRef(null)
  const userLocationRef = useRef(null)
  const markersRef = useRef([])
  const popupRef = useRef(null)
  const onLocationSelectRef = useRef(onLocationSelect)
  const onPinsLoadedRef = useRef(onPinsLoaded)
  const selectedTagRef = useRef(selectedTag)
  const isFirstLocate = useRef(true)
  const setPinsLoadingRef = useRef(setPinsLoading)
  const viewCenterRef = useRef(null)

  // Keep refs updated with latest values
  onLocationSelectRef.current = onLocationSelect
  setPinsLoadingRef.current = setPinsLoading
  onPinsLoadedRef.current = onPinsLoaded
  selectedTagRef.current = selectedTag

  // Clear all pin markers from the map
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []
  }, [])

  // Open a popup for a pin and return to previous view on close
  const showPinPopup = useCallback((pin, map) => {
    // Capture where the user was before we fly away
    const center = map.getCenter()
    viewCenterRef.current = { lng: center.lng, lat: center.lat, zoom: map.getZoom() }

    popupRef.current?.remove()

    const popup = new mapboxgl.Popup({ offset: 25, maxWidth: '400px' })
      .setLngLat([pin.lng, pin.lat])
      .setHTML(createPopupHTML({
        title: pin.title,
        description: pin.description,
        location: pin.location,
        lng: pin.lng,
        lat: pin.lat,
        tags: pin.tags
      }))
      .addTo(map)

    popupRef.current = popup

    popup.on('close', () => {
      popupRef.current = null
      setPinsLoadingRef.current?.(true)
      const returnTo = viewCenterRef.current
      if (returnTo) {
        map.flyTo({
          center: [returnTo.lng, returnTo.lat],
          zoom: returnTo.zoom,
          duration: 500,
          padding: SIDEBAR_PADDING
        })
      }
      setIsSidebarOpen(true)
    })
  }, [setIsSidebarOpen])

  // Add markers for pins
  const addMarkers = useCallback((pins, map) => {
    pins.forEach(pin => {
      const markerColor = pin.tags?.[0]?.color || '#007AD1'
      const marker = new mapboxgl.Marker({ color: markerColor })
        .setLngLat([pin.lng, pin.lat])
        .addTo(map)

      marker.getElement().style.cursor = 'pointer'

      marker.getElement().addEventListener('click', (e) => {
        e.stopPropagation()
        setIsSidebarOpen(false)
        showPinPopup(pin, map)
        map.flyTo({
          center: [pin.lng, pin.lat],
          zoom: 16,
          duration: DURATION,
          padding: 0
        })
      })

      markersRef.current.push(marker)
    })
  }, [setIsSidebarOpen, showPinPopup])

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

      // Map may have been destroyed while fetch was in flight
      if (map !== mapRef.current) return

      clearMarkers()
      addMarkers(pins, map)
      onPinsLoadedRef.current?.(pins)
      setPinsLoadingRef.current?.(false)
    } catch (error) {
      showAlert(error.message)
      setPinsLoadingRef.current?.(false)
    }
  }, [clearMarkers, addMarkers, showAlert])

  // Initialize map
  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_PUBLIC_MAPBOX_TOKEN

    const cached = getCachedLocation()
    const initialCenter = cached ? [cached.lng, cached.lat] : NYC_CENTER

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      center: initialCenter,
      zoom: DEFAULT_ZOOM,
      style: 'mapbox://styles/kavyasub/cmlcjf8h9002y01sa5jf1ezw0'
    })
    mapRef.current = map

    // Set initial user location from cache
    if (cached) {
      userLocationRef.current = cached
      viewCenterRef.current = { ...cached, zoom: DEFAULT_ZOOM }
    }

    const handleClick = (e) => {
      onLocationSelectRef.current?.({ lng: e.lngLat.lng, lat: e.lngLat.lat })
    }

    const geolocate = new mapboxgl.GeolocateControl(GEOLOCATE_CONFIG)
    map.addControl(geolocate)
    map.on('click', handleClick)

    geolocate.on('geolocate', (e) => {
      const lng = e.coords.longitude
      const lat = e.coords.latitude
      userLocationRef.current = { lng, lat }
      viewCenterRef.current = { lng, lat, zoom: DEFAULT_ZOOM }
      setCachedLocation(lng, lat)

      // Only fly if this is first locate and we started from a different spot
      if (isFirstLocate.current) {
        isFirstLocate.current = false
        const center = map.getCenter()
        const distance = Math.abs(center.lng - lng) + Math.abs(center.lat - lat)
        if (distance > 0.01) {
          map.flyTo({ center: [lng, lat], zoom: DEFAULT_ZOOM, duration: 500 })
        }
      }

      loadPins(map)
    })

    geolocate.on('error', () => {
      if (!userLocationRef.current) {
        userLocationRef.current = { lng: NYC_CENTER[0], lat: NYC_CENTER[1] }
      }
      isFirstLocate.current = false
      loadPins(map)
    })

    map.on('load', () => {
      geolocate.trigger()
      map.on('moveend', () => loadPins(map))
    })

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
      // Capture current view before flying to pin location
      const center = mapRef.current.getCenter()
      viewCenterRef.current = { lng: center.lng, lat: center.lat, zoom: mapRef.current.getZoom() }

      mapRef.current.flyTo({
        center: [selectedLocation.lng, selectedLocation.lat],
        zoom: 16,
        duration: DURATION,
        padding: SIDEBAR_PADDING
      })

      tempMarkerRef.current = new mapboxgl.Marker({ color: '#6B7280' })
        .setLngLat([selectedLocation.lng, selectedLocation.lat])
        .addTo(mapRef.current)

    } else {
      // Form closed — return to where the user was browsing
      const returnTo = viewCenterRef.current
      if (returnTo) {
        loadPins(mapRef.current)
        mapRef.current.flyTo({
          center: [returnTo.lng, returnTo.lat],
          zoom: returnTo.zoom,
          duration: 500,
          padding: SIDEBAR_PADDING
        })
      }
    }
  }, [selectedLocation, loadPins])

  // Reload pins when tag filter changes (stay in place)
  useEffect(() => {
    if (!mapRef.current) return

    popupRef.current?.remove()
    popupRef.current = null

    loadPins(mapRef.current)
  }, [selectedTag, loadPins])

  // Reload pins when triggered externally (e.g. pin deleted)
  useEffect(() => {
    if (!mapRef.current || !refreshKey) return
    loadPins(mapRef.current)
  }, [refreshKey, loadPins])

  // Fly to a pin when clicked from PinList
  useEffect(() => {
    if (!mapRef.current || !flyToPin) return

    setIsSidebarOpen(false)
    showPinPopup(flyToPin, mapRef.current)
    mapRef.current.flyTo({
      center: [flyToPin.lng, flyToPin.lat],
      zoom: 16,
      duration: 500,
    })
  }, [flyToPin, showPinPopup])

  return <div id='map-container' ref={mapContainerRef} />
}

export default Map
