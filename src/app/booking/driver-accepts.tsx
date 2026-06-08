import { StyleSheet, View, Pressable, Linking, Modal } from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useActiveBooking, useApiClient, useBookingById, useBookingUpdates, useDriverLocation as useLiveDriverLocation } from '@/api-client';
import { JourneyHomeButton } from '@/components/common/journey-home-button';
import { MapUnavailable } from '@/components/common/map-unavailable';
import { Text } from '@/components/common/text';
import ChevronLeft from '@/components/svg/ChevronLeft';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { socketClient } from '@/runtime/rider-runtime';
import { asArray, asNumber, asRecord, asString } from '@/utils/api-helpers';
import { hasConfiguredAndroidGoogleMapsKey } from '@/utils/google-maps';
import { decodePolyline } from '@/utils/route';

const DEFAULT_REGION = {
  latitude: 9.0579,
  longitude: 7.4951,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08
};

type RideArrivalState = 'searching' | 'accepted' | 'heading' | 'arrived';

const mapBookingStatus = (status: string): RideArrivalState => {
  if (!status) {
    return 'searching';
  }

  if (status === 'driver_arrived') {
    return 'arrived';
  }
  if (status === 'driver_heading') {
    return 'heading';
  }
  if (status === 'searching' || status === 'pending') {
    return 'searching';
  }
  if (status === 'driver_assigned') {
    return 'accepted';
  }

  return 'searching';
};

