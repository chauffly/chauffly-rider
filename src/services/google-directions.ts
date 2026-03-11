import { LocationCoordinates } from '@/context/location-context';
import { env } from '@/config/env';

const GOOGLE_MAPS_API_KEY = env.googleMapsApiKey;
const REQUEST_TIMEOUT = 20000;

interface RouteMetrics {
  distanceKm: number;
  durationMinutes: number;
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

export const googleDirectionsService = {
  async getRouteMetrics(
    origin: LocationCoordinates,
    destinations: LocationCoordinates[]
  ): Promise<RouteMetrics> {
    if (!origin || destinations.length === 0) {
      return { distanceKm: 0, durationMinutes: 0 };
    }

    if (!GOOGLE_MAPS_API_KEY) {
      return { distanceKm: 0, durationMinutes: 0 };
    }

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
      throw new Error(`Directions API error: ${response.status}`);
    }
    const data = await response.json();

    if (data.status !== 'OK' || !data.routes?.[0]?.legs) {
      throw new Error(data.error_message || 'Directions API failed');
    }

    const { distanceMeters, durationSeconds } = sumLegs(data.routes[0].legs);
    return {
      distanceKm: Math.round((distanceMeters / 1000) * 10) / 10,
      durationMinutes: Math.max(1, Math.round(durationSeconds / 60)),
    };
  },
};
