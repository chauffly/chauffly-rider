import type { Region } from 'react-native-maps';

import type { LocationAddress } from '@/context/location-context';

// Absolute last-resort region, used only when the device has no live GPS fix yet
// (e.g. location permission not granted). The rider's live current location is
// always preferred so the map never defaults to a hard-coded place.
export const FALLBACK_MAP_REGION: Region = {
  latitude: 9.0579,
  longitude: 7.4951,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08
};

// Build a map Region centred on the rider's live current location, falling back
// to FALLBACK_MAP_REGION only when no location is available.
export function regionFromCurrentLocation(
  currentLocation: LocationAddress | null | undefined,
  delta = 0.02
): Region {
  if (!currentLocation) {
    return FALLBACK_MAP_REGION;
  }

  return {
    latitude: currentLocation.coordinates.latitude,
    longitude: currentLocation.coordinates.longitude,
    latitudeDelta: delta,
    longitudeDelta: delta
  };
}
