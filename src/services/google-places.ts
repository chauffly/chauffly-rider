import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationCoordinates } from '@/context/location-context';
import { env } from '@/config/env';

const GOOGLE_MAPS_API_KEY = env.googleMapsApiKey;

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
const AUTOCOMPLETE_CACHE_KEY = '@chauffly/places_autocomplete_cache';
const AUTOCOMPLETE_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const AUTOCOMPLETE_RETRY_COUNT = 2;
const RETRY_DELAY_MS = 400;

interface CachedPredictionEntry {
  predictions: PlacePrediction[];
  savedAt: number;
}

interface CachedPredictionStore {
  [query: string]: CachedPredictionEntry;
}

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const cacheQueryKey = (input: string) => input.trim().toLowerCase();

async function readAutocompleteCache(): Promise<CachedPredictionStore> {
  try {
    const raw = await AsyncStorage.getItem(AUTOCOMPLETE_CACHE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as CachedPredictionStore;
  } catch {
    return {};
  }
}

async function writeAutocompleteCache(store: CachedPredictionStore): Promise<void> {
  try {
    await AsyncStorage.setItem(AUTOCOMPLETE_CACHE_KEY, JSON.stringify(store));
  } catch {
    // Best-effort cache write.
  }
}

async function getCachedPredictions(input: string): Promise<PlacePrediction[]> {
  const cache = await readAutocompleteCache();
  const key = cacheQueryKey(input);
  const entry = cache[key];
  if (!entry) return [];

  if (Date.now() - entry.savedAt > AUTOCOMPLETE_CACHE_TTL_MS) {
    delete cache[key];
    await writeAutocompleteCache(cache);
    return [];
  }

  return entry.predictions;
}

async function setCachedPredictions(input: string, predictions: PlacePrediction[]): Promise<void> {
  const key = cacheQueryKey(input);
  const cache = await readAutocompleteCache();
  cache[key] = {
    predictions,
    savedAt: Date.now(),
  };
  await writeAutocompleteCache(cache);
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
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

    for (let attempt = 0; attempt < AUTOCOMPLETE_RETRY_COUNT; attempt += 1) {
      try {
        const response = await fetchWithTimeout(url, {
          headers: {
            Accept: 'application/json',
          },
        });

        const data = await response.json();

        if (data.status === 'OK' && data.predictions) {
          const predictions: PlacePrediction[] = data.predictions.map((prediction: any) => ({
            placeId: prediction.place_id,
            description: prediction.description,
            mainText:
              prediction.structured_formatting?.main_text ||
              prediction.description.split(',')[0],
            secondaryText:
              prediction.structured_formatting?.secondary_text ||
              prediction.description.split(',').slice(1).join(',').trim(),
            types: prediction.types || [],
          }));
          await setCachedPredictions(input, predictions);
          return predictions;
        }

        if (data.status === 'REQUEST_DENIED') {
          if (__DEV__) {
            console.error('Google API request denied:', data.error_message);
          }
          return [];
        }

        if (data.status === 'ZERO_RESULTS') {
          return [];
        }

        if (__DEV__) {
          console.warn('Unexpected Places status:', data.status, data.error_message || '');
        }
        return [];
      } catch (error: any) {
        const isLastAttempt = attempt === AUTOCOMPLETE_RETRY_COUNT - 1;
        if (!isLastAttempt) {
          await wait(RETRY_DELAY_MS * (attempt + 1));
          continue;
        }

        if (error.name === 'AbortError') {
        } else if (error instanceof TypeError) {
          if (__DEV__) {
            console.warn('Network issue while fetching place autocomplete');
          }
        } else if (__DEV__) {
          console.warn('Error fetching place autocomplete:', error);
        }
      }
    }

    const cachedPredictions = await getCachedPredictions(input);
    return cachedPredictions;
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
      if (__DEV__) {
        console.error('Error fetching place details:', error);
      }
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
      if (__DEV__) {
        console.error('Error geocoding address:', error);
      }
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
      if (__DEV__) {
        console.error('Error reverse geocoding:', error);
      }
      return null;
    }
  },
};
