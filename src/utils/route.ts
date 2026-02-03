import { LocationCoordinates } from '@/context/location-context';

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
