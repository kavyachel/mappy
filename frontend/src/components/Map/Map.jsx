import { useRef, useEffect } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { fetchPins, addPin } from '../../../api/pins.js'

const NYC_CENTER = [-74.0060, 40.7128]
const DEFAULT_ZOOM = 12

const GEOLOCATE_CONFIG = {
  positionOptions: { enableHighAccuracy: true },
  trackUserLocation: false,
  showUserHeading: true,
  fitBoundsOptions: { zoom: DEFAULT_ZOOM }
}

function Map({ onLocationSelect }) {
  const mapRef = useRef()
  const mapContainerRef = useRef()

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

    // Setup geolocation
    const geolocate = new mapboxgl.GeolocateControl(GEOLOCATE_CONFIG)

    map.addControl(geolocate)

    const loadPins = () => fetchPins(map)
    const handleClick = (e) => onLocationSelect({ lng: e.lngLat.lng, lat: e.lngLat.lat })

    geolocate.on('geolocate', loadPins)
    geolocate.on('error', loadPins)
    
    map.on('load', () => geolocate.trigger())
    map.on('moveend', loadPins)
    map.on('click', handleClick)

    // Cleanup
    return () => {
      map.off('moveend', loadPins)
      map.off('click', handleClick)
      map.remove()
    }
  }, [])

  return <div id='map-container' ref={mapContainerRef}/>
}

export default Map
