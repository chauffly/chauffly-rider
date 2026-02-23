import { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Text } from '@/components/common/text';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { rideOptions } from '@/constants/ride-options';
import { Button } from '@/components/common/button';
import { localJsonApi } from '@/api/local-json-api';

export default function RateDriverScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    selectedRideId?: string;
  }>();
  const [rating, setRating] = useState(0);
  const activeBooking = localJsonApi.getActiveBooking();

  const selectedRide = useMemo(
    () => rideOptions.find((option) => option.id === params.selectedRideId) ?? rideOptions[0],
    [params.selectedRideId],
  );

  const tripFare = activeBooking.fare_breakdown.trip_fare;
  const tax = activeBooking.fare_breakdown.tax;
  const total = activeBooking.fare_breakdown.total;
  const selectedRideTitle = selectedRide?.nameKey ? t(selectedRide.nameKey) : 'Chauffly Go';

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.lg }]}> 
      <Pressable onPress={() => router.back()} style={styles.closeButton}>
        <MaterialCommunityIcons name="close" size={28} color={colors.textPrimary} />
      </Pressable>

      <Image source={require('../../../assets/images/avatar.png')} style={styles.avatar} />

      <Text variant="h2" weight="medium" align="center" style={styles.title}>
        How was the chauffeur?
      </Text>
      <Text variant="bodySmall" color="muted" align="center" style={styles.subtitle}>
        Assist chauffly in improving by evaluating this journey
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

      <View style={[styles.infoCard, { borderColor: colors.border }]}> 
        <View style={styles.row}>
          <Text variant="bodySmall" color="muted">Ride</Text>
          <Text variant="bodySmall" weight="medium">{selectedRideTitle}</Text>
        </View>
        <View style={styles.row}>
          <Text variant="bodySmall" color="muted">Payment</Text>
          <Text variant="bodySmall" weight="medium">Cash</Text>
        </View>
      </View>

      <View style={[styles.fareCard, { borderColor: colors.border }]}> 
        <View style={styles.row}>
          <Text variant="bodySmall" color="muted">Trip Fare (x2)</Text>
          <Text variant="bodySmall" color="muted">{tripFare}</Text>
        </View>
        <View style={styles.row}>
          <Text variant="bodySmall" color="muted">Tax (5%)</Text>
          <Text variant="bodySmall" color="muted">{tax}</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.row}>
          <Text variant="body" weight='medium'>Total</Text>
          <Text variant="h3" weight='medium'>{total}</Text>
        </View>
      </View>

      <Button
        title="Assign ranking"
        fullWidth
        navigateTo="/booking/rating-thank-you"
        navigateParams={params}
        disabled={rating === 0}
        style={[styles.submitButton]}
      />
      
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  closeButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 90,
    alignSelf: 'center',
  },
  title: {
    marginTop: spacing.lg,
  },
  subtitle: {
    marginTop: spacing.sm,
  },
  starsRow: {
    marginTop: spacing.xxl,
    flexDirection: 'row', 
    marginHorizontal: "auto",
  gap: 10

  },
  infoCard: {
    marginTop: spacing.xl,
    borderWidth: 1,
    borderRadius: 24,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  fareCard: {
    marginTop: spacing.lg,
    borderWidth: 1,
    borderRadius: 24,
    padding: spacing.lg,
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    marginVertical: spacing.sm,
  },
  submitButton: {
    marginTop: 'auto', 
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
