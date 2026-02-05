import { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css';
import './App.css'

const MAPBOX_TOKEN = 'dont_commit_a_secret_challenge'
function App() {
  const mapRef = useRef()
  const mapContainerRef = useRef()

  useEffect(() => {
    mapboxgl.accessToken = MAPBOX_TOKEN

    // Grab the user's location
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: false,
      showUserHeading: true,
      fitBoundsOptions: {
        zoom: 12
      }
    })

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      interactive: true,
      dragPan: true,
      zoom: 16,
    });

    mapRef.current.addControl(geolocate);

    mapRef.current.on('load', () => {
      geolocate.trigger();
    });

    return () => {
      mapRef.current.remove()
    }
  }, [])

  return (
    <>
      <div id='map-container' ref={mapContainerRef}/>
    </>
  )
}

export default App
