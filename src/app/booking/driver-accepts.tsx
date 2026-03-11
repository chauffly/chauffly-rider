import { StyleSheet, View, Pressable, Linking, Modal, TextInput } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useBookingById, useBookingUpdates, useDriverLocation as useLiveDriverLocation } from '@/api-client';
import { Text } from '@/components/common/text';
import ChevronLeft from '@/components/svg/ChevronLeft';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { socketClient } from '@/runtime/rider-runtime';
import { asRecord, asString } from '@/utils/api-helpers';

const DEFAULT_REGION = {
  latitude: 9.0579,
  longitude: 7.4951,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08
};

type RideArrivalState = 'accepted' | 'heading' | 'arrived';

const mapBookingStatus = (status: string): RideArrivalState => {
  if (status === 'driver_arrived') {
    return 'arrived';
  }
  if (status === 'driver_heading') {
    return 'heading';
  }
  return 'accepted';
};

export default function DriverAcceptsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    bookingId?: string;
    originName?: string;
    originAddress?: string;
    destinations?: string;
    selectedRideId?: string;
    driverName?: string;
    driverPhone?: string;
    driverRating?: string;
    driverVehicle?: string;
  }>();
  const bookingId = params.bookingId ?? '';

  const { data: bookingData } = useBookingById(bookingId, {
    enabled: Boolean(bookingId),
    refetchInterval: 5000
  });

  const [rideArrivalState, setRideArrivalState] = useState<RideArrivalState>('accepted');
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [livePin, setLivePin] = useState('');

  const driverLocation = useLiveDriverLocation(socketClient);

  useBookingUpdates(socketClient, {
    onStatusChanged: (payload) => {
      if (payload.bookingId !== bookingId) {
        return;
      }
      setRideArrivalState(mapBookingStatus(payload.status));
    },
    onDriverAssigned: () => {
      setRideArrivalState('accepted');
    },
    onRideCancelled: () => {
      router.replace('/(tabs)');
    },
    onTripCompleted: () => {
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
    if (status === 'in_progress') {
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

  const detail = asRecord(bookingData);
  const driver = asRecord(detail.driver);
  const vehicle = asRecord(driver.vehicle);
  const driverName = params.driverName || `${asString(driver.firstName)} ${asString(driver.lastName)}`.trim() || 'Driver';
  const driverPhone = params.driverPhone || asString(driver.phoneNumber, '--');
  const driverRating = params.driverRating || asString(driver.rating, '--');
  const driverVehicle =
    params.driverVehicle || `${asString(vehicle.make)} ${asString(vehicle.model)}`.trim() || '--';

  const markerCoordinates = useMemo(
    () => ({
      latitude: driverLocation.lat ?? 9.18,
      longitude: driverLocation.lng ?? 7.55
    }),
    [driverLocation.lat, driverLocation.lng]
  );

  const handlePinConfirm = () => {
    if (!pin.trim()) {
      return;
    }

    setShowPinModal(false);
    setPin('');
    router.push({
      pathname: '/booking/heading-destination',
      params: {
        bookingId
      }
    });
  };

  const statusTitle =
    rideArrivalState === 'accepted'
      ? t('booking.chauffeur_accepts_ride')
      : rideArrivalState === 'heading'
        ? t('booking.driver_heading_to_location')
        : t('booking.chauffeur_has_arrived');

  const statusSubtitle =
    rideArrivalState === 'accepted'
      ? t('booking.driver_assigned_later_note')
      : rideArrivalState === 'heading'
        ? t('booking.arriving_in_one_minute')
        : t('booking.arrival_waiting_note');

  const handleCallDriver = async () => {
    const sanitizedPhone = driverPhone.replace(/[^0-9+]/g, '');
    const phoneUrl = `tel:${sanitizedPhone}`;
    const supported = await Linking.canOpenURL(phoneUrl);
    if (supported) {
      await Linking.openURL(phoneUrl);
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

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={DEFAULT_REGION}>
        <Marker coordinate={markerCoordinates}>
          <View style={[styles.marker, { backgroundColor: colors.primary }]}>
            <MaterialCommunityIcons name="car" size={18} color={colors.textInverse} />
          </View>
        </Marker>
        <Polyline
          coordinates={[markerCoordinates, { latitude: 9.11, longitude: 7.52 }]}
          strokeColor={colors.primary}
          strokeWidth={4}
        />
      </MapView>

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
          {driverVehicle}
        </Text>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

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
      </View>

      <Modal transparent animationType="slide" visible={showPinModal} onRequestClose={() => setShowPinModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text variant="h3" weight="medium" align="center">
              {t('booking.enter_trip_pin')}
            </Text>
            <Text variant="bodySmall" color="muted" align="center">
              {t('booking.pin_prompt')}
            </Text>

            {livePin ? (
              <Text variant="h2" weight="semiBold" align="center">
                {livePin}
              </Text>
            ) : null}

            <TextInput
              value={pin}
              onChangeText={setPin}
              style={[
                styles.pinInput,
                {
                  borderColor: colors.border,
                  color: colors.textPrimary
                }
              ]}
              placeholder="----"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={4}
              textAlign="center"
            />

            <Pressable
              style={[styles.confirmButton, { backgroundColor: colors.primary }]}
              onPress={handlePinConfirm}
            >
              <Text variant="body" weight="medium" color="inverse">
                {t('booking.confirm_pin')}
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
  pinInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    height: 56,
    fontSize: 24
  },
  confirmButton: {
    borderRadius: borderRadius.full,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
