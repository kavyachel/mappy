import { abbreviateLocation } from '../utils/locationHelper'

const MAPBOX_TOKEN = import.meta.env.VITE_PUBLIC_MAPBOX_TOKEN

export const fetchLocation = async (lng, lat) => {
  const coordinates = `${lng},${lat}`

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates}.json?access_token=${MAPBOX_TOKEN}`
    )
    const data = await response.json()

    if (data.features && data.features.length > 0) {
      return abbreviateLocation(data.features[0].place_name)
    }

    return null
  } catch {
    return null
  }
}