export default function DriverAcceptsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    bookingId?: string;
    driverName?: string;
    driverPhone?: string;
    driverRating?: string;
    driverVehicle?: string;
    fromScheduledStart?: string;
  }>();
  const requestedBookingId = params.bookingId ?? '';
  const { data: activeBookingData } = useActiveBooking({
    enabled: !requestedBookingId,
    refetchInterval: !requestedBookingId ? 5000 : false
  });
  const activeBookingRecord = asRecord(activeBookingData);
  const activeBookingEntity = asRecord(activeBookingRecord.booking);
  const bookingId = requestedBookingId || asString(activeBookingEntity.id, '');

  const { data: bookingData } = useBookingById(bookingId, {
    enabled: Boolean(bookingId),
    refetchInterval: 5000
  });

  const api = useApiClient();
  const initiatedRef = useRef(false);
  const navigatedToJourneyRef = useRef(false);
  const [rideArrivalState, setRideArrivalState] = useState<RideArrivalState>('searching');
  const [showPinModal, setShowPinModal] = useState(false);
  const [livePin, setLivePin] = useState('');
  const [liveAssignedDriver, setLiveAssignedDriver] = useState<Record<string, unknown> | null>(null);
  const [liveAssignedVehicle, setLiveAssignedVehicle] = useState<Record<string, unknown> | null>(null);
  const [terminalState, setTerminalState] = useState<{
    type: 'no_drivers' | 'cancelled';
    message: string;
  } | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [retriesLeft, setRetriesLeft] = useState(3);
  const [retrying, setRetrying] = useState(false);
  const [userInteracting, setUserInteracting] = useState(false);
  const mapRef = useRef<MapView>(null);
  const hasInitialFitRef = useRef(false);

  const driverLocation = useLiveDriverLocation(socketClient);

  useBookingUpdates(socketClient, {
    onStatusChanged: (payload) => {
      if (!bookingId || payload.bookingId !== bookingId) {
        return;
      }
      setRideArrivalState(mapBookingStatus(payload.status));
    },
    onDriverAssigned: (payload) => {
      if (!bookingId || asString(payload.bookingId) !== bookingId) {
        return;
      }

      setLiveAssignedDriver(asRecord(payload.driver));
      setLiveAssignedVehicle(asRecord(payload.vehicle));
      setRideArrivalState('accepted');
    },
    onRideCancelled: (payload) => {
      if (!bookingId || payload.bookingId !== bookingId) {
        return;
      }

      setTerminalState({
        type: 'cancelled',
        message: payload.reason?.trim() || t('booking.booking_cancelled_message')
      });
    },
    onNoDrivers: (payload) => {
      if (!bookingId || payload.bookingId !== bookingId) {
        return;
      }

      setRetriesLeft((prev) => Math.max(0, prev - 1));
      setTerminalState({
        type: 'no_drivers',
        message: t('booking.no_drivers_message')
      });
    },
    onTripCompleted: () => {
      if (!bookingId || navigatedToJourneyRef.current) {
        return;
      }
      navigatedToJourneyRef.current = true;
      router.replace({
        pathname: '/booking/trip-arrived',
        params: {
          bookingId
        }
      });
    }
  });

  useEffect(() => {
    return socketClient.onRideEvent('driver_arrived', (payload) => {
      if (payload.pin) {
        setLivePin(payload.pin);
      }
      setRideArrivalState('arrived');
    });
  }, []);

  useEffect(() => {
    const detail = asRecord(bookingData);
    const booking = asRecord(detail.booking);
    const status = asString(booking.status, '');
    if (status) {
      setRideArrivalState(mapBookingStatus(status));
    }
    if (status === 'in_progress' && !navigatedToJourneyRef.current) {
      navigatedToJourneyRef.current = true;
      router.replace({
        pathname: '/booking/heading-destination',
        params: {
          bookingId
        }
      });
    }
  }, [bookingData, bookingId, router]);

  useEffect(() => {
    if (rideArrivalState === 'arrived') {
      setShowPinModal(true);
    }
  }, [rideArrivalState]);

  useEffect(() => {
    if (params.fromScheduledStart !== 'true' || !bookingId || initiatedRef.current) return;
    const detail = asRecord(bookingData);
    const status = asString(asRecord(detail.booking).status, '');
    if (!status || (status !== 'pending' && status !== 'no_drivers')) return;
    initiatedRef.current = true;
    api.bookingApi.initiateSearch(bookingId).catch(() => {});
  }, [api.bookingApi, bookingData, bookingId, params.fromScheduledStart]);

  const detail = asRecord(bookingData);
  const booking = asRecord(detail.booking);
  const driver = Object.keys(liveAssignedDriver ?? {}).length > 0 ? liveAssignedDriver! : asRecord(detail.driver);
  const vehicle =
    Object.keys(liveAssignedVehicle ?? {}).length > 0
      ? liveAssignedVehicle!
      : asRecord(driver.vehicle);
  const driverName =
    params.driverName || `${asString(driver.firstName)} ${asString(driver.lastName)}`.trim() || t('booking.driver_fallback');
  const driverPhone = params.driverPhone || asString(driver.phoneNumber, '--');
  const driverRating = params.driverRating || asString(driver.rating, '--');
  const driverVehicleRaw = `${asString(vehicle.make)} ${asString(vehicle.model)}`.trim();
  const driverVehicle = params.driverVehicle || driverVehicleRaw || '--';
  const hasAssignedDriver =
    rideArrivalState !== 'searching' ||
    Object.keys(driver).length > 0 ||
    Boolean(params.driverName && params.driverName.trim());
  const pickupCoordinates = asRecord(booking.pickupCoordinates);
  const bookingPickupLatitude = asNumber(pickupCoordinates.lat, DEFAULT_REGION.latitude);
  const bookingPickupLongitude = asNumber(pickupCoordinates.lng, DEFAULT_REGION.longitude);

  const markerCoordinates = useMemo(
    () => ({
      latitude: driverLocation.lat ?? bookingPickupLatitude,
      longitude: driverLocation.lng ?? bookingPickupLongitude
    }),
    [bookingPickupLatitude, bookingPickupLongitude, driverLocation.lat, driverLocation.lng]
  );

  const stops = asArray<Record<string, unknown>>(detail.stops);
  const lastStop = stops.length > 0 ? asRecord(stops[stops.length - 1]) : null;
  const destCoordsRecord = lastStop ? asRecord(lastStop.coordinates) : null;
  const destinationCoord = destCoordsRecord
    ? { latitude: asNumber(destCoordsRecord.lat), longitude: asNumber(destCoordsRecord.lng) }
    : null;

  const encodedPolyline = asString(asRecord(detail.route).polyline);
  const routeCoordinates = useMemo(
    () => (encodedPolyline ? decodePolyline(encodedPolyline) : []),
    [encodedPolyline]
  );

  useEffect(() => {
    if (hasInitialFitRef.current || userInteracting || !mapRef.current || routeCoordinates.length < 2) return;
    mapRef.current.fitToCoordinates(routeCoordinates, {
      edgePadding: { top: 80, right: 40, bottom: 340, left: 40 },
      animated: true
    });
    hasInitialFitRef.current = true;
  }, [routeCoordinates, userInteracting]);

  const centerMap = () => {
    if (!mapRef.current) return;
    setUserInteracting(false);
    const coords = routeCoordinates.length >= 2 ? routeCoordinates : [{ latitude: bookingPickupLatitude, longitude: bookingPickupLongitude }];
    mapRef.current.fitToCoordinates(coords, {
      edgePadding: { top: 80, right: 40, bottom: 340, left: 40 },
      animated: true
    });
  };

  const handleCancelSearch = async () => {
    if (!bookingId || cancelling) {
      return;
    }

    setCancelling(true);
    setCancelError('');

    try {
      await api.bookingApi.cancel(bookingId, { reason: t('booking.cancel_reason_rider') });
      setTerminalState({
        type: 'cancelled',
        message: t('booking.search_cancelled_message')
      });
    } catch (error) {
      setCancelError(error instanceof Error ? error.message : t('booking.cancel_failed'));
    } finally {
      setCancelling(false);
    }
  };

  const handleRetrySearch = async () => {
    if (!bookingId || retrying || retriesLeft <= 0) return;
    setRetrying(true);
    setCancelError('');
    try {
      await api.bookingApi.retrySearch(bookingId);
      setRetriesLeft((n) => n - 1);
      setTerminalState(null);
      setRideArrivalState('searching');
    } catch (error) {
      setCancelError(error instanceof Error ? error.message : t('booking.cancel_failed'));
    } finally {
      setRetrying(false);
    }
  };

  const displayPin = livePin || asString(booking.confirmationPin, '');

  const statusTitle =
    rideArrivalState === 'searching'
      ? t('booking.driver_assigned_later')
      : rideArrivalState === 'accepted'
      ? t('booking.chauffeur_accepts_ride')
      : rideArrivalState === 'heading'
        ? t('booking.driver_heading_to_location')
        : t('booking.chauffeur_has_arrived');

  const statusSubtitle =
    rideArrivalState === 'searching'
      ? t('booking.driver_assigned_later_note')
      : rideArrivalState === 'accepted'
      ? t('booking.driver_assigned_later_note')
      : rideArrivalState === 'heading'
        ? t('booking.arriving_in_one_minute')
        : t('booking.arrival_waiting_note');

  const handleCallDriver = async () => {
    const sanitizedPhone = driverPhone.replace(/[^0-9+]/g, '');
    if (!sanitizedPhone) {
      return;
    }
    try {
      // Skip canOpenURL: on iOS it returns false unless `tel` is whitelisted
      // in Info.plist's LSApplicationQueriesSchemes, but openURL itself works.
      await Linking.openURL(`tel:${sanitizedPhone}`);
    } catch {
      // Dialer not available (e.g. iOS simulator); silently no-op.
    }
  };

  const openDriverChat = () => {
    if (!bookingId) {
      return;
    }

    router.push({
      pathname: '/booking/message-driver',
      params: {
        bookingId,
        driverName
      }
    });
  };

  const openDriverInfo = () => {
    if (!bookingId) {
      return;
    }

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

  const handleTerminalDismiss = () => {
    setTerminalState(null);
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      {hasConfiguredAndroidGoogleMapsKey ? (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={DEFAULT_REGION}
          onPanDrag={() => setUserInteracting(true)}
        >
          {hasAssignedDriver && driverLocation.lat && driverLocation.lng ? (
            <Marker coordinate={markerCoordinates}>
              <View style={[styles.marker, { backgroundColor: colors.primary }]}>
                <MaterialCommunityIcons name="car" size={18} color={colors.textInverse} />
              </View>
            </Marker>
          ) : null}
          <Marker coordinate={{ latitude: bookingPickupLatitude, longitude: bookingPickupLongitude }}>
            <MaterialCommunityIcons name="map-marker" size={32} color={colors.primary} />
          </Marker>
          {destinationCoord && destinationCoord.latitude !== 0 ? (
            <Marker coordinate={destinationCoord}>
              <MaterialCommunityIcons name="map-marker" size={32} color="#e74c3c" />
            </Marker>
          ) : null}
          {routeCoordinates.length >= 2 ? (
            <Polyline coordinates={routeCoordinates} strokeColor={colors.primary} strokeWidth={5} />
          ) : hasAssignedDriver && driverLocation.lat && driverLocation.lng ? (
            <Polyline
              coordinates={[markerCoordinates, { latitude: bookingPickupLatitude, longitude: bookingPickupLongitude }]}
              strokeColor={colors.primary}
              strokeWidth={4}
            />
          ) : null}
        </MapView>
      ) : (
        <MapUnavailable style={styles.map} />
      )}

      <Pressable
        onPress={() => router.back()}
        style={[
          styles.backButton,
          {
            top: insets.top + spacing.md,
            backgroundColor: colors.surface,
            shadowColor: colors.textPrimary
          }
        ]}
        accessibilityRole="button"
        accessibilityLabel={t('common.cancel')}
      >
        <ChevronLeft size={24} color={colors.textPrimary} />
      </Pressable>

      <Pressable
        onPress={centerMap}
        style={[styles.centerButton, { top: insets.top + spacing.md, backgroundColor: colors.surface }]}
      >
        <MaterialCommunityIcons name="crosshairs-gps" size={20} color={colors.textPrimary} />
      </Pressable>

      <JourneyHomeButton />

      <View
        style={[
          styles.bottomCard,
          {
            backgroundColor: colors.surface,
            paddingBottom: insets.bottom + spacing.lg,
            shadowColor: colors.textPrimary
          }
        ]}
      >
        <Text variant="h3" font="medium" style={styles.statusTitle}>
          {statusTitle}
        </Text>
        <Text variant="body" color="muted" style={styles.statusSubtitle}>
          {statusSubtitle}
        </Text>
        <Text variant="body" style={styles.vehicleText}>
          {hasAssignedDriver ? driverVehicle : t('booking.matching_chauffeur')}
        </Text>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {hasAssignedDriver ? (
          <Pressable style={styles.driverRow} onPress={openDriverInfo}>
            <View style={[styles.avatar, { backgroundColor: colors.border }]}>
              <MaterialCommunityIcons name="account" size={28} color={colors.textSecondary} />
            </View>
            <View style={styles.driverInfo}>
              <Text variant="body" font="medium">
                {driverName}
              </Text>
              <View style={styles.ratingRow}>
                <MaterialCommunityIcons name="star" size={14} color={colors.primary} />
                <Text variant="bodySmall" color="muted">
                  {driverRating}
                </Text>
                <Text variant="bodySmall" color="muted">
                  {driverPhone}
                </Text>
              </View>
            </View>
            <View style={styles.actionIcons}>
              <Pressable
                style={[styles.iconButton, { backgroundColor: colors.accent }]}
                accessibilityRole="button"
                accessibilityLabel={t('booking.message_driver')}
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
                accessibilityLabel={t('booking.call_driver')}
                onPress={async (event) => {
                  event.stopPropagation();
                  await handleCallDriver();
                }}
              >
                <MaterialCommunityIcons name="phone-outline" size={20} color={colors.primary} />
              </Pressable>
            </View>
          </Pressable>
        ) : (
          <View style={styles.driverRow}>
            <View style={[styles.avatar, { backgroundColor: colors.border }]}>
              <MaterialCommunityIcons name="account-search-outline" size={28} color={colors.textSecondary} />
            </View>
            <View style={styles.driverInfo}>
              <Text variant="body" font="medium">
                {t('booking.looking_for_chauffeur')}
              </Text>
              <Text variant="bodySmall" color="muted">
                {t('booking.driver_details_pending')}
              </Text>
            </View>
          </View>
        )}

        {!terminalState ? (
          <>
            {cancelError ? (
              <Text variant="caption" color="error" style={styles.cancelErrorText}>
                {cancelError}
              </Text>
            ) : hasAssignedDriver ? (
              <Text variant="caption" color="muted" style={styles.cancelErrorText}>
                {t('booking.cancel_fee_warning')}
              </Text>
            ) : null}
            <Pressable
              onPress={handleCancelSearch}
              disabled={cancelling || !bookingId}
              style={[
                styles.cancelButton,
                {
                  borderColor: colors.error,
                  opacity: cancelling || !bookingId ? 0.6 : 1
                }
              ]}
              accessibilityRole="button"
              accessibilityLabel={hasAssignedDriver ? t('booking.cancel_ride') : t('booking.cancel_search')}
            >
              <Text variant="body" weight="medium" style={{ color: colors.error }}>
                {cancelling ? t('booking.cancelling') : t('booking.cancel_ride')}
              </Text>
            </Pressable>
          </>
        ) : null}
      </View>

      <Modal
        transparent
        animationType="fade"
        visible={Boolean(terminalState)}
        onRequestClose={handleTerminalDismiss}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text variant="h3" weight="medium" align="center">
              {terminalState?.type === 'no_drivers' ? t('booking.no_drivers_title') : t('booking.booking_cancelled_title')}
            </Text>
            <Text variant="bodySmall" color="muted" align="center">
              {terminalState?.message ?? ''}
            </Text>

            {cancelError ? (
              <Text variant="caption" color="error" align="center">
                {cancelError}
              </Text>
            ) : null}

            {terminalState?.type === 'no_drivers' && retriesLeft > 0 ? (
              <>
                <Text variant="caption" color="muted" align="center">
                  {`${retriesLeft} search ${retriesLeft === 1 ? 'attempt' : 'attempts'} remaining`}
                </Text>
                <Pressable
                  style={[styles.confirmButton, { backgroundColor: colors.primary, opacity: retrying ? 0.6 : 1 }]}
                  onPress={handleRetrySearch}
                  disabled={retrying}
                >
                  <Text variant="body" weight="medium" color="inverse">
                    {retrying ? 'Searching...' : 'Search again'}
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.secondaryConfirmButton, { borderColor: colors.error }]}
                  onPress={handleCancelSearch}
                  disabled={cancelling}
                >
                  <Text variant="body" weight="medium" style={{ color: colors.error }}>
                    {cancelling ? t('booking.cancelling') : t('booking.cancel_ride')}
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <Pressable
                  style={[styles.confirmButton, { backgroundColor: colors.primary }]}
                  onPress={handleTerminalDismiss}
                >
                  <Text variant="body" weight="medium" color="inverse">
                    {t('booking.go_home')}
                  </Text>
                </Pressable>
                {bookingId && terminalState?.type === 'no_drivers' ? (
                  <Pressable
                    style={[styles.secondaryConfirmButton, { borderColor: colors.error }]}
                    onPress={handleCancelSearch}
                    disabled={cancelling}
                  >
                    <Text variant="body" weight="medium" style={{ color: colors.error }}>
                      {cancelling ? t('booking.cancelling') : t('booking.cancel_ride')}
                    </Text>
                  </Pressable>
                ) : null}
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal transparent animationType="slide" visible={showPinModal} onRequestClose={() => setShowPinModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text variant="h3" weight="medium" align="center">
              {t('booking.share_pin_title')}
            </Text>
            <Text variant="bodySmall" color="muted" align="center">
              {t('booking.share_pin_subtitle')}
            </Text>

            <View
              style={[
                styles.pinDisplay,
                {
                  backgroundColor: colors.accent,
                  borderColor: colors.border
                }
              ]}
            >
              <Text
                variant="h1"
                weight="semiBold"
                align="center"
                style={[styles.pinDisplayText, { color: colors.primary }]}
              >
                {displayPin || '----'}
              </Text>
            </View>

            <Text variant="caption" color="muted" align="center">
              {t('booking.share_pin_hint')}
            </Text>

            <Pressable
              style={[styles.confirmButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowPinModal(false)}
            >
              <Text variant="body" weight="medium" color="inverse">
                {t('common.done')}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  backButton: {
    position: 'absolute',
    left: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingTop: spacing.lg,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6
  },
  statusTitle: {
    marginBottom: spacing.xs
  },
  statusSubtitle: {
    marginBottom: spacing.sm
  },
  vehicleText: {
    marginBottom: spacing.sm
  },
  divider: {
    height: 1,
    marginBottom: spacing.md
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  driverInfo: {
    flex: 1,
    marginLeft: spacing.md
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg
  },
  modalCard: {
    width: '100%',
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    gap: spacing.md
  },
  pinDisplay: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center'
  },
  pinDisplayText: {
    letterSpacing: 8,
    fontSize: 36
  },
  confirmButton: {
    borderRadius: borderRadius.full,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center'
  },
  secondaryConfirmButton: {
    borderRadius: borderRadius.full,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1
  },
  cancelButton: {
    marginTop: spacing.md,
    borderRadius: borderRadius.full,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1
  },
  cancelErrorText: {
    marginTop: spacing.sm
  }
});
