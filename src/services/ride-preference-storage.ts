import AsyncStorage from '@react-native-async-storage/async-storage';

const RIDE_PREFERENCE_STORAGE_KEY = '@chauffly/ride-preference';
const getRidePreferenceStorageKey = (userKey: string) =>
  `${RIDE_PREFERENCE_STORAGE_KEY}:${userKey.trim().toLowerCase()}`;

export type RidePreferenceValue =
  | 't_18_20'
  | 't_20_22'
  | 't_22_24'
  | 't_24_26'
  | 'fm'
  | 'no_music'
  | 'jazz'
  | 'classical'
  | 'afrobeats'
  | 'connect_device'
  | 'quiet'
  | 'minimal'
  | 'open'
  | 'door_always'
  | 'door_pickup'
  | 'door_dropoff'
  | 'door_none'
  | 'scent_neutral'
  | 'citrus'
  | 'wood'
  | 'floral';

export interface RidePreferencePreset {
  cabinTemp: RidePreferenceValue;
  musicGenre: RidePreferenceValue;
  conversationMode: RidePreferenceValue;
  doorEtiquette: RidePreferenceValue;
  ambientScent: RidePreferenceValue;
}

export const defaultRidePreferencePreset: RidePreferencePreset = {
  cabinTemp: 't_22_24',
  musicGenre: 'fm',
  conversationMode: 'quiet',
  doorEtiquette: 'door_always',
  ambientScent: 'citrus'
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isString = (value: unknown): value is RidePreferenceValue => typeof value === 'string';

const normalizePreset = (value: unknown): RidePreferencePreset => {
  if (!isRecord(value)) {
    return defaultRidePreferencePreset;
  }

  return {
    cabinTemp: isString(value.cabinTemp) ? value.cabinTemp : defaultRidePreferencePreset.cabinTemp,
    musicGenre: isString(value.musicGenre) ? value.musicGenre : defaultRidePreferencePreset.musicGenre,
    conversationMode: isString(value.conversationMode)
      ? value.conversationMode
      : defaultRidePreferencePreset.conversationMode,
    doorEtiquette: isString(value.doorEtiquette)
      ? value.doorEtiquette
      : defaultRidePreferencePreset.doorEtiquette,
    ambientScent: isString(value.ambientScent)
      ? value.ambientScent
      : defaultRidePreferencePreset.ambientScent
  };
};

export const ridePreferenceStorage = {
  async get(userKey?: string | null): Promise<RidePreferencePreset> {
    const normalizedUserKey = userKey?.trim();
    if (!normalizedUserKey) {
      return defaultRidePreferencePreset;
    }

    try {
      const raw = await AsyncStorage.getItem(getRidePreferenceStorageKey(normalizedUserKey));
      if (!raw) {
        return defaultRidePreferencePreset;
      }

      return normalizePreset(JSON.parse(raw));
    } catch {
      return defaultRidePreferencePreset;
    }
  },

  async set(userKey: string | null | undefined, preset: RidePreferencePreset): Promise<void> {
    const normalizedUserKey = userKey?.trim();
    if (!normalizedUserKey) {
      return;
    }

    await AsyncStorage.setItem(getRidePreferenceStorageKey(normalizedUserKey), JSON.stringify(preset));
  },

  async clear(userKey?: string | null): Promise<void> {
    const normalizedUserKey = userKey?.trim();
    if (!normalizedUserKey) {
      return;
    }

    await AsyncStorage.removeItem(getRidePreferenceStorageKey(normalizedUserKey));
  }
};
