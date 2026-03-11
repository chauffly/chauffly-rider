import { useEffect, useMemo } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useBookingById, useBookingUpdates, useDriverLocation as useLiveDriverLocation } from '@/api-client';
import { Text } from '@/components/common/text';
import { spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { socketClient } from '@/runtime/rider-runtime';
import { asRecord, asString } from '@/utils/api-helpers';

const DEFAULT_REGION = {
  latitude: 9.0579,
  longitude: 7.4951,
  latitudeDelta: 0.25,
  longitudeDelta: 0.25
};

export default function HeadingDestinationScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    bookingId?: string;
  }>();
  const bookingId = params.bookingId ?? '';

  const { data: bookingData } = useBookingById(bookingId, {
    enabled: Boolean(bookingId),
    refetchInterval: 5000
  });
  const driverLocation = useLiveDriverLocation(socketClient);

  useBookingUpdates(socketClient, {
    onStatusChanged: (payload) => {
      if (payload.bookingId !== bookingId) {
        return;
      }

      if (payload.status === 'completed') {
        router.replace({
          pathname: '/booking/trip-arrived',
          params: {
            bookingId
          }
        });
      }
    },
    onTripCompleted: () => {
      router.replace({
        pathname: '/booking/trip-arrived',
        params: {
          bookingId
        }
      });
    },
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
      router.replace({
        pathname: '/booking/trip-arrived',
        params: {
          bookingId
        }
      });
    }
  }, [booking, bookingId, router]);

  const handleCallDriver = async () => {
    const phoneUrl = `tel:${driverPhone.replace(/[^0-9+]/g, '')}`;
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

  const markerCoordinates = useMemo(
    () => ({
      latitude: driverLocation.lat ?? 9.22,
      longitude: driverLocation.lng ?? 7.45
    }),
    [driverLocation.lat, driverLocation.lng]
  );

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={DEFAULT_REGION}>
        <Marker coordinate={markerCoordinates}>
          <MaterialCommunityIcons name="car" size={24} color={colors.textPrimary} />
        </Marker>

        <Polyline
          coordinates={[
            markerCoordinates,
            { latitude: 9.18, longitude: 7.47 },
            { latitude: 9.17, longitude: 7.53 },
            { latitude: 9.12, longitude: 7.52 }
          ]}
          strokeColor={colors.primary}
          strokeWidth={6}
        />
      </MapView>

      <Pressable
        onPress={() => router.back()}
        style={[styles.floatingButton, styles.leftButton, { top: insets.top + spacing.xxxxl, backgroundColor: colors.surface }]}
      >
        <MaterialCommunityIcons name="chevron-left" size={24} color={colors.textPrimary} />
      </Pressable>

      <View style={[styles.floatingButton, styles.rightButton, { bottom: 420, backgroundColor: colors.surface }]}>
        <MaterialCommunityIcons name="crosshairs-gps" size={24} color={colors.textPrimary} />
      </View>

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
  floatingButton: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4
  },
  leftButton: {
    left: spacing.lg
  },
  rightButton: {
    right: spacing.lg
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
  }
});
