import { LocationCoordinates } from '@/context/location-context';
import { env } from '@/config/env';

const GOOGLE_MAPS_API_KEY = env.googleMapsApiKey;
const OSRM_BASE_URL = 'https://router.project-osrm.org';
const REQUEST_TIMEOUT = 20000;

interface RouteMetrics {
  distanceKm: number;
  durationMinutes: number;
}

interface RouteData extends RouteMetrics {
  pathCoordinates: LocationCoordinates[];
}

interface GoogleDirectionsResponse {
  status: string;
  error_message?: string;
  routes?: Array<{
    legs?: Array<{ distance?: { value: number }; duration?: { value: number } }>;
    overview_polyline?: {
      points?: string;
    };
  }>;
}

interface OsrmRouteResponse {
  code: string;
  message?: string;
  routes?: Array<{
    distance?: number;
    duration?: number;
    geometry?: string;
  }>;
}

const fetchWithTimeout = async (url: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
};

const sumLegs = (legs: Array<{ distance?: { value: number }; duration?: { value: number } }>) => {
  return legs.reduce(
    (acc, leg) => {
      const distance = leg.distance?.value ?? 0;
      const duration = leg.duration?.value ?? 0;
      return {
        distanceMeters: acc.distanceMeters + distance,
        durationSeconds: acc.durationSeconds + duration,
      };
    },
    { distanceMeters: 0, durationSeconds: 0 }
  );
};

const decodeGooglePolyline = (encoded: string): LocationCoordinates[] => {
  const coordinates: LocationCoordinates[] = [];
  let index = 0;
  let latitude = 0;
  let longitude = 0;

  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let byte = 0;

    do {
      byte = encoded.charCodeAt(index) - 63;
      index += 1;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLatitude = result & 1 ? ~(result >> 1) : result >> 1;
    latitude += deltaLatitude;

    result = 0;
    shift = 0;

    do {
      byte = encoded.charCodeAt(index) - 63;
      index += 1;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLongitude = result & 1 ? ~(result >> 1) : result >> 1;
    longitude += deltaLongitude;

    coordinates.push({
      latitude: latitude / 1e5,
      longitude: longitude / 1e5,
    });
  }

  return coordinates;
};

const parseRouteDataFromGoogle = (data: GoogleDirectionsResponse): RouteData => {
  if (data.status !== 'OK' || !data.routes?.[0]?.legs) {
    throw new Error(data.error_message || `Directions API failed (${data.status})`);
  }

  const route = data.routes[0];
  const legs = route.legs ?? [];
  const { distanceMeters, durationSeconds } = sumLegs(legs);
  const encodedPolyline = String(route?.overview_polyline?.points ?? '');
  const pathCoordinates = encodedPolyline ? decodeGooglePolyline(encodedPolyline) : [];

  return {
    distanceKm: Math.round((distanceMeters / 1000) * 10) / 10,
    durationMinutes: Math.max(1, Math.round(durationSeconds / 60)),
    pathCoordinates,
  };
};

const getRouteDataFromGoogle = async (
  origin: LocationCoordinates,
  destinations: LocationCoordinates[]
): Promise<RouteData> => {
  const waypoints = destinations.slice(0, -1);
  const destination = destinations[destinations.length - 1];

  const params = new URLSearchParams({
    origin: `${origin.latitude},${origin.longitude}`,
    destination: `${destination.latitude},${destination.longitude}`,
    key: GOOGLE_MAPS_API_KEY,
  });

  if (waypoints.length > 0) {
    params.append(
      'waypoints',
      waypoints.map((point) => `${point.latitude},${point.longitude}`).join('|')
    );
  }

  const url = `https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`;
  const response = await fetchWithTimeout(url);
  if (!response.ok) {
    throw new Error(`Directions API HTTP ${response.status}`);
  }

  const data = (await response.json()) as GoogleDirectionsResponse;
  return parseRouteDataFromGoogle(data);
};

const getRouteDataFromOsrm = async (
  origin: LocationCoordinates,
  destinations: LocationCoordinates[]
): Promise<RouteData> => {
  const points = [origin, ...destinations];
  const coordinatesPath = points
    .map((point) => `${point.longitude},${point.latitude}`)
    .join(';');

  const params = new URLSearchParams({
    overview: 'full',
    geometries: 'polyline'
  });

  const url = `${OSRM_BASE_URL}/route/v1/driving/${coordinatesPath}?${params.toString()}`;
  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new Error(`OSRM HTTP ${response.status}`);
  }

  const data = (await response.json()) as OsrmRouteResponse;

  if (data.code !== 'Ok' || !data.routes?.[0]) {
    throw new Error(data.message || `OSRM route failed (${data.code})`);
  }

  const route = data.routes[0];
  const pathCoordinates = route.geometry ? decodeGooglePolyline(route.geometry) : [];
  const distanceMeters = Number(route.distance ?? 0);
  const durationSeconds = Number(route.duration ?? 0);

  return {
    distanceKm: Math.round((distanceMeters / 1000) * 10) / 10,
    durationMinutes: Math.max(1, Math.round(durationSeconds / 60)),
    pathCoordinates,
  };
};

export const googleDirectionsService = {
  async getRouteData(
    origin: LocationCoordinates,
    destinations: LocationCoordinates[]
  ): Promise<RouteData> {
    if (!origin || destinations.length === 0) {
      return { distanceKm: 0, durationMinutes: 0, pathCoordinates: [] };
    }

    let googleError: Error | null = null;

    if (GOOGLE_MAPS_API_KEY) {
      try {
        return await getRouteDataFromGoogle(origin, destinations);
      } catch (error) {
        googleError = error instanceof Error ? error : new Error('Unknown Google Directions error');
      }
    }

    try {
      return await getRouteDataFromOsrm(origin, destinations);
    } catch (osrmError) {
      const osrmErrorObject =
        osrmError instanceof Error ? osrmError : new Error('Unknown OSRM route error');
      if (googleError) {
        throw new Error(
          `Google route failed: ${googleError.message}; OSRM fallback failed: ${osrmErrorObject.message}`
        );
      }
      throw osrmErrorObject;
    }
  },

  async getRouteMetrics(
    origin: LocationCoordinates,
    destinations: LocationCoordinates[]
  ): Promise<RouteMetrics> {
    const routeData = await this.getRouteData(origin, destinations);
    return {
      distanceKm: routeData.distanceKm,
      durationMinutes: routeData.durationMinutes,
    };
  },
};
