import { useEffect, useMemo, useRef, useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker, Polyline, type Region } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useBookingById, useBookingUpdates, useDriverLocation as useLiveDriverLocation } from '@/api-client';
import { JourneyHomeButton } from '@/components/common/journey-home-button';
import { MapUnavailable } from '@/components/common/map-unavailable';
import { PaymentModal } from '@/components/booking/payment-modal';
import { Text } from '@/components/common/text';
import { spacing } from '@/constants/spacing';
import { useLocation } from '@/context/location-context';
import { useTheme } from '@/context/theme-context';
import { socketClient } from '@/runtime/rider-runtime';
import { asArray, asNumber, asRecord, asString } from '@/utils/api-helpers';
import { hasConfiguredAndroidGoogleMapsKey } from '@/utils/google-maps';
import { FALLBACK_MAP_REGION, regionFromCurrentLocation } from '@/utils/map-region';
import { decodePolyline } from '@/utils/route';

type ArrivedFare = { tripFare: number; surgeFee: number; tax: number; total: number; currency: string };

export default function HeadingDestinationScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    bookingId?: string;
  }>();
  const bookingId = params.bookingId ?? '';
  const { currentLocation } = useLocation();
  const mapRef = useRef<MapView>(null);
  const hasInitialFitRef = useRef(false);
  const hasCenteredOnUserRef = useRef(false);

  // Default the map to the rider's live location, never a hard-coded place.
  const initialRegion = useMemo(() => regionFromCurrentLocation(currentLocation), [currentLocation]);

  const { data: bookingData } = useBookingById(bookingId, {
    enabled: Boolean(bookingId),
    refetchInterval: 5000
  });
  const driverLocation = useLiveDriverLocation(socketClient);

  const [arrivedFare, setArrivedFare] = useState<ArrivedFare | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [userInteracting, setUserInteracting] = useState(false);

  useBookingUpdates(socketClient, {
    onStatusChanged: (payload) => {
      if (payload.bookingId !== bookingId) {
        return;
      }

      if (payload.status === 'completed' || payload.status === 'pending_payment') {
        // Keep the rider on the payment/heading flow until the payment modal confirms completion.
        return;
      }
    },
    onArrivedAtDestination: (payload) => {
      if (payload.bookingId !== bookingId) {
        return;
      }
      setArrivedFare(payload.fare);
      setShowPayment(true);
    },
    onTripCompleted: () => undefined,
    onRideCancelled: () => {
      router.replace('/(tabs)');
    }
  });

  const detail = asRecord(bookingData);
  const booking = asRecord(detail.booking);
  const driver = asRecord(detail.driver);
  const vehicle = asRecord(driver.vehicle);

  const driverName = `${asString(driver.firstName)} ${asString(driver.lastName)}`.trim() || 'Driver';
  const driverPhone = asString(driver.phoneNumber, '--');
  const driverRating = asString(driver.rating, '--');
  const driverVehicle = `${asString(vehicle.make)} ${asString(vehicle.model)}`.trim() || '--';

  useEffect(() => {
    const status = asString(booking.status);
    if (status === 'completed') {
      return;
    }
    if (status === 'pending_payment' && !showPayment) {
      const fareRecord = asRecord(detail.fare);
      setArrivedFare({
        tripFare: Number(fareRecord.tripFare ?? fareRecord.estimatedFare ?? 0),
        surgeFee: Number(fareRecord.surgeFee ?? 0),
        tax: Number(fareRecord.tax ?? 0),
        total: Number(fareRecord.total ?? fareRecord.estimatedFare ?? 0),
        currency: asString(fareRecord.currency, 'NGN')
      });
      setShowPayment(true);
    }
  }, [booking.status, detail, showPayment]);

  const handleCallDriver = async () => {
    const sanitized = driverPhone.replace(/[^0-9+]/g, '');
    if (!sanitized) {
      return;
    }
    try {
      await Linking.openURL(`tel:${sanitized}`);
    } catch {
      // Dialer not available; no-op.
    }
  };

  const openDriverChat = () => {
    router.push({
      pathname: '/booking/message-driver',
      params: {
        bookingId,
        driverName
      }
    });
  };

  const openDriverInfo = () => {
    router.push({
      pathname: '/booking/driver-info',
      params: {
        bookingId,
        driverName,
        driverPhone,
        driverRating,
        driverVehicle
      }
    });
  };

  const markerCoordinates = useMemo(
    () => ({
      latitude: driverLocation.lat ?? currentLocation?.coordinates.latitude ?? FALLBACK_MAP_REGION.latitude,
      longitude: driverLocation.lng ?? currentLocation?.coordinates.longitude ?? FALLBACK_MAP_REGION.longitude
    }),
    [driverLocation.lat, driverLocation.lng, currentLocation]
  );

  // Decode the pre-computed road route from the booking
  const encodedPolyline = asString(asRecord(detail.route).polyline);
  const routeCoordinates = useMemo(
    () => (encodedPolyline ? decodePolyline(encodedPolyline) : []),
    [encodedPolyline]
  );

  // Destination is the last stop
  const stops = asArray<Record<string, unknown>>(detail.stops);
  const lastStop = stops.length > 0 ? asRecord(stops[stops.length - 1]) : null;
  const destCoordsRecord = lastStop ? asRecord(lastStop.coordinates) : null;
  const destinationCoord = destCoordsRecord
    ? { latitude: asNumber(destCoordsRecord.lat), longitude: asNumber(destCoordsRecord.lng) }
    : null;

  // Fit map to the full route once on load
  useEffect(() => {
    if (hasInitialFitRef.current || userInteracting || !mapRef.current || routeCoordinates.length < 2) return;
    mapRef.current.fitToCoordinates(routeCoordinates, {
      edgePadding: { top: 80, right: 40, bottom: 320, left: 40 },
      animated: true
    });
    hasInitialFitRef.current = true;
  }, [routeCoordinates, userInteracting]);

  // Until the route track is available, keep the map on the rider's live
  // location (it loads asynchronously, after the map first mounts) instead of
  // the fallback region, so the rider is never shown a hard-coded place.
  useEffect(() => {
    if (hasCenteredOnUserRef.current || hasInitialFitRef.current || userInteracting) return;
    if (!mapRef.current || !currentLocation || routeCoordinates.length >= 2) return;
    mapRef.current.animateToRegion(initialRegion, 500);
    hasCenteredOnUserRef.current = true;
  }, [currentLocation, initialRegion, routeCoordinates, userInteracting]);

  const centerMap = () => {
    if (!mapRef.current) return;
    setUserInteracting(false);
    const coords = routeCoordinates.length >= 2 ? routeCoordinates : [markerCoordinates];
    mapRef.current.fitToCoordinates(coords, {
      edgePadding: { top: 80, right: 40, bottom: 320, left: 40 },
      animated: true
    });
  };

  return (
    <View style={styles.container}>
      {hasConfiguredAndroidGoogleMapsKey ? (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation
          onPanDrag={() => setUserInteracting(true)}
        >
          {driverLocation.lat != null && driverLocation.lng != null && (
            <Marker coordinate={markerCoordinates}>
              <MaterialCommunityIcons name="car" size={24} color={colors.textPrimary} />
            </Marker>
          )}

          {destinationCoord && destinationCoord.latitude !== 0 && (
            <Marker coordinate={destinationCoord}>
              <MaterialCommunityIcons name="map-marker" size={32} color="#e74c3c" />
            </Marker>
          )}

          {routeCoordinates.length >= 2 && (
            <Polyline coordinates={routeCoordinates} strokeColor={colors.primary} strokeWidth={5} />
          )}
        </MapView>
      ) : (
        <MapUnavailable style={styles.map} />
      )}

      <Pressable
        onPress={() => router.back()}
        style={[styles.backButton, { top: insets.top + spacing.md, backgroundColor: colors.surface }]}
      >
        <MaterialCommunityIcons name="chevron-left" size={22} color={colors.textPrimary} />
      </Pressable>

      <Pressable
        onPress={centerMap}
        style={[styles.centerButton, { top: insets.top + spacing.md, backgroundColor: colors.surface }]}
      >
        <MaterialCommunityIcons name="crosshairs-gps" size={20} color={colors.textPrimary} />
      </Pressable>

      <JourneyHomeButton />

      <View style={[styles.bottomCard, { backgroundColor: colors.surface, paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={[styles.handle, { backgroundColor: colors.border }]} />
        <Text variant="h3" weight="medium" align="center">
          Heading to destination
        </Text>
        <Text variant="bodySmall" color="muted" align="center" style={styles.subtitle}>
          Your chauffeur is currently driving your route
        </Text>
        <Text variant="body" align="center" style={styles.vehicleText}>
          {driverVehicle}
        </Text>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Pressable style={styles.driverRow} onPress={openDriverInfo}>
          <View style={[styles.avatar, { backgroundColor: colors.border }]}>
            <MaterialCommunityIcons name="account" size={28} color={colors.textSecondary} />
          </View>

          <View style={styles.driverInfo}>
            <View style={styles.driverNameRow}>
              <Text variant="body" weight="medium">
                {driverName}
              </Text>
              <MaterialCommunityIcons name="check-decagram" size={18} color={colors.brandBlue} />
            </View>

            <View style={styles.metaRow}>
              <MaterialCommunityIcons name="star" size={14} color={colors.primary} />
              <Text variant="bodySmall">{driverRating}</Text>
              <Text variant="bodySmall" color="muted">
                {driverPhone}
              </Text>
            </View>
          </View>

          <View style={styles.actionIcons}>
            <Pressable
              style={[styles.iconButton, { backgroundColor: colors.accent }]}
              accessibilityRole="button"
              onPress={(event) => {
                event.stopPropagation();
                openDriverChat();
              }}
            >
              <MaterialCommunityIcons name="message-text-outline" size={20} color={colors.primary} />
            </Pressable>
            <Pressable
              style={[styles.iconButton, { backgroundColor: colors.accent }]}
              accessibilityRole="button"
              onPress={async (event) => {
                event.stopPropagation();
                await handleCallDriver();
              }}
            >
              <MaterialCommunityIcons name="phone-outline" size={20} color={colors.primary} />
            </Pressable>
          </View>
        </Pressable>

      </View>

      <PaymentModal
        visible={showPayment}
        bookingId={bookingId}
        fare={arrivedFare}
        onClose={() => setShowPayment(false)}
        onPaid={() => {
          setShowPayment(false);
          router.replace({ pathname: '/booking/trip-arrived', params: { bookingId } });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  backButton: {
    position: 'absolute',
    left: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  centerButton: {
    position: 'absolute',
    right: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  bottomCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md
  },
  handle: {
    width: 74,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: spacing.lg
  },
  subtitle: {
    marginTop: spacing.sm
  },
  vehicleText: {
    marginTop: spacing.sm
  },
  divider: {
    height: 1,
    marginVertical: spacing.lg
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center'
  },
  driverInfo: {
    flex: 1,
    gap: spacing.xs
  },
  driverNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs
  },
  actionIcons: {
    flexDirection: 'row',
    gap: spacing.sm
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
});
