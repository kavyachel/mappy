import { useRef, useEffect } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { fetchPins } from '../../../api/pins.js'

const NYC_CENTER = [-74.0060, 40.7128]
const DEFAULT_ZOOM = 12

const GEOLOCATE_CONFIG = {
  positionOptions: { enableHighAccuracy: true },
  trackUserLocation: false,
  showUserHeading: true,
  fitBoundsOptions: { zoom: DEFAULT_ZOOM }
}

function Map({ onLocationSelect, selectedLocation }) {
  const mapRef = useRef()
  const mapContainerRef = useRef()
  const tempMarkerRef = useRef(null)
  const userLocationRef = useRef(null)

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_PUBLIC_MAPBOX_TOKEN

    // Initialize map
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      interactive: true,
      dragPan: true,
      center: NYC_CENTER,
      zoom: DEFAULT_ZOOM,
    })

    mapRef.current = map

    // Ask user for location
    const geolocate = new mapboxgl.GeolocateControl(GEOLOCATE_CONFIG)

    map.addControl(geolocate)

    const loadPins = () => fetchPins(map)
    const handleClick = (e) => onLocationSelect({ lng: e.lngLat.lng, lat: e.lngLat.lat })

    geolocate.on('geolocate', (e) => {
      userLocationRef.current = { lng: e.coords.longitude, lat: e.coords.latitude }
      loadPins()
    })
    geolocate.on('error', () => {
      userLocationRef.current = { lng: NYC_CENTER[0], lat: NYC_CENTER[1] }
      loadPins()
    })
    
    map.on('load', () => geolocate.trigger())
    map.on('moveend', loadPins)
    map.on('click', handleClick)

    // Cleanup
    return () => {
      if (tempMarkerRef.current) {
        tempMarkerRef.current.remove()
      }
      map.off('moveend', loadPins)
      map.off('click', handleClick)
      map.remove()
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current) return

    // Clean up temp marker
    tempMarkerRef.current?.remove()
    tempMarkerRef.current = null

    if (selectedLocation) {
      // Zoom to selected location and show temp marker
      mapRef.current.flyTo({
        center: [selectedLocation.lng, selectedLocation.lat],
        zoom: 16,
        duration: 200
      })

      tempMarkerRef.current = new mapboxgl.Marker({ color: "#6B7280" })
        .setLngLat([selectedLocation.lng, selectedLocation.lat])
        .addTo(mapRef.current)
    } else if (userLocationRef.current) {
      // Reset to user location and reload pins
      fetchPins(mapRef.current)
      mapRef.current.flyTo({
        center: [userLocationRef.current.lng, userLocationRef.current.lat],
        zoom: DEFAULT_ZOOM,
        duration: 500
      })
    }
  }, [selectedLocation])

  return <div id='map-container' ref={mapContainerRef}/>
}

export default Map
