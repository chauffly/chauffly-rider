import { MaterialCommunityIcons } from '@expo/vector-icons';
import { addMinutes, format } from 'date-fns';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View, } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/common/button';
import { Text } from '@/components/common/text';
import ChevronLeft from '@/components/svg/ChevronLeft';
import LocationPinGreen from '@/components/svg/LocationPinGreen';
import LocationPinRed from '@/components/svg/LocationPinRed';
import { rideOptions } from '@/constants/ride-options';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTranslation } from '@/context/language-context';
import { useTheme } from '@/context/theme-context';

export default function RideSummaryScreen() {
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
    bookingType?: string;
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
  const pickupDate = params.pickupDate;
  const pickupTime = params.pickupTime;
  const pickupDateTime = pickupDate && pickupTime
    ? new Date(`${pickupDate}T${pickupTime}:00`)
    : new Date();
  const pickupTimeDisplay = pickupDate && pickupTime
    ? format(pickupDateTime, 'h:mm a')
    : t('booking.now');
  const dropoffTimeDisplay = format(addMinutes(pickupDateTime, durationMinutes), 'h:mm a');
  const showDriver = !!params.driverName;

 

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + spacing.md }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel={t('common.cancel')}
        >
          <ChevronLeft size={24} color={colors.textPrimary} />
        </Pressable>
        <Text variant="h3" font="medium" translationKey="booking.ride_summary" />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.cardRow}>
            <View style={styles.vehicleInfo}>
              <Text variant="body" font="medium">
                {t(selectedRide.nameKey)}
              </Text>
              <Text variant="caption" color="muted" translationKey="booking.eta_range_short" />
            </View>
            <Text variant="body" font="medium">
              {t(selectedRide.priceKey)}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.routeRow}>
            <LocationPinGreen size={18} />
            <View style={styles.routeText}>
              <Text variant="bodySmall" font="medium">
                {params.originName || t('booking.sample_pickup_location')}
              </Text>
              <Text variant="caption" color="muted">
                {params.originAddress || t('booking.sample_pickup_note')}
              </Text>
            </View>
            <Text variant="caption" color="muted">
              {pickupTimeDisplay}
            </Text>
          </View>

          <View style={styles.routeRow}>
            <LocationPinRed size={18} />
            <View style={styles.routeText}>
              <Text variant="bodySmall" font="medium">
                {destinations[destinations.length - 1]?.name || t('booking.sample_dropoff_location')}
              </Text>
              <Text variant="caption" color="muted">
                {destinations[destinations.length - 1]?.address || t('booking.sample_dropoff_note')}
              </Text>
            </View>
            <Text variant="caption" color="muted">
              {dropoffTimeDisplay}
            </Text>
          </View>
          {distanceKm ? (
            <Text variant="caption" color="muted">
              {t('booking.route_distance', { distance: distanceKm.toFixed(1) })}
            </Text>
          ) : null}
        </View>

        {showDriver ? (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.driverRow}>
              <View style={[styles.driverAvatar, { backgroundColor: colors.border }]} />
              <View style={styles.driverInfo}>
                <Text variant="bodySmall" font="medium">
                  {params.driverName}
                </Text>
              <View style={styles.ratingRow}>
                <MaterialCommunityIcons name="star" size={14} color={colors.primary} />
                <Text variant="caption" color="muted">
                  {params.driverRating || t('booking.sample_rating')}
                </Text>
                {params.driverPhone ? (
                  <Text variant="caption" color="muted">
                    {params.driverPhone}
                  </Text>
                ) : null}
              </View>
              {params.driverVehicle ? (
                <Text variant="caption" color="muted">
                  {params.driverVehicle}
                </Text>
              ) : null}
            </View>
              <View style={[styles.driverBadge, { backgroundColor: colors.accent }]}>
                <MaterialCommunityIcons name="check-decagram" size={18} color={colors.primary} />
              </View>
            </View>
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text variant="bodySmall" font="medium" translationKey="booking.driver_assigned_later" />
            <Text variant="caption" color="muted" translationKey="booking.driver_assigned_later_note" />
          </View>
        )}

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text variant="bodySmall" font="medium" translationKey="booking.ride_summary_fare_breakdown" />
          <View style={styles.fareRow}>
            <Text variant="caption" color="muted" translationKey="booking.trip_fare" />
            <Text variant="caption" translationKey="booking.sample_trip_fare" />
          </View>
          <View style={styles.fareRow}>
            <Text variant="caption" color="muted" translationKey="booking.tax" />
            <Text variant="caption" translationKey="booking.sample_tax" />
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.fareRow}>
            <Text variant="bodySmall" font="medium" translationKey="booking.total" />
            <Text variant="bodySmall" font="medium" translationKey="booking.sample_total" />
          </View>
        </View>

        <View style={styles.premiumCardWrapper}>
          <Pressable
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.primary, borderWidth: 2 },
            ]}
            onPress={() => router.push('/(tabs)/booking/personalization')}
            accessibilityRole="button"
            accessibilityLabel={t('booking.experience_add_ons')}
          >
            <Text variant="bodySmall" font="medium" translationKey="booking.experience_add_ons" />
            <Text variant="caption" color="muted">
              {t('booking.experience_add_ons_items')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          translationKey="booking.book_ride"
          fullWidth
          onPress={() =>
            router.push({
              pathname: '/(tabs)/booking/driver-accepts',
              params,
            })
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  premiumCardWrapper: {
    position: 'relative',
  },
  premiumRing: {
    position: 'absolute',
    top: -6,
    bottom: -6,
    left: -6,
    right: -6,
    borderRadius: borderRadius.lg + 8,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vehicleInfo: {
    gap: spacing.xs,
  },
  divider: {
    height: 1,
    marginVertical: spacing.md,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  routeText: {
    flex: 1,
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
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  driverBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  footer: {
    paddingBottom: spacing.lg,
  },
});
