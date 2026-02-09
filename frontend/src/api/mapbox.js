const MAPBOX_TOKEN = import.meta.env.VITE_PUBLIC_MAPBOX_TOKEN;
import { abbreviateLocation } from "../utils/locationHelper";

export const fetchLocation = async (lng, lat) => {
    const coordinates = `${lng},${lat}`; 

    try {
        const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates}.json?access_token=${MAPBOX_TOKEN}`
        );
        const data = await response.json();

        // Get the main place name/address from the results
        if (data.features && data.features.length > 0) {
            const placeName = data.features[0].place_name; 
            const location = abbreviateLocation(placeName);
            console.log("Fetched location:", location);
            return location;
        } else {
            return 'No location found';
        }
    } catch (error) {
        console.error("Error during reverse geocoding:", error);
    }
}