import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCATION_PERMISSION_KEY = '@chauffly/location_permission';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface LocationAddress {
  coordinates: LocationCoordinates;
  address: string;
  name?: string;
  city?: string;
  region?: string;
  country?: string;
  postalCode?: string;
}

type PermissionStatus = 'undetermined' | 'granted' | 'denied';

interface LocationContextType {
  permissionStatus: PermissionStatus;
  isLoading: boolean;
  currentLocation: LocationAddress | null;
  requestPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<LocationAddress | null>;
  reverseGeocode: (coordinates: LocationCoordinates) => Promise<LocationAddress | null>;
  hasAskedPermission: boolean;
  setHasAskedPermission: (value: boolean) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

interface LocationProviderProps {
  children: ReactNode;
}

export function LocationProvider({ children }: LocationProviderProps) {
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('undetermined');
  const [isLoading, setIsLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<LocationAddress | null>(null);
  const [hasAskedPermission, setHasAskedPermissionState] = useState(false);
  const lastGeocodeRef = useRef<{
    key: string;
    time: number;
    address: LocationAddress | null;
  } | null>(null);

  useEffect(() => {
    checkPermissionStatus();
    loadHasAskedPermission();
  }, []);

  const loadHasAskedPermission = async () => {
    try {
      const value = await AsyncStorage.getItem(LOCATION_PERMISSION_KEY);
      if (value !== null) {
        setHasAskedPermissionState(JSON.parse(value));
      }
    } catch (error) {
      console.error('Error loading permission state:', error);
    }
  };

  const setHasAskedPermission = async (value: boolean) => {
    try {
      await AsyncStorage.setItem(LOCATION_PERMISSION_KEY, JSON.stringify(value));
      setHasAskedPermissionState(value);
    } catch (error) {
      console.error('Error saving permission state:', error);
    }
  };

  const checkPermissionStatus = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setPermissionStatus(status as PermissionStatus);

      if (status === 'granted') {
        await fetchCurrentLocation();
      }
    } catch (error) {
      console.error('Error checking permission status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status as PermissionStatus);
      await setHasAskedPermission(true);

      if (status === 'granted') {
        await fetchCurrentLocation();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coordinates: LocationCoordinates = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      const address = await reverseGeocode(coordinates);
      if (address) {
        setCurrentLocation(address);
      }
    } catch (error) {
      console.error('Error fetching current location:', error);
    }
  };

  const getCurrentLocation = useCallback(async (): Promise<LocationAddress | null> => {
    if (permissionStatus !== 'granted') {
      return null;
    }

    try {
      setIsLoading(true);
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coordinates: LocationCoordinates = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      const address = await reverseGeocode(coordinates);
      if (address) {
        setCurrentLocation(address);
        return address;
      }
      return null;
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [permissionStatus]);

  const reverseGeocode = async (coordinates: LocationCoordinates): Promise<LocationAddress | null> => {
    try {
      const key = `${coordinates.latitude.toFixed(5)},${coordinates.longitude.toFixed(5)}`;
      const now = Date.now();
      const last = lastGeocodeRef.current;
      if (last && last.key === key && now - last.time < 15000) {
        return last.address;
      }

      const results = await Location.reverseGeocodeAsync(coordinates);

      if (results.length > 0) {
        const result = results[0];
        const addressParts = [
          result.streetNumber,
          result.street,
          result.district,
        ].filter(Boolean);

        const address: LocationAddress = {
          coordinates,
          address: addressParts.join(' ') || result.name || 'Unknown location',
          name: result.name || undefined,
          city: result.city || undefined,
          region: result.region || undefined,
          country: result.country || undefined,
          postalCode: result.postalCode || undefined,
        };
        lastGeocodeRef.current = { key, time: now, address };
        return address;
      }
      return null;
    } catch (error) {
      lastGeocodeRef.current = {
        key: `${coordinates.latitude.toFixed(5)},${coordinates.longitude.toFixed(5)}`,
        time: Date.now(),
        address: lastGeocodeRef.current?.address || null,
      };
      console.error('Error reverse geocoding:', error);
      return null;
    }
  };

  return (
    <LocationContext.Provider
      value={{
        permissionStatus,
        isLoading,
        currentLocation,
        requestPermission,
        getCurrentLocation,
        reverseGeocode,
        hasAskedPermission,
        setHasAskedPermission,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
