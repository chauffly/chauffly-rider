import { LocationCoordinates } from '@/context/location-context';

export const fetchDrivingPolyline = async (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  apiKey: string
): Promise<{ latitude: number; longitude: number }[]> => {
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&mode=driving&key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = (await res.json()) as {
    status: string;
    routes?: Array<{ overview_polyline?: { points?: string } }>;
  };
  if (data.status !== 'OK' || !data.routes?.[0]?.overview_polyline?.points) return [];
  return decodePolyline(data.routes[0].overview_polyline.points);
};

export const decodePolyline = (encoded: string): { latitude: number; longitude: number }[] => {
  const result: { latitude: number; longitude: number }[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  while (index < encoded.length) {
    let shift = 0;
    let b = 0;
    let byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      b |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += b & 1 ? ~(b >> 1) : b >> 1;
    shift = 0;
    b = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      b |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += b & 1 ? ~(b >> 1) : b >> 1;
    result.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return result;
};

const EARTH_RADIUS_KM = 6371;

const toRadians = (value: number) => (value * Math.PI) / 180;

export const getDistanceKm = (from: LocationCoordinates, to: LocationCoordinates) => {
  const latDelta = toRadians(to.latitude - from.latitude);
  const lngDelta = toRadians(to.longitude - from.longitude);

  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);

  const a =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(lngDelta / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
};

export const getRouteDistanceKm = (points: LocationCoordinates[]) => {
  if (points.length < 2) {
    return 0;
  }

  return points.reduce((total, point, index) => {
    if (index === 0) return total;
    return total + getDistanceKm(points[index - 1], point);
  }, 0);
};

export const estimateDurationMinutes = (distanceKm: number, avgSpeedKmh = 32) => {
  if (!distanceKm || distanceKm <= 0) {
    return 0;
  }
  const travelMinutes = (distanceKm / avgSpeedKmh) * 60;
  const bufferMinutes = 5;
  return Math.max(5, Math.round(travelMinutes + bufferMinutes));
};
