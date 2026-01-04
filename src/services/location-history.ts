import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationCoordinates } from '@/context/location-context';

const LOCATION_HISTORY_KEY = '@chauffly/location_history';
const MAX_HISTORY_ITEMS = 10;

export interface LocationHistoryItem {
  id: string;
  name: string;
  address: string;
  coordinates: LocationCoordinates;
  distance?: number;
  timestamp: number;
  isPinned?: boolean;
}

export interface SavedLocation {
  id: string;
  name: string;
  label: 'home' | 'office' | 'apartment' | 'other';
  address: string;
  coordinates: LocationCoordinates;
}

const SAVED_LOCATIONS_KEY = '@chauffly/saved_locations';

export const locationHistoryService = {
  async getHistory(): Promise<LocationHistoryItem[]> {
    try {
      const data = await AsyncStorage.getItem(LOCATION_HISTORY_KEY);
      if (data) {
        const history = JSON.parse(data);
        // Sort: pinned items first, then by timestamp (most recent first)
        return history.sort((a: LocationHistoryItem, b: LocationHistoryItem) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return b.timestamp - a.timestamp;
        });
      }
      return [];
    } catch (error) {
      console.error('Error getting location history:', error);
      return [];
    }
  },

  async addToHistory(item: Omit<LocationHistoryItem, 'id' | 'timestamp'>): Promise<void> {
    try {
      const history = await this.getHistory();

      const existingIndex = history.findIndex(
        (h) =>
          h.coordinates.latitude === item.coordinates.latitude &&
          h.coordinates.longitude === item.coordinates.longitude
      );

      if (existingIndex !== -1) {
        history.splice(existingIndex, 1);
      }

      const newItem: LocationHistoryItem = {
        ...item,
        id: `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      };

      const updatedHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
      await AsyncStorage.setItem(LOCATION_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error adding to location history:', error);
    }
  },

  async removeFromHistory(id: string): Promise<void> {
    try {
      const history = await this.getHistory();
      const updatedHistory = history.filter((item) => item.id !== id);
      await AsyncStorage.setItem(LOCATION_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error removing from location history:', error);
    }
  },

  async togglePin(id: string): Promise<void> {
    try {
      const history = await this.getHistory();
      const updatedHistory = history.map((item) =>
        item.id === id ? { ...item, isPinned: !item.isPinned } : item
      );
      await AsyncStorage.setItem(LOCATION_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  },

  async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(LOCATION_HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing location history:', error);
    }
  },

  async getSavedLocations(): Promise<SavedLocation[]> {
    try {
      const data = await AsyncStorage.getItem(SAVED_LOCATIONS_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error('Error getting saved locations:', error);
      return [];
    }
  },

  async saveLocation(location: Omit<SavedLocation, 'id'>): Promise<void> {
    try {
      const saved = await this.getSavedLocations();

      const existingIndex = saved.findIndex((s) => s.label === location.label);

      const newLocation: SavedLocation = {
        ...location,
        id: `saved_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      let updatedSaved: SavedLocation[];
      if (existingIndex !== -1) {
        updatedSaved = [...saved];
        updatedSaved[existingIndex] = newLocation;
      } else {
        updatedSaved = [...saved, newLocation];
      }

      await AsyncStorage.setItem(SAVED_LOCATIONS_KEY, JSON.stringify(updatedSaved));
    } catch (error) {
      console.error('Error saving location:', error);
    }
  },

  async removeSavedLocation(id: string): Promise<void> {
    try {
      const saved = await this.getSavedLocations();
      const updatedSaved = saved.filter((item) => item.id !== id);
      await AsyncStorage.setItem(SAVED_LOCATIONS_KEY, JSON.stringify(updatedSaved));
    } catch (error) {
      console.error('Error removing saved location:', error);
    }
  },

  calculateDistance(
    from: LocationCoordinates,
    to: LocationCoordinates
  ): number {
    const R = 6371;
    const dLat = ((to.latitude - from.latitude) * Math.PI) / 180;
    const dLon = ((to.longitude - from.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((from.latitude * Math.PI) / 180) *
        Math.cos((to.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  formatDistance(distanceKm: number): string {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)} m`;
    }
    return `${distanceKm.toFixed(1)} km`;
  },
};
