import { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ApiClientError, useBookingById, useBookingRate } from '@/api-client';
import { JourneyHomeButton } from '@/components/common/journey-home-button';
import { Text } from '@/components/common/text';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { rideOptions } from '@/constants/ride-options';
import { Button } from '@/components/common/button';
import { asRecord, asString } from '@/utils/api-helpers';
import { formatNairaAmount } from '@/utils/currency';

export default function RateDriverScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    selectedRideId?: string;
    bookingId?: string;
  }>();
  const bookingId = params.bookingId ?? '';
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const rateBooking = useBookingRate();
  const { data: bookingData } = useBookingById(bookingId, {
    enabled: Boolean(bookingId)
  });

  const detail = asRecord(bookingData);
  const fare = asRecord(detail.fare);

  const selectedRide = useMemo(
    () => rideOptions.find((option) => option.id === params.selectedRideId) ?? rideOptions[0],
    [params.selectedRideId]
  );

  const tripFareValue = Math.round(Number(fare.tripFare ?? 0));
  const surgeFeeValue = Math.round(Number(fare.surgeFee ?? 0));
  const taxValue = Math.round(Number(fare.tax ?? 0));
  const computedTotalValue = tripFareValue + surgeFeeValue + taxValue;
  const totalValue = Math.round(Number(fare.total ?? computedTotalValue));
  const tripFare = formatNairaAmount(tripFareValue);
  const surgeFee = formatNairaAmount(surgeFeeValue);
  const tax = formatNairaAmount(taxValue);
  const total = formatNairaAmount(totalValue);
  const selectedRideTitle = selectedRide?.nameKey ? t(selectedRide.nameKey) : 'Chauffly Go';
  const commentPlaceholder = t('booking.add_comment_optional');

  const handleSubmitRating = async () => {
    if (!bookingId || rating === 0 || rateBooking.isPending) {
      return;
    }

    setErrorMessage('');
    try {
      await rateBooking.mutateAsync({
        bookingId,
        rating,
        comment: comment.trim() || undefined
      });
      router.replace('/booking/rating-thank-you');
    } catch (error) {
      const message =
        error instanceof ApiClientError || error instanceof Error
          ? error.message
          : 'Unable to submit your rating. Please try again.';
      setErrorMessage(message);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.lg }
      ]}
    >
      <Pressable onPress={() => router.back()} style={styles.closeButton}>
        <MaterialCommunityIcons name="close" size={28} color={colors.textPrimary} />
      </Pressable>

      <JourneyHomeButton />

      <Image source={require('../../../assets/images/avatar.png')} style={styles.avatar} />

      <Text variant="h2" weight="medium" align="center" style={styles.title}>
        {t('booking.how_was_driver')}
      </Text>
      <Text variant="bodySmall" color="muted" align="center" style={styles.subtitle}>
        {t('booking.rate_driver_subtitle')}
      </Text>

      <View style={styles.starsRow}>
        {Array.from({ length: 5 }).map((_, index) => {
          const filled = rating > index;

          return (
            <Pressable key={index} onPress={() => setRating(index + 1)}>
              <MaterialCommunityIcons
                name={filled ? 'star' : 'star-outline'}
                size={48}
                color={filled ? colors.primary : colors.border}
              />
            </Pressable>
          );
        })}
      </View>

      <TextInput
        style={[styles.commentInput, { borderColor: colors.border, color: colors.textPrimary }]}
        placeholder={
          commentPlaceholder === 'booking.add_comment_optional'
            ? 'Add a comment (optional)'
            : commentPlaceholder
        }
        placeholderTextColor={colors.textMuted}
        value={comment}
        onChangeText={setComment}
        multiline
      />

      <View style={[styles.infoCard, { borderColor: colors.border }]}>
        <View style={styles.row}>
          <Text variant="bodySmall" color="muted">
            {t('booking.ride_label')}
          </Text>
          <Text variant="bodySmall" weight="medium">
            {selectedRideTitle}
          </Text>
        </View>
        <View style={styles.row}>
          <Text variant="bodySmall" color="muted">
            {t('booking.payment_label')}
          </Text>
          <Text variant="bodySmall" weight="medium">
            {t('rides.labels.cash')}
          </Text>
        </View>
      </View>

      <View style={[styles.fareCard, { borderColor: colors.border }]}>
        <View style={styles.row}>
          <Text variant="bodySmall" color="muted">
            {t('booking.trip_fare')}
          </Text>
          <Text variant="bodySmall" color="muted">
            {tripFare}
          </Text>
        </View>
        {surgeFeeValue > 0 ? (
          <View style={styles.row}>
            <Text variant="bodySmall" color="muted">
              {t('booking.surge_fee')}
            </Text>
            <Text variant="bodySmall" color="muted">
              {surgeFee}
            </Text>
          </View>
        ) : null}
        <View style={styles.row}>
          <Text variant="bodySmall" color="muted">
            {t('booking.tax')}
          </Text>
          <Text variant="bodySmall" color="muted">
            {tax}
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.row}>
          <Text variant="body" weight="medium">
            {t('booking.total')}
          </Text>
          <Text variant="h3" weight="medium">
            {total}
          </Text>
        </View>
      </View>

      {errorMessage ? (
        <Text variant="bodySmall" color="error" align="center" style={styles.errorText}>
          {errorMessage}
        </Text>
      ) : null}

      <Button
        title={rateBooking.isPending ? t('common.loading') : t('booking.assign_ranking')}
        fullWidth
        onPress={handleSubmitRating}
        disabled={rating === 0 || rateBooking.isPending}
        style={[styles.submitButton]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg
  },
  closeButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing.md
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 90,
    alignSelf: 'center'
  },
  title: {
    marginTop: spacing.lg
  },
  subtitle: {
    marginTop: spacing.sm
  },
  starsRow: {
    marginTop: spacing.xxl,
    flexDirection: 'row',
    marginHorizontal: 'auto',
    gap: 10
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    minHeight: 80,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    textAlignVertical: 'top'
  },
  infoCard: {
    marginTop: spacing.xl,
    borderWidth: 1,
    borderRadius: 24,
    padding: spacing.lg,
    gap: spacing.lg
  },
  fareCard: {
    marginTop: spacing.lg,
    borderWidth: 1,
    borderRadius: 24,
    padding: spacing.lg,
    gap: spacing.md
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  divider: {
    height: 1,
    marginVertical: spacing.sm
  },
  submitButton: {
    marginTop: 'auto',
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center'
  },
  errorText: {
    marginTop: spacing.md
  }
});
