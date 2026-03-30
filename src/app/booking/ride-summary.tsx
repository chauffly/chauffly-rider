import { useEffect, useMemo, useRef, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { addMinutes, format } from 'date-fns';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCreateBooking, useEstimateFare, useRideOptions } from '@/api-client';
import { Button } from '@/components/common/button';
import { Text } from '@/components/common/text';
import { StackHeader } from '@/components/common/stack-header';
import LocationPinGreen from '@/components/svg/LocationPinGreen';
import LocationPinRed from '@/components/svg/LocationPinRed';
import { rideOptions } from '@/constants/ride-options';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTranslation } from '@/context/language-context';
import { useTheme } from '@/context/theme-context';
import { asArray, asNumber, asRecord, asString } from '@/utils/api-helpers';
import { formatNairaAmount } from '@/utils/currency';

const generateIdempotencyKey = (): string => {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isUuid = (value: string): boolean => UUID_REGEX.test(value);
const VAT_RATE = 0.075;
const roundCurrency = (value: number): number => Number(value.toFixed(2));

type DestinationInput = {
  id?: string;
  name?: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
};

export default function RideSummaryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const [isShimmering, setIsShimmering] = useState(true);
  const [bookingError, setBookingError] = useState('');
  const [estimateError, setEstimateError] = useState('');
  const estimateFareMutation = useEstimateFare();
  const createBooking = useCreateBooking();
  const { data: rideOptionsData } = useRideOptions();
  const { mutateAsync: estimateFareAsync, data: estimateFareData } = estimateFareMutation;
  const params = useLocalSearchParams<{
    originName?: string;
    originAddress?: string;
    originLat?: string;
    originLng?: string;
    destinations?: string;
    selectedRideId?: string;
    selectedRideTier?: string;
    pickupDate?: string;
    pickupTime?: string;
    bookingType?: string;
    estimatedDurationMinutes?: string;
    distanceKm?: string;
  }>();

  const destinations: DestinationInput[] = useMemo(() => {
    if (!params.destinations) {
      return [];
    }
    try {
      return JSON.parse(params.destinations) as DestinationInput[];
    } catch {
      return [];
    }
  }, [params.destinations]);

  const selectedRideOptionId = asString(params.selectedRideId, '').trim();
  const selectedRideTier = asString(params.selectedRideTier, '').toLowerCase();

  const apiRideOptions = useMemo<Record<string, unknown>[]>(() => {
    const payload = asRecord(rideOptionsData);
    const items = asArray<Record<string, unknown>>(payload.items);
    return items.length > 0 ? items : asArray<Record<string, unknown>>(rideOptionsData);
  }, [rideOptionsData]);

  const selectedRideOption = useMemo<Record<string, unknown> | null>(() => {
    if (apiRideOptions.length === 0) {
      return null;
    }

    if (selectedRideOptionId && isUuid(selectedRideOptionId)) {
      const byId = apiRideOptions.find((option) => asString(option.id) === selectedRideOptionId);
      if (byId) {
        return byId;
      }
    }

    const tierCandidate = (selectedRideTier || selectedRideOptionId).toLowerCase();
    if (tierCandidate) {
      const byTier = apiRideOptions.find(
        (option) => asString(option.tier).toLowerCase() === tierCandidate
      );
      if (byTier) {
        return byTier;
      }
    }

    return apiRideOptions[0];
  }, [apiRideOptions, selectedRideOptionId, selectedRideTier]);

  const rideOptionIdForApi = useMemo(() => {
    if (selectedRideOption) {
      return asString(selectedRideOption.id, '');
    }
    if (selectedRideOptionId && isUuid(selectedRideOptionId)) {
      return selectedRideOptionId;
    }
    return '';
  }, [selectedRideOption, selectedRideOptionId]);

  const resolvedRideTier = asString(
    selectedRideOption?.tier,
    selectedRideTier || selectedRideOptionId
  ).toLowerCase();

  const selectedRide =
    rideOptions.find((option) => option.id === resolvedRideTier) ??
    rideOptions.find((option) => option.id === selectedRideTier) ??
    rideOptions[0];

  const fallbackBaseFare = asNumber(selectedRideOption?.baseFare ?? selectedRideOption?.base_fare, 0);
  const fallbackPerKmRate = asNumber(selectedRideOption?.perKmRate ?? selectedRideOption?.per_km_rate, 0);
  const fallbackPerMinuteRate = asNumber(
    selectedRideOption?.perMinuteRate ?? selectedRideOption?.per_minute_rate,
    0
  );
  const fallbackSurgeMultiplier = Math.max(
    1,
    asNumber(selectedRideOption?.surgeMultiplier ?? selectedRideOption?.surge_multiplier, 1)
  );
  const durationMinutes = params.estimatedDurationMinutes ? Number(params.estimatedDurationMinutes) : 45;
  const distanceKm = params.distanceKm ? Number(params.distanceKm) : null;
  const safeDistanceKm = Number.isFinite(distanceKm) && distanceKm !== null ? Math.max(distanceKm, 0) : 0;
  const safeDurationMinutes = Number.isFinite(durationMinutes) ? Math.max(durationMinutes, 0) : 0;
  const fallbackTripFareValue = roundCurrency(
    fallbackBaseFare + safeDistanceKm * fallbackPerKmRate + safeDurationMinutes * fallbackPerMinuteRate
  );
  const fallbackSurgedFareValue = roundCurrency(fallbackTripFareValue * fallbackSurgeMultiplier);
  const fallbackTaxValue = roundCurrency(fallbackSurgedFareValue * VAT_RATE);
  const fallbackTotalFareValue = roundCurrency(fallbackSurgedFareValue + fallbackTaxValue);
  const pickupDate = params.pickupDate;
  const pickupTime = params.pickupTime;
  const pickupDateTime =
    pickupDate && pickupTime ? new Date(`${pickupDate}T${pickupTime}:00`) : new Date();
  const pickupTimeDisplay = pickupDate && pickupTime ? format(pickupDateTime, 'h:mm a') : t('booking.now');
  const dropoffTimeDisplay = format(addMinutes(pickupDateTime, durationMinutes), 'h:mm a');
  const bookingType = params.bookingType === 'scheduled' ? 'scheduled' : 'instant';

  const pickupLat = Number(params.originLat ?? 0);
  const pickupLng = Number(params.originLng ?? 0);

  useEffect(() => {
    const shimmerLoop = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true
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

  useEffect(() => {
    if (!pickupLat || !pickupLng || destinations.length === 0) {
      setEstimateError('');
      return;
    }

    if (!rideOptionIdForApi) {
      setEstimateError('Unable to load ride pricing. Please go back and choose a ride type again.');
      return;
    }

    const runEstimate = async () => {
      try {
        setEstimateError('');
        await estimateFareAsync({
          pickup: { lat: pickupLat, lng: pickupLng },
          stops: destinations.map((stop) => ({
            lat: stop.coordinates.latitude,
            lng: stop.coordinates.longitude
          })),
          ride_option_id: rideOptionIdForApi
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to calculate fare estimate.';
        setEstimateError(message);
      }
    };

    void runEstimate();
  }, [pickupLat, pickupLng, destinations, rideOptionIdForApi, estimateFareAsync]);

  const estimateRecord = asRecord(estimateFareData);
  const fareBreakdown = asRecord(estimateRecord.fare_breakdown);
  const apiTripFareValue = asNumber(fareBreakdown.trip_fare, NaN);
  const apiSurgeFeeValue = asNumber(fareBreakdown.surge_fee, NaN);
  const apiTaxValue = asNumber(fareBreakdown.tax, NaN);
  const apiTotalValue = asNumber(fareBreakdown.total ?? estimateRecord.estimated_fare, NaN);

  const tripFareValue = Number.isFinite(apiTripFareValue) ? apiTripFareValue : fallbackTripFareValue;
  const taxValue = Number.isFinite(apiTaxValue) ? apiTaxValue : fallbackTaxValue;
  const totalValue = Number.isFinite(apiTotalValue) ? apiTotalValue : fallbackTotalFareValue;
  const derivedSurgeFeeValue = roundCurrency(Math.max(0, totalValue - tripFareValue - taxValue));
  const surgeFeeValue = Number.isFinite(apiSurgeFeeValue) ? apiSurgeFeeValue : derivedSurgeFeeValue;
  const showSurgeFee = surgeFeeValue > 0.01;

  const tripFare = formatNairaAmount(tripFareValue, { unit: 'naira' });
  const surgeFee = formatNairaAmount(surgeFeeValue, { unit: 'naira' });
  const tax = formatNairaAmount(taxValue, { unit: 'naira' });
  const total = formatNairaAmount(totalValue, { unit: 'naira' });

  const handleCreateBooking = async () => {
    if (!params.originAddress || !pickupLat || !pickupLng || destinations.length === 0) {
      setBookingError('Missing route details. Please set pickup and destination again.');
      return;
    }

    if (!rideOptionIdForApi) {
      setBookingError('Ride type is unavailable. Please return and select a ride option again.');
      return;
    }

    setBookingError('');
    try {
      const scheduledAt =
        bookingType === 'scheduled'
          ? format(pickupDateTime, "yyyy-MM-dd'T'HH:mm:ssxxx")
          : undefined;

      const bookingResponse = await createBooking.mutateAsync({
        input: {
          pickup: {
            name: params.originName || params.originAddress,
            address: params.originAddress,
            coordinates: {
              lat: pickupLat,
              lng: pickupLng
            }
          },
          stops: destinations.map((stop) => ({
            name: stop.name,
            address: stop.address,
            coordinates: {
              lat: stop.coordinates.latitude,
              lng: stop.coordinates.longitude
            }
          })),
          ride_option_id: rideOptionIdForApi,
          booking_type: bookingType,
          scheduled_at: scheduledAt
        },
        idempotencyKey: generateIdempotencyKey()
      });

      const result = asRecord(bookingResponse);
      const bookingDetail = asRecord(result.booking);
      const bookingEntity = asRecord(bookingDetail.booking);
      const bookingId =
        asString(bookingEntity.id) ||
        asString(bookingDetail.id) ||
        asString(result.bookingId) ||
        asString(result.booking_id);

      if (bookingId) {
        router.replace(`/booking/driver-accepts?bookingId=${encodeURIComponent(bookingId)}`);
        return;
      }

      router.replace('/booking/driver-accepts');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create booking.';
      setBookingError(message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + spacing.md }]}>
      <StackHeader translationKey="booking.ride_summary" onBack={() => router.back()} />

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
              {total}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.routeRow}>
            <LocationPinGreen size={18} />
            <View style={styles.routeText}>
              <Text variant="bodySmall" font="medium">
                {params.originName || 'Pickup location'}
              </Text>
              <Text variant="caption" color="muted">
                {params.originAddress || '--'}
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
                {destinations[destinations.length - 1]?.name || 'Destination'}
              </Text>
              <Text variant="caption" color="muted">
                {destinations[destinations.length - 1]?.address || '--'}
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

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text variant="bodySmall" font="medium" translationKey="booking.ride_summary_fare_breakdown" />
          <View style={styles.fareRow}>
            <Text variant="caption" color="muted" translationKey="booking.trip_fare" />
            <Text variant="caption">{tripFare}</Text>
          </View>
          {showSurgeFee ? (
            <View style={styles.fareRow}>
              <Text variant="caption" color="muted" translationKey="booking.surge_fee" />
              <Text variant="caption">{surgeFee}</Text>
            </View>
          ) : null}
          <View style={styles.fareRow}>
            <Text variant="caption" color="muted" translationKey="booking.tax" />
            <Text variant="caption">{tax}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.fareRow}>
            <Text variant="bodySmall" font="medium" translationKey="booking.total" />
            <Text variant="bodySmall" font="medium">
              {total}
            </Text>
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
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingRight: spacing.md
              }
            ]}
            onPress={() => router.push({ pathname: '/booking/personalization', params })}
            accessibilityRole="button"
            accessibilityLabel={t('booking.enhance_ride_title')}
          >
            {isShimmering ? (
              <Animated.View
                style={[
                  styles.shimmerOverlay,
                  {
                    backgroundColor: colors.white,
                    transform: [
                      {
                        translateX: shimmerAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-screenWidth, screenWidth]
                        })
                      },
                      { rotate: '-20deg' }
                    ]
                  }
                ]}
                pointerEvents="none"
              />
            ) : null}
            <View>
              <Text variant="bodySmall" font="medium" translationKey="booking.enhance_ride_title" />
              <Text variant="caption" color="muted">
                {t('booking.enhance_ride_subtitle')}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-double-right" size={24} color={colors.primary} />
          </Pressable>
        </View>
        {bookingError ? (
          <Text variant="bodySmall" color="error">
            {bookingError}
          </Text>
        ) : null}
        {estimateError ? (
          <Text variant="bodySmall" color="error">
            {estimateError}
          </Text>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          translationKey="booking.book_ride"
          fullWidth
          onPress={handleCreateBooking}
          disabled={createBooking.isPending || !rideOptionIdForApi}
          title={createBooking.isPending ? t('common.loading') : undefined}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.md
  },
  card: {
    borderRadius: borderRadius.xxl,
    padding: spacing.lg
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  vehicleInfo: {
    gap: spacing.xs
  },
  divider: {
    height: 1,
    marginVertical: spacing.md
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm
  },
  routeText: {
    flex: 1
  },
  fareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  premiumCardWrapper: {
    marginTop: spacing.sm
  },
  shimmerOverlay: {
    position: 'absolute',
    top: -40,
    bottom: -40,
    width: 80,
    opacity: 0.35
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg
  }
});
