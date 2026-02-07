import mapboxgl from 'mapbox-gl'

// Store markers so we can remove them when refreshing
let currentMarkers = []

// Fetch pins within the current map viewport
export const fetchPins = async (map) => {
    // Remove existing markers
    currentMarkers.forEach(marker => marker.remove())
    currentMarkers = []

    const bounds = map.getBounds();
    const bbox = [
      bounds.getSouth(),
      bounds.getWest(),
      bounds.getNorth(),
      bounds.getEast()
    ];

    try {
      const response = await fetch(`http://localhost:5000/api/pins?viewport=${bbox.join(',')}`);
      if (!response.ok) {
        throw new Error('Failed to fetch pins');
      }
      const pins = await response.json();
      
      // Add markers for fetched pins
      pins.forEach(pin => {
        const marker = new mapboxgl.Marker({ color: "#3B82F6" })
          .setLngLat([pin.lng, pin.lat])
          .addTo(map);
        
        currentMarkers.push(marker)
      });
      
      console.log('Fetched pins:', pins);
    } catch (error) {
      console.error('Error fetching pins:', error);
    }
}

// Add a new pin to the map and backend
export const addPin = async (newPin) => {
  try {
    // Send to backend
    const response = await fetch('http://localhost:5000/api/pins', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: newPin.title,
        description: newPin.description,
        tags: newPin.tags || [],
        lat: newPin.lat,
        lng: newPin.lng
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create pin');
    }

    return response;

  } catch (error) {
    console.error('Error creating pin:', error);
  }
}