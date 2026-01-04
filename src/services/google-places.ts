import { LocationCoordinates } from '@/context/location-context';

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY';

export interface PlacePrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
  types: string[];
}

export interface PlaceDetails {
  placeId: string;
  name: string;
  address: string;
  coordinates: LocationCoordinates;
  formattedAddress?: string;
  types?: string[];
}

let sessionToken: string | null = null;

function generateSessionToken(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getSessionToken(): string {
  if (!sessionToken) {
    sessionToken = generateSessionToken();
  }
  return sessionToken;
}

function resetSessionToken(): void {
  sessionToken = null;
}

const REQUEST_TIMEOUT = 30000; // 30 seconds

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  console.log('🚀 Starting fetch request...');
  const startTime = Date.now();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.log('⏰ Timeout triggered after', REQUEST_TIMEOUT, 'ms');
    controller.abort();
  }, REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    console.log('✅ Fetch completed in', Date.now() - startTime, 'ms');
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.log('❌ Fetch error after', Date.now() - startTime, 'ms:', error.name, error.message);
    throw error;
  }
}

export const googlePlacesService = {
  async autocomplete(
    input: string,
    location?: LocationCoordinates,
    radius?: number
  ): Promise<PlacePrediction[]> {
    if (!input || input.length < 2) {
      return [];
    }

    try {
      const params = new URLSearchParams({
        input,
        key: GOOGLE_MAPS_API_KEY,
        sessiontoken: getSessionToken(),
        components: 'country:ng',
      });

      if (location) {
        params.append('location', `${location.latitude},${location.longitude}`);
        params.append('radius', (radius || 50000).toString());
      }

      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`;
      console.log('🌐 Calling Google Places Autocomplete API...');
      console.log('🔑 API Key present:', !!GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== 'YOUR_API_KEY');
      console.log('📍 Search input:', input);

      const response = await fetchWithTimeout(url, {
        headers: {
          'Accept': 'application/json',
        }
      });

      console.log('📡 Response status code:', response.status);
      const data = await response.json();

      console.log('📡 Places API Response Status:', data.status);
      console.log('📡 Full response:', JSON.stringify(data, null, 2));

      if (data.status === 'OK' && data.predictions) {
        return data.predictions.map((prediction: any) => ({
          placeId: prediction.place_id,
          description: prediction.description,
          mainText: prediction.structured_formatting?.main_text || prediction.description.split(',')[0],
          secondaryText: prediction.structured_formatting?.secondary_text || prediction.description.split(',').slice(1).join(',').trim(),
          types: prediction.types || [],
        }));
      }

      if (data.status === 'REQUEST_DENIED') {
        console.error('❌ Google API - REQUEST_DENIED:', data.error_message);
      }

      if (data.status === 'ZERO_RESULTS') {
        console.log('⚠️ No results found for:', input);
      }

      return [];
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('❌ Request timeout - check your internet connection');
      } else {
        console.error('❌ Error fetching place autocomplete:', error);
      }
      return [];
    }
  },

  async getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    try {
      const params = new URLSearchParams({
        place_id: placeId,
        key: GOOGLE_MAPS_API_KEY,
        sessiontoken: getSessionToken(),
        fields: 'place_id,name,formatted_address,geometry,types',
      });

      const url = `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`;
      const response = await fetchWithTimeout(url);

      const data = await response.json();

      resetSessionToken();

      if (data.status === 'OK' && data.result) {
        const result = data.result;
        return {
          placeId: result.place_id,
          name: result.name,
          address: result.formatted_address,
          coordinates: {
            latitude: result.geometry.location.lat,
            longitude: result.geometry.location.lng,
          },
          formattedAddress: result.formatted_address,
          types: result.types,
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching place details:', error);
      return null;
    }
  },

  async geocode(address: string): Promise<LocationCoordinates | null> {
    try {
      const params = new URLSearchParams({
        address,
        key: GOOGLE_MAPS_API_KEY,
      });

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`
      );

      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          latitude: location.lat,
          longitude: location.lng,
        };
      }

      return null;
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  },

  async reverseGeocode(coordinates: LocationCoordinates): Promise<string | null> {
    try {
      const params = new URLSearchParams({
        latlng: `${coordinates.latitude},${coordinates.longitude}`,
        key: GOOGLE_MAPS_API_KEY,
      });

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`
      );

      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        return data.results[0].formatted_address;
      }

      return null;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  },
};
