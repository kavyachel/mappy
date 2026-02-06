import mapboxgl from 'mapbox-gl'

// Fetch pins within the current map viewport
export const fetchPins = async (map) => {
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
        new mapboxgl.Marker({ color: "red" })
          .setLngLat([pin.lon, pin.lat])
          .addTo(map);
      });
      
      console.log('Fetched pins:', pins);
    } catch (error) {
      console.error('Error fetching pins:', error);
    }
}

// Add a new pin to the map and backend
export const addPin = async ({ map, lng, lat }) => {
  try {
    // Send to backend
    const response = await fetch('http://localhost:5000/api/pins', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'New Pin',
        lat: lat,
        lon: lng
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create pin');
    }

    const pin = await response.json();
    // remove this later
    console.log('Pin created:', pin);

    // Add marker to map
    new mapboxgl.Marker({ color: "blue" })
      .setLngLat([lng, lat])
      .addTo(map);

  } catch (error) {
    console.error('Error creating pin:', error);
  }
}