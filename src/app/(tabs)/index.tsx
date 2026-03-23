import { useState, useEffect, useRef, useMemo } from 'react';
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MapView, { Marker, Polyline } from 'react-native-maps';

import { Ionicons } from "@expo/vector-icons";
import { LocationPermissionModal } from '@/components/common/location-permission-modal';
import { HomeContent } from "@/components/home/home-content";
import { MapControls } from "@/components/home/map-controls";
import { RouteSummaryCard } from "@/components/home/route-summary-card";
import { SetLocationContent } from "@/components/home/set-location-content";
import { RideOptionsContent } from "@/components/home/ride-options-content";
import { CorporateDashboardContent } from '@/components/home/corporate-dashboard-content';
import { Origin, RouteStop, RideOption } from "@/components/home/types";
import { useTheme } from '@/context/theme-context';
import { useLocation } from "@/context/location-context";
import { spacing, borderRadius } from '@/constants/spacing';
import { rideOptions } from '@/constants/ride-options';
import { useCurrentUser, useRideOptions } from '@/api-client';
import { accountRoleService, type AccountRole } from '@/services/account-role';
import {
  locationHistoryService,
  SavedLocation,
} from "@/services/location-history";
import { estimateDurationMinutes, getRouteDistanceKm } from '@/utils/route';
import { googleDirectionsService } from '@/services/google-directions';
import { asArray, asRecord, asString } from '@/utils/api-helpers';
import { formatNairaAmount } from '@/utils/currency';

const DEFAULT_REGION = {
  latitude: 9.0579,
  longitude: 7.4951,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

type ViewMode = "home" | "set-location" | "ride-options";

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
  const { data: currentUserData } = useCurrentUser();
  const { data: rideOptionsData } = useRideOptions();

  const mapRef = useRef<MapView>(null);
  const [accountRole, setAccountRole] = useState<AccountRole>('rider');
  const isCorporate = accountRole === 'corporate';
  const pickupPlaceholder = 'Pickup location';
  const apiUser = asRecord(currentUserData);

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>("home");
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [modalHeight, setModalHeight] = useState(0);
  const [selectedRideId, setSelectedRideId] = useState('');
  const [showAllDestinations, setShowAllDestinations] = useState(false);
  const [routeDistanceKm, setRouteDistanceKm] = useState(0);
  const [routeDurationMinutes, setRouteDurationMinutes] = useState(0);
  const [routeMetricsLoading, setRouteMetricsLoading] = useState(false);
  const [routeMetricsError, setRouteMetricsError] = useState<string | null>(null);
  const [roadPathCoordinates, setRoadPathCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);

  // Route state for set-location view
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [destinations, setDestinations] = useState<RouteStop[]>([]);

  useEffect(() => {
    const loadRole = async () => {
      const role = await accountRoleService.getRole();
      setAccountRole(role);
    };

    void loadRole();
  }, []);

  useEffect(() => {
    const role = asString(apiUser.role, '');
    if (!role) {
      return;
    }
    const nextRole: AccountRole = role === 'corporate_admin' ? 'corporate' : 'rider';
    setAccountRole(nextRole);
    void accountRoleService.setRole(nextRole);
  }, [apiUser]);

  // Handle params from your-route screen
  useEffect(() => {
    if (
      params.viewMode === "set-location" &&
      params.originLat &&
      params.originLng
    ) {
      const newOrigin = {
        name: params.originName || pickupPlaceholder,
        address: params.originAddress || "",
        coordinates: {
          latitude: parseFloat(params.originLat),
          longitude: parseFloat(params.originLng),
        },
      };

      const newDestinations = params.destinations
        ? JSON.parse(params.destinations)
        : [];

      // Always update when params change
      setOrigin(newOrigin);
      setDestinations(newDestinations);
      setViewMode("set-location");
    } else if (!params.viewMode || params.viewMode === "home") {
      // Reset to home view if no viewMode or explicitly set to home
      setViewMode("home");
    }
  }, [
    params.viewMode,
    params.originName,
    params.originAddress,
    params.originLat,
    params.originLng,
    params.destinations,
    pickupPlaceholder,
  ]);

  useEffect(() => {
    if (permissionStatus === "undetermined" && !hasAskedPermission) {
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
    if (permissionStatus === "granted" && !currentLocation) {
      getCurrentLocation();
    }
  }, [permissionStatus, currentLocation, getCurrentLocation]);

  useEffect(() => {
    if (isMapReady && currentLocation && mapRef.current && viewMode === "home") {
      mapRef.current.animateToRegion(
        {
          latitude: currentLocation.coordinates.latitude,
          longitude: currentLocation.coordinates.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000,
      );
    }
  }, [isMapReady, currentLocation, viewMode]);

  // Fit map to route in set-location or ride-options mode
  useEffect(() => {
    if (
      viewMode !== "home" &&
      mapRef.current &&
      origin &&
      destinations.length > 0
    ) {
      const allPoints = [
        origin.coordinates,
        ...destinations.map((d) => d.coordinates),
      ];

      const minLat = Math.min(...allPoints.map((p) => p.latitude));
      const maxLat = Math.max(...allPoints.map((p) => p.latitude));
      const minLng = Math.min(...allPoints.map((p) => p.longitude));
      const maxLng = Math.max(...allPoints.map((p) => p.longitude));

      const midLat = (minLat + maxLat) / 2;
      const midLng = (minLng + maxLng) / 2;
      const latDelta = (maxLat - minLat) * 1.8 + 0.02;
      const lngDelta = (maxLng - minLng) * 1.8 + 0.02;

      mapRef.current.animateToRegion(
        {
          latitude: midLat,
          longitude: midLng,
          latitudeDelta: Math.max(latDelta, 0.05),
          longitudeDelta: Math.max(lngDelta, 0.05),
        },
        500,
      );
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
    router.push("/your-route");
  };

  const handleCurrentLocationPress = async () => {
    if (permissionStatus !== "granted") {
      setShowPermissionModal(true);
      return;
    }
    await getCurrentLocation();
  };

  const handleQuickLocationPress = (location: SavedLocation) => {
    router.push({
      pathname: "/your-route",
      params: {
        destinationName: location.name,
        destinationAddress: location.address,
        destinationLat: location.coordinates.latitude.toString(),
        destinationLng: location.coordinates.longitude.toString(),
      },
    });
  };

  const handleBackToHome = () => {
    setViewMode("home");
    setOrigin(null);
    setDestinations([]);
  };

  const handleBackToSetLocation = () => {
    setViewMode("set-location");
  };

  const handleEditRoute = () => {
    // Go to your-route to edit, pass current route data
    router.push({
      pathname: "/your-route",
      params: {
        editMode: "true",
        originName: origin?.name,
        originAddress: origin?.address,
        originLat: origin?.coordinates.latitude.toString(),
        originLng: origin?.coordinates.longitude.toString(),
        destinations: JSON.stringify(destinations),
        focusIndex:
          destinations.length > 0 ? (destinations.length - 1).toString() : "0",
      },
    });
  };

  const handleNextFromSetLocation = () => {
    setViewMode("ride-options");
  };

  const handleProceedInstantRide = () => {
    if (!origin || destinations.length === 0) {
      return;
    }
    router.push({
      pathname: "/booking/ride-summary",
      params: {
        originName: origin.name,
        originAddress: origin.address,
        originLat: origin.coordinates.latitude.toString(),
        originLng: origin.coordinates.longitude.toString(),
        destinations: JSON.stringify(destinations),
        selectedRideId: activeSelectedRideId,
        selectedRideTier: activeSelectedRideTier,
        bookingType: "instant",
        estimatedDurationMinutes: (routeDurationMinutes || estimatedDurationMinutes).toString(),
        distanceKm: (routeDistanceKm || totalDistanceKm).toString(),
      },
    });
  };

  const handleScheduleRide = () => {
    if (!origin || destinations.length === 0) {
      return;
    }
    router.push({
      pathname: "/booking/select-pickup-time",
      params: {
        originName: origin.name,
        originAddress: origin.address,
        originLat: origin.coordinates.latitude.toString(),
        originLng: origin.coordinates.longitude.toString(),
        destinations: JSON.stringify(destinations),
        selectedRideId: activeSelectedRideId,
        selectedRideTier: activeSelectedRideTier,
        bookingType: "scheduled",
        estimatedDurationMinutes: (routeDurationMinutes || estimatedDurationMinutes).toString(),
        distanceKm: (routeDistanceKm || totalDistanceKm).toString(),
      },
    });
  };

  const quickLocations = [
    { key: "home", translationKey: "location.home" },
    { key: "office", translationKey: "location.office" },
    { key: "apartment", translationKey: "location.apartment" },
  ];

  const rideOptionsList = useMemo<(RideOption & { tier: string })[]>(() => {
    const rideOptionsPayload = asRecord(rideOptionsData);
    const apiOptions = asArray<Record<string, unknown>>(rideOptionsPayload.items).length
      ? asArray<Record<string, unknown>>(rideOptionsPayload.items)
      : asArray<Record<string, unknown>>(rideOptionsData);
    if (apiOptions.length === 0) {
      return rideOptions.map((option) => ({
        ...option,
        tier: option.id
      }));
    }

    const imageByTier: Record<string, number> = {
      go: require('../../../assets/images/ride-options/go.png'),
      plus: require('../../../assets/images/ride-options/plus.png'),
      luxe: require('../../../assets/images/ride-options/luxe.png'),
      black: require('../../../assets/images/ride-options/black.png')
    };

    return apiOptions.map((option) => {
      const tier = asString(option.tier, 'go');
      const normalizedTier =
        tier === 'go' || tier === 'plus' || tier === 'luxe' || tier === 'black'
          ? tier
          : 'go';
      const baseFare = option.baseFare ?? option.base_fare;

      return {
        id: asString(option.id, normalizedTier),
        nameKey: `booking.ride_option_${normalizedTier}`,
        subtitleKey: `booking.ride_option_subtitle_${normalizedTier}`,
        priceKey: `booking.ride_option_price_${normalizedTier}`,
        priceLabel: baseFare !== undefined ? formatNairaAmount(baseFare, { unit: 'naira' }) : undefined,
        image: imageByTier[normalizedTier] ?? imageByTier.go,
        tier: normalizedTier
      };
    });
  }, [rideOptionsData]);

  useEffect(() => {
    if (rideOptionsList.length === 0) {
      return;
    }

    if (!rideOptionsList.some((option) => option.id === selectedRideId)) {
      setSelectedRideId(rideOptionsList[0].id);
    }
  }, [rideOptionsList, selectedRideId]);

  const activeSelectedRide =
    rideOptionsList.find((option) => option.id === selectedRideId) ?? rideOptionsList[0];
  const activeSelectedRideId = activeSelectedRide?.id ?? '';
  const activeSelectedRideTier = activeSelectedRide?.tier ?? 'go';

  const mapRegion = currentLocation
    ? {
        latitude: currentLocation.coordinates.latitude,
        longitude: currentLocation.coordinates.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : DEFAULT_REGION;

  // Fallback straight-line route coordinates for polyline
  const routeCoordinates = useMemo(
    () => (origin ? [origin.coordinates, ...destinations.map((d) => d.coordinates)] : []),
    [origin, destinations]
  );

  const routeCoordinatesToDraw =
    roadPathCoordinates.length >= 2 ? roadPathCoordinates : routeCoordinates;

  const totalDistanceKm = routeCoordinates.length >= 2 ? getRouteDistanceKm(routeCoordinates) : 0;
  const estimatedDurationMinutes = estimateDurationMinutes(totalDistanceKm);

  useEffect(() => {
    const loadRouteMetrics = async () => {
      if (!origin || destinations.length === 0) {
        setRouteDistanceKm(0);
        setRouteDurationMinutes(0);
        setRouteMetricsLoading(false);
        setRouteMetricsError(null);
        setRoadPathCoordinates([]);
        return;
      }

      setRouteMetricsLoading(true);
      setRouteMetricsError(null);

      try {
        const routeData = await googleDirectionsService.getRouteData(
          origin.coordinates,
          destinations.map((stop) => stop.coordinates)
        );
        setRouteDistanceKm(routeData.distanceKm);
        setRouteDurationMinutes(routeData.durationMinutes);
        setRoadPathCoordinates(routeData.pathCoordinates);
      } catch (error) {
        setRouteDistanceKm(totalDistanceKm);
        setRouteDurationMinutes(estimatedDurationMinutes);
        setRouteMetricsError('fallback');
        setRoadPathCoordinates([]);
        if (__DEV__) {
          console.warn('[route] falling back to straight path', error);
        }
      } finally {
        setRouteMetricsLoading(false);
      }
    };

    void loadRouteMetrics();
  }, [origin, destinations, totalDistanceKm, estimatedDurationMinutes]);

  const renderHomeContent = () => (
    <HomeContent
      quickLocations={quickLocations}
      savedLocations={savedLocations}
      onEnterLocationPress={handleEnterLocationPress}
      onQuickLocationPress={handleQuickLocationPress}
    />
  );

  const renderSetLocationContent = () => (
    <SetLocationContent
      origin={origin}
      destinations={destinations}
      onEditRoute={handleEditRoute}
      onNext={handleNextFromSetLocation}
    />
  );

  const renderRideOptionsContent = () => (
    <RideOptionsContent
      rideOptions={rideOptionsList}
      selectedRideId={activeSelectedRideId}
      onSelectRide={setSelectedRideId}
      onProceed={handleProceedInstantRide}
      onSchedule={handleScheduleRide}
      etaMinutes={routeDurationMinutes || estimatedDurationMinutes || undefined}
      defaultEtaMinutes={3}
      isLoading={routeMetricsLoading}
      hasError={!!routeMetricsError}
    />
  );

  if (isCorporate) {
    return <CorporateDashboardContent />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={mapRegion}
          onMapReady={() => setIsMapReady(true)}
          mapType="standard"
          showsBuildings
          showsIndoors
          showsPointsOfInterest
          showsUserLocation={permissionStatus === "granted"}
          showsMyLocationButton={false}
          showsCompass={false}
        >
          {/* Route Polyline - only in set-location mode */}
          {viewMode !== "home" && routeCoordinatesToDraw.length >= 2 && (
            <Polyline
              coordinates={routeCoordinatesToDraw}
              strokeColor={colors.primary}
              strokeWidth={4}
              lineDashPattern={[0]}
            />
          )}

          {/* Origin Marker with user image - only in set-location mode */}
          {viewMode !== "home" && origin && (
            <Marker coordinate={origin.coordinates} anchor={{ x: 0.5, y: 0.5 }}>
              <View style={styles.userMarkerContainer}>
                <View
                  style={[
                    styles.userMarkerOuter,
                    { borderColor: colors.primary },
                  ]}
                >
                  <Ionicons name="person" size={22} color={colors.primary} />
                </View>
                <View
                  style={[
                    styles.userMarkerPulse,
                    { backgroundColor: colors.primary },
                  ]}
                />
              </View>
            </Marker>
          )}

          {/* Destination Markers - only in set-location mode */}
          {viewMode !== "home" &&
            destinations.map((dest) => (
              <Marker
                key={dest.id}
                coordinate={dest.coordinates}
                anchor={{ x: 0.5, y: 1 }}
              >
                <View style={styles.destinationMarkerContainer}>
                  <Ionicons name="location" size={34} color="#E53935" />
                </View>
              </Marker>
            ))}

          {/* Current location marker - only in home mode */}
          {viewMode === "home" && currentLocation && (
            <Marker
              coordinate={currentLocation.coordinates}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View
                style={[
                  styles.currentLocationMarker,
                  { backgroundColor: colors.primary },
                ]}
              >
                <View style={styles.currentLocationDot} />
              </View>
            </Marker>
          )}
        </MapView>

        {viewMode === "home" && (
          <Pressable
            style={[
              styles.notificationButton,
              {
                backgroundColor: colors.surface,
                top: insets.top + spacing.md,
              },
            ]}
            onPress={() => router.push("/account/notification-list")}
          >
            <Ionicons
              name="notifications-outline"
              size={22}
              color={colors.textPrimary}
            />
          </Pressable>
        )}

        {viewMode === "ride-options" && (
          <RouteSummaryCard
            origin={origin}
            destinations={destinations}
            showAllDestinations={showAllDestinations}
            onToggleDestinations={() => setShowAllDestinations((prev) => !prev)}
            topOffset={insets.top + spacing.md}
          />
        )}

        <MapControls
          showBack={viewMode !== "home"}
          onBack={
            viewMode === "ride-options"
              ? handleBackToSetLocation
              : handleBackToHome
          }
          onCurrentLocation={handleCurrentLocationPress}
          bottomOffset={modalHeight + spacing.lg}
        />
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
        {viewMode === "home" && renderHomeContent()}
        {viewMode === "set-location" && renderSetLocationContent()}
        {viewMode === "ride-options" && renderRideOptionsContent()}
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
  notificationButton: {
    position: "absolute",
    right: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  currentLocationMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(194, 157, 89, 0.3)",
  },
  currentLocationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
  bottomCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  // Map markers for set-location
  userMarkerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  userMarkerOuter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  userMarkerPulse: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.2,
    zIndex: -1,
  },
  destinationMarkerContainer: {
    alignItems: "center",
  },
});



/**
 * 
 * 
 * 
 *  Tesla Model Y
    Mercedes-Benz E350 (2019)
    BMW 530i
    Hyundai Sonata (2020)
    Land Cruiser (2019, 2020)

 */
