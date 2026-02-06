import { useRef, useEffect } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css';
import './App.css'
import { fetchPins, addPin } from '../api/pins.js';

function App() {
  const mapRef = useRef()
  const mapContainerRef = useRef()

  const handleMapClick = ({e, map}) => {
    const { lng, lat } = e.lngLat;
    addPin({ map, lng, lat });
  }

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_PUBLIC_MAPBOX_TOKEN;

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
      zoom: 12,
    });

    mapRef.current.addControl(geolocate);

    mapRef.current.on('load', () => {
      geolocate.trigger();
      
      // Wait for geolocate to finish before we fetch pins
      setTimeout(() => {
        fetchPins(mapRef.current);
      }, 1000);
    });

    // Fetch pins when map moves/zooms
    mapRef.current.on('moveend', () => {
      fetchPins(mapRef.current);
    });

    mapRef.current.on('click', (e) => handleMapClick({e, map: mapRef.current}));

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
