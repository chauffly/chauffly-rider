import { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MapView, { Marker, Polyline } from 'react-native-maps';

import { Text } from '@/components/common/text';
import { Button } from '@/components/common/button';
import { LocationInput } from '@/components/common/location-input';
import { QuickLocationChip } from '@/components/common/quick-location-chip';
import { LocationPermissionModal } from '@/components/common/location-permission-modal';
import { useTheme } from '@/context/theme-context';
import { useLocation, LocationCoordinates } from '@/context/location-context';
import { spacing, borderRadius } from '@/constants/spacing';
import { locationHistoryService, SavedLocation } from '@/services/location-history';
import LocationPinOutline from '@/components/svg/LocationPinOutline';
import CurrentLocationIcon from '@/components/svg/CurrentLocationIcon';
import LocationPinGreen from '@/components/svg/LocationPinGreen';
import LocationPinRed from '@/components/svg/LocationPinRed';
import ChevronLeft from '@/components/svg/ChevronLeft';
import PencilIcon from '@/components/svg/PencilIcon';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const DEFAULT_REGION = {
  latitude: 9.0579,
  longitude: 7.4951,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

type ViewMode = 'home' | 'set-location';

interface RouteStop {
  id: string;
  name: string;
  address: string;
  coordinates: LocationCoordinates;
}

interface Origin {
  name: string;
  address: string;
  coordinates: LocationCoordinates;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    viewMode?: string;
    originName?: string;
    originAddress?: string;
    originLat?: string;
    originLng?: string;
    destinations?: string;
  }>();
  const { colors } = useTheme();
  const {
    permissionStatus,
    currentLocation,
    requestPermission,
    hasAskedPermission,
    setHasAskedPermission,
    getCurrentLocation,
  } = useLocation();

  const mapRef = useRef<MapView>(null);

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [modalHeight, setModalHeight] = useState(0);

  // Route state for set-location view
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [destinations, setDestinations] = useState<RouteStop[]>([]);

  // Handle params from your-route screen
  useEffect(() => {
    if (params.viewMode === 'set-location' && params.originLat && params.originLng) {
      const newOrigin = {
        name: params.originName || 'Pickup Location',
        address: params.originAddress || '',
        coordinates: {
          latitude: parseFloat(params.originLat),
          longitude: parseFloat(params.originLng),
        },
      };

      const newDestinations = params.destinations ? JSON.parse(params.destinations) : [];

      // Always update when params change
      setOrigin(newOrigin);
      setDestinations(newDestinations);
      setViewMode('set-location');
    } else if (!params.viewMode || params.viewMode === 'home') {
      // Reset to home view if no viewMode or explicitly set to home
      setViewMode('home');
    }
  }, [params.viewMode, params.originLat, params.originLng, params.destinations]);

  // Debug current location
  useEffect(() => {
    console.log('📍 Current Location:', {
      currentLocation,
      hasLocation: !!currentLocation,
      coordinates: currentLocation?.coordinates,
      address: currentLocation?.address,
    });
  }, [currentLocation]);

  useEffect(() => {
    if (permissionStatus === 'undetermined' && !hasAskedPermission) {
      const timer = setTimeout(() => {
        setShowPermissionModal(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [permissionStatus, hasAskedPermission]);

  useEffect(() => {
    loadSavedLocations();
  }, []);

  useEffect(() => {
    if (currentLocation && mapRef.current && viewMode === 'home') {
      console.log('🗺️ Animating map to:', currentLocation.coordinates);
      mapRef.current.animateToRegion({
        latitude: currentLocation.coordinates.latitude,
        longitude: currentLocation.coordinates.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  }, [currentLocation, viewMode]);

  // Fit map to route in set-location mode
  useEffect(() => {
    if (viewMode === 'set-location' && mapRef.current && origin && destinations.length > 0) {
      const allPoints = [
        origin.coordinates,
        ...destinations.map(d => d.coordinates)
      ];

      const minLat = Math.min(...allPoints.map(p => p.latitude));
      const maxLat = Math.max(...allPoints.map(p => p.latitude));
      const minLng = Math.min(...allPoints.map(p => p.longitude));
      const maxLng = Math.max(...allPoints.map(p => p.longitude));

      const midLat = (minLat + maxLat) / 2;
      const midLng = (minLng + maxLng) / 2;
      const latDelta = (maxLat - minLat) * 1.8 + 0.02;
      const lngDelta = (maxLng - minLng) * 1.8 + 0.02;

      mapRef.current.animateToRegion({
        latitude: midLat,
        longitude: midLng,
        latitudeDelta: Math.max(latDelta, 0.05),
        longitudeDelta: Math.max(lngDelta, 0.05),
      }, 500);
    }
  }, [viewMode, origin, destinations]);

  const loadSavedLocations = async () => {
    const locations = await locationHistoryService.getSavedLocations();
    setSavedLocations(locations);
  };

  const handleGrantPermission = async () => {
    setShowPermissionModal(false);
    await requestPermission();
  };

  const handleMaybeLater = () => {
    setShowPermissionModal(false);
    setHasAskedPermission(true);
  };

  const handleEnterLocationPress = () => {
    router.push('/(tabs)/your-route');
  };

  const handleCurrentLocationPress = async () => {
    if (permissionStatus !== 'granted') {
      setShowPermissionModal(true);
      return;
    }
    await getCurrentLocation();
  };

  const handleQuickLocationPress = (location: SavedLocation) => {
    router.push({
      pathname: '/(tabs)/your-route',
      params: {
        destinationName: location.name,
        destinationAddress: location.address,
        destinationLat: location.coordinates.latitude.toString(),
        destinationLng: location.coordinates.longitude.toString(),
      },
    });
  };

  const handleBackToHome = () => {
    setViewMode('home');
    setOrigin(null);
    setDestinations([]);
  };

  const handleEditRoute = () => {
    // Go to your-route to edit, pass current route data
    router.push({
      pathname: '/(tabs)/your-route',
      params: {
        editMode: 'true',
        originName: origin?.name,
        originAddress: origin?.address,
        originLat: origin?.coordinates.latitude.toString(),
        originLng: origin?.coordinates.longitude.toString(),
        destinations: JSON.stringify(destinations),
        focusIndex: destinations.length > 0 ? (destinations.length - 1).toString() : '0',
      },
    });
  };

  const handleNextFromSetLocation = () => {
    // Navigate to ride options/booking screen
    console.log('Proceeding to next step with:', { origin, destinations });
    // TODO: Navigate to ride options
  };

  const quickLocations = [
    { key: 'home', translationKey: 'location.home' },
    { key: 'office', translationKey: 'location.office' },
    { key: 'apartment', translationKey: 'location.apartment' },
  ];

  const mapRegion = currentLocation
    ? {
      latitude: currentLocation.coordinates.latitude,
      longitude: currentLocation.coordinates.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }
    : DEFAULT_REGION;

  // Route coordinates for polyline
  const routeCoordinates = origin
    ? [origin.coordinates, ...destinations.map(d => d.coordinates)]
    : [];

  const renderHomeContent = () => (
    <>
      <Text
        variant="h3"
        font='medium'
        translationKey="location.where_to"
        style={styles.cardTitle}
      />

      <LocationInput
        type="origin"
        placeholderKey="location.enter_location"
        leftIcon={<LocationPinOutline size={20} color={colors.textSecondary} />}
        onPress={handleEnterLocationPress}
        isEditable={false}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickLocationsContainer}
      >
        {quickLocations.map((loc) => {
          const savedLoc = savedLocations.find(
            (s) => s.label === loc.key
          );
          return (
            <QuickLocationChip
              key={loc.key}
              translationKey={loc.translationKey}
              onPress={() => {
                if (savedLoc) {
                  handleQuickLocationPress(savedLoc);
                } else {
                  handleEnterLocationPress();
                }
              }}
            />
          );
        })}
        {savedLocations
          .filter((s) => !['home', 'office', 'apartment'].includes(s.label))
          .map((loc) => (
            <QuickLocationChip
              key={loc.id}
              label={loc.name}
              onPress={() => handleQuickLocationPress(loc)}
            />
          ))}
      </ScrollView>
    </>
  );

  const renderSetLocationContent = () => (
    <View style={styles.setLocationContainer}>
      <Text
        variant="h3"
        font="medium"
        translationKey="location.set_location"
        style={styles.setLocationTitle}
      />

      <View style={styles.locationsContainer}>
        {/* Origin */}
        <View style={styles.locationRow}>
          <View style={styles.locationDotContainer}>
            <LocationPinGreen />
            {destinations.length > 0 && (
              <View style={[styles.locationLine, { borderColor: colors.border }]} />
            )}
          </View>
          <View style={styles.locationInfo}>
            <Text variant="body" font="medium" numberOfLines={1}>
              {origin?.name || 'Select pickup'}
            </Text>
            <Text variant="caption" color="muted" numberOfLines={1}>
              {origin?.address || 'Tap to select location'}
            </Text>
          </View>
        </View>

        {/* Destinations */}
        {destinations.map((dest, index) => (
          <View key={dest.id} style={styles.locationRow}>
            <View style={styles.locationDotContainer}>
              <LocationPinRed />
              {index < destinations.length - 1 && (
                <View style={[styles.locationLine, { borderColor: colors.border }]} />
              )}
            </View>
            <View style={styles.locationInfo}>
              <Text variant="body" font="medium" numberOfLines={1}>
                {dest.name}
              </Text>
              <Text variant="caption" color="muted" numberOfLines={1}>
                {dest.address}
              </Text>
            </View>
            {/* Pencil icon only on the last destination */}
            {index === destinations.length - 1 && (
              <Pressable style={styles.editButton} onPress={handleEditRoute}>
                <PencilIcon size={24} color={colors.textSecondary} />
              </Pressable>
            )}
          </View>
        ))}
      </View>

      <Button
        translationKey="location.next"
        variant="primary"
        fullWidth
        onPress={handleNextFromSetLocation}
        disabled={!origin || destinations.length === 0}
        style={styles.nextButton}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={mapRegion}
          showsUserLocation={permissionStatus === 'granted'}
          showsMyLocationButton={false}
          showsCompass={false}
        >
          {/* Route Polyline - only in set-location mode */}
          {viewMode === 'set-location' && routeCoordinates.length >= 2 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor={colors.primary}
              strokeWidth={4}
              lineDashPattern={[0]}
            />
          )}

          {/* Origin Marker with user image - only in set-location mode */}
          {viewMode === 'set-location' && origin && (
            <Marker
              coordinate={origin.coordinates}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.userMarkerContainer}>
                <View style={[styles.userMarkerOuter, { borderColor: colors.primary }]}>
                  <Image
                    source={{ uri: 'https://i.pravatar.cc/100' }}
                    style={styles.userMarkerImage}
                  />
                </View>
                <View style={[styles.userMarkerPulse, { backgroundColor: colors.primary }]} />
              </View>
            </Marker>
          )}

          {/* Destination Markers - only in set-location mode */}
          {viewMode === 'set-location' && destinations.map((dest, index) => (
            <Marker
              key={dest.id}
              coordinate={dest.coordinates}
              anchor={{ x: 0.5, y: 1 }}
            >
              <View style={styles.destinationMarkerContainer}>
                <View style={[styles.destinationMarkerPin, { backgroundColor: '#E53935' }]}>
                  <Text style={styles.destinationMarkerText}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                <View style={[styles.destinationMarkerTail, { borderTopColor: '#E53935' }]} />
              </View>
            </Marker>
          ))}

          {/* Current location marker - only in home mode */}
          {viewMode === 'home' && currentLocation && (
            <Marker
              coordinate={currentLocation.coordinates}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={[styles.currentLocationMarker, { backgroundColor: colors.primary }]}>
                <View style={styles.currentLocationDot} />
              </View>
            </Marker>
          )}
        </MapView>

        {/* Back button - floats left, only in set-location mode */}
        {viewMode === 'set-location' && (
          <Pressable
            style={[
              styles.mapButton,
              styles.backButton,
              {
                backgroundColor: colors.surface,
                bottom: modalHeight + spacing.lg, // Position above modal with spacing
              },
            ]}
            onPress={handleBackToHome}
          >
            <ChevronLeft size={24} color={colors.textPrimary} />
          </Pressable>
        )}

        {/* Current location button - floats right */}
        <Pressable
          style={[
            styles.mapButton,
            styles.currentLocationButton,
            {
              backgroundColor: colors.surface,
              bottom: modalHeight + spacing.lg, // Position above modal with spacing
            },
          ]}
          onPress={handleCurrentLocationPress}
        >
          <CurrentLocationIcon size={24} color={colors.textPrimary} />
        </Pressable>
      </View>

      {/* Bottom Sheet Content */}
      <View
        style={[
          styles.bottomCard,
          {
            backgroundColor: colors.surface,
            paddingBottom: spacing.lg,
          },
        ]}
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
          setModalHeight(height);
        }}
      >
        {viewMode === 'home' && renderHomeContent()}
        {viewMode === 'set-location' && renderSetLocationContent()}
      </View>

      <LocationPermissionModal
        visible={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        onGrantPermission={handleGrantPermission}
        onMaybeLater={handleMaybeLater}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  currentLocationMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(194, 157, 89, 0.3)',
  },
  currentLocationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  mapButton: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    left: spacing.lg,
  },
  currentLocationButton: {
    right: spacing.lg,
  },
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    marginBottom: spacing.lg,
  },
  quickLocationsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  // Set location styles
  setLocationContainer: {
    flex: 1,
  },
  setLocationTitle: {
    marginBottom: spacing.lg,
  },
  locationsContainer: {
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationDotContainer: {
    width: 24,
    alignItems: 'center',
  },
  locationLine: {
    width: 2,
    height: 40,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  locationInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  editButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  nextButton: {
    marginTop: spacing.xxl,
  },
  // Map markers for set-location
  userMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerOuter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  userMarkerImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  userMarkerPulse: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.2,
    zIndex: -1,
  },
  destinationMarkerContainer: {
    alignItems: 'center',
  },
  destinationMarkerPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  destinationMarkerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  destinationMarkerTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
});
