import { StyleSheet, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { addMinutes, format } from 'date-fns';

import { Text } from '@/components/common/text';
import { Button } from '@/components/common/button';
import ChevronLeft from '@/components/svg/ChevronLeft';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { rideOptions } from '@/constants/ride-options';

const DEFAULT_REGION = {
  latitude: 9.0579,
  longitude: 7.4951,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

export default function DriverAcceptsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    originName?: string;
    originAddress?: string;
    destinations?: string;
    selectedRideId?: string;
    pickupDate?: string;
    pickupTime?: string;
    estimatedDurationMinutes?: string;
    distanceKm?: string;
    driverName?: string;
    driverPhone?: string;
    driverRating?: string;
    driverVehicle?: string;
  }>();

  const destinations = params.destinations ? JSON.parse(params.destinations) : [];
  const selectedRide = rideOptions.find((option) => option.id === params.selectedRideId) ?? rideOptions[0];
  const durationMinutes = params.estimatedDurationMinutes
    ? Number(params.estimatedDurationMinutes)
    : 45;
  const distanceKm = params.distanceKm ? Number(params.distanceKm) : null;
  const pickupDateTime = params.pickupDate && params.pickupTime
    ? new Date(`${params.pickupDate}T${params.pickupTime}:00`)
    : new Date();
  const pickupTimeDisplay = params.pickupDate && params.pickupTime
    ? format(pickupDateTime, 'h:mm a')
    : t('booking.now');
  const dropoffTimeDisplay = format(addMinutes(pickupDateTime, durationMinutes), 'h:mm a');

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={DEFAULT_REGION}>
        <Marker coordinate={{ latitude: 9.18, longitude: 7.55 }}>
          <View style={[styles.marker, { backgroundColor: colors.primary }]}>
            <MaterialCommunityIcons name="car" size={18} color={colors.textInverse} />
          </View>
        </Marker>
        <Polyline
          coordinates={[
            { latitude: 9.18, longitude: 7.55 },
            { latitude: 9.11, longitude: 7.52 },
          ]}
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
            shadowColor: colors.textPrimary,
          },
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
            shadowColor: colors.textPrimary,
          },
        ]}
      >
        <Text variant="body" font="medium" translationKey="booking.driver_accepts" />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={[styles.routeCard, { backgroundColor: colors.background }]}>
          <View style={styles.routeRow}>
            <Text variant="bodySmall" font="medium">
              {t(selectedRide.nameKey)}
            </Text>
            <Text variant="bodySmall" font="medium">
              {t(selectedRide.priceKey)}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.routeRow}>
            <Text variant="bodySmall" color="muted">
              {params.originName || t('booking.sample_pickup_location')}
            </Text>
            <Text variant="caption" color="muted">
              {pickupTimeDisplay}
            </Text>
          </View>
          <View style={styles.routeRow}>
            <Text variant="bodySmall" color="muted">
              {destinations[destinations.length - 1]?.name || t('booking.sample_dropoff_location')}
            </Text>
            <Text variant="caption" color="muted">
              {dropoffTimeDisplay}
            </Text>
          </View>
          <Text variant="caption" color="muted">
            {t('booking.estimated_duration_minutes', { minutes: durationMinutes })}
          </Text>
          {distanceKm ? (
            <Text variant="caption" color="muted">
              {t('booking.route_distance', { distance: distanceKm.toFixed(1) })}
            </Text>
          ) : null}
        </View>

        <View style={styles.driverRow}>
          <View style={[styles.driverAvatar, { backgroundColor: colors.border }]} />
          <View style={styles.driverInfo}>
            <Text variant="bodySmall" font="medium">
              {params.driverName || t('booking.sample_driver_name')}
            </Text>
            <View style={styles.ratingRow}>
              <MaterialCommunityIcons name="star" size={14} color={colors.primary} />
              <Text variant="caption" color="muted">
                {params.driverRating || t('booking.sample_rating')}
              </Text>
              <Text variant="caption" color="muted">
                {params.driverPhone || t('booking.sample_driver_phone')}
              </Text>
            </View>
            {params.driverVehicle ? (
              <Text variant="caption" color="muted">
                {params.driverVehicle}
              </Text>
            ) : null}
          </View>
          <View style={styles.actionIcons}>
            <Pressable
              style={[styles.iconButton, { backgroundColor: colors.accent }]}
              accessibilityRole="button"
              accessibilityLabel={t('booking.message_driver')}
            >
              <MaterialCommunityIcons name="message-text-outline" size={18} color={colors.primary} />
            </Pressable>
            <Pressable
              style={[styles.iconButton, { backgroundColor: colors.accent }]}
              accessibilityRole="button"
              accessibilityLabel={t('booking.call_driver')}
            >
              <MaterialCommunityIcons name="phone-outline" size={18} color={colors.primary} />
            </Pressable>
          </View>
        </View>

        <View style={styles.footerButtons}>
          <Button translationKey="common.back" variant="outline" style={styles.footerButton} onPress={() => router.back()} />
          <Button translationKey="booking.view_rides" style={styles.footerButton} onPress={() => router.push('/(tabs)/rides')} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  marker: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: spacing.lg,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bottomCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  divider: {
    height: 1,
    marginVertical: spacing.md,
  },
  routeCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  driverAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  driverInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionIcons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  footerButton: {
    flex: 1,
  },
});
