import { useEffect, useRef, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { addMinutes, format } from 'date-fns';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/common/button';
import { Text } from '@/components/common/text';
import { StackHeader } from '@/components/common/stack-header';
import LocationPinGreen from '@/components/svg/LocationPinGreen';
import LocationPinRed from '@/components/svg/LocationPinRed';
import { rideOptions } from '@/constants/ride-options';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTranslation } from '@/context/language-context';
import { useTheme } from '@/context/theme-context';
import { localJsonApi } from '@/api/local-json-api';

export default function RideSummaryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const [isShimmering, setIsShimmering] = useState(true);
  const activeBooking = localJsonApi.getActiveBooking();
  const fallbackDriver = localJsonApi.getDriverById(activeBooking.driver_id);
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

  useEffect(() => {
    const shimmerLoop = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      { iterations: 2 }
    );
    shimmerLoop.start(({ finished }) => {
      if (finished) {
        setIsShimmering(false);
      }
    });
    return () => shimmerLoop.stop();
  }, [shimmerAnim]);

 

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + spacing.md }]}>
      <StackHeader
        translationKey="booking.ride_summary"
        onBack={() => router.back()}
      />

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
                {params.originName || activeBooking.route_defaults.origin_name}
              </Text>
              <Text variant="caption" color="muted">
                {params.originAddress || activeBooking.route_defaults.origin_address}
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
                {destinations[destinations.length - 1]?.name || activeBooking.route_defaults.destination_name}
              </Text>
              <Text variant="caption" color="muted">
                {destinations[destinations.length - 1]?.address || activeBooking.route_defaults.destination_address}
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
                  {params.driverName || fallbackDriver.display_name}
                </Text>
              <View style={styles.ratingRow}>
                <MaterialCommunityIcons name="star" size={14} color={colors.primary} />
                <Text variant="caption" color="muted">
                  {params.driverRating || fallbackDriver.rating.toFixed(1)}
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
            <Text variant="caption">{activeBooking.fare_breakdown.trip_fare}</Text>
          </View>
          <View style={styles.fareRow}>
            <Text variant="caption" color="muted" translationKey="booking.tax" />
            <Text variant="caption">{activeBooking.fare_breakdown.tax}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.fareRow}>
            <Text variant="bodySmall" font="medium" translationKey="booking.total" />
            <Text variant="bodySmall" font="medium">{activeBooking.fare_breakdown.total}</Text>
          </View>
        </View>

        <View style={styles.premiumCardWrapper}>
          <Pressable
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.primary,
                borderWidth: 2,
                overflow: 'hidden',
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingRight: spacing.md,
              },
            ]}
            onPress={() => router.push('/booking/personalization')}
            accessibilityRole="button"
            accessibilityLabel={t('booking.enhance_ride_title')}
          >
            {isShimmering && (
              <Animated.View
                style={[
                  styles.shimmerOverlay,
                  {
                    backgroundColor: colors.white,
                    transform: [
                      {
                        translateX: shimmerAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-screenWidth, screenWidth],
                        }),
                      },
                      { rotate: '-20deg' },
                    ],
                  },
                ]}
                pointerEvents="none"
              />
            )}
            <View>

            <Text variant="bodySmall" font="medium" translationKey="booking.enhance_ride_title" />
            <Text variant="caption" color="muted">
              {t('booking.enhance_ride_subtitle')}
            </Text>
            </View>
            <MaterialCommunityIcons name='chevron-double-right' size={24}  color={colors.primary} />
          </Pressable>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          translationKey="booking.book_ride"
          fullWidth
          onPress={() =>
            router.push({
              pathname: '/booking/driver-accepts',
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
  shimmerOverlay: {
    position: 'absolute',
    top: -20,
    bottom: -20,
    width: 140,
    opacity: 0.25,
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
