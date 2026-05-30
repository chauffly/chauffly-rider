import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { format } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

import { useBookingById } from '@/api-client';
import { Text } from '@/components/common/text';
import { Button } from '@/components/common/button';
import { StackHeader } from '@/components/common/stack-header';
import LocationPinGreen from '@/components/svg/LocationPinGreen';
import LocationPinRed from '@/components/svg/LocationPinRed';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { asArray, asRecord, asString, parseDateTimeString } from '@/utils/api-helpers';

export default function CancelledDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const params = useLocalSearchParams<{ bookingId?: string }>();
  const bookingId = params.bookingId ?? '';

  const { data: bookingDetailData } = useBookingById(bookingId, {
    enabled: Boolean(bookingId)
  });

  const detailRecord = asRecord(bookingDetailData);
  const booking = asRecord(detailRecord.booking);
  const stops = asArray<Record<string, unknown>>(detailRecord.stops);

  const lastStop = stops.length > 0 ? asRecord(stops[stops.length - 1]) : {};
  const pickupName = asString(booking.pickupName, asString(booking.pickupAddress, '--'));
  const pickupAddress = asString(booking.pickupAddress, '--');
  const destinationName = asString(lastStop.name, asString(lastStop.address, '--'));
  const destinationAddress = asString(lastStop.address, '--');

  const cancellationReason =
    asString(booking.cancellationReason ?? booking.cancellation_reason, '');
  const cancelledAtRaw = asString(booking.cancelledAt ?? booking.cancelled_at, '');
  const cancelledAt = parseDateTimeString(cancelledAtRaw);
  const cancelledAtDisplay = cancelledAt ? format(cancelledAt, 'EEE, MMM d • h:mm a') : '--';

  const bookingRef = asString(booking.id, bookingId || '--');

  const handleCopyBookingId = async () => {
    if (!bookingRef || bookingRef === '--') return;
    await Clipboard.setStringAsync(bookingRef);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + spacing.lg,
          paddingBottom: insets.bottom + spacing.lg
        }
      ]}
    >
      <StackHeader title="Ride Cancelled" align="center" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status card */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.statusRow}>
            <View style={[styles.iconCircle, { backgroundColor: `${colors.error}22` }]}>
              <MaterialCommunityIcons name="cancel" size={28} color={colors.error} />
            </View>
            <View style={styles.statusText}>
              <Text variant="h3" weight="semiBold" style={{ color: colors.error }}>
                Ride Cancelled
              </Text>
              <Text variant="caption" color="muted">{cancelledAtDisplay}</Text>
            </View>
          </View>
          {cancellationReason ? (
            <View style={[styles.reasonBanner, { backgroundColor: `${colors.error}11` }]}>
              <Text variant="bodySmall" color="muted">Reason: {cancellationReason}</Text>
            </View>
          ) : null}
        </View>

        {/* Route card */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text variant="bodySmall" weight="medium" color="muted" style={styles.sectionLabel}>
            Planned Route
          </Text>
          <View style={styles.routeContainer}>
            <View style={styles.routeIconColumn}>
              <LocationPinGreen size={18} />
              <View style={[styles.routeDash, { backgroundColor: colors.textSecondary, opacity: 0.35 }]} />
              <LocationPinRed size={18} />
            </View>
            <View style={styles.routeDetails}>
              <View style={styles.routeStop}>
                <View style={styles.routeStopText}>
                  <Text variant="body" weight="medium">{pickupName}</Text>
                  <Text variant="caption" color="muted">{pickupAddress}</Text>
                </View>
              </View>
              <View style={styles.routeStop}>
                <View style={styles.routeStopText}>
                  <Text variant="body" weight="medium">{destinationName}</Text>
                  <Text variant="caption" color="muted">{destinationAddress}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Booking ID card */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.detailRow}>
            <Text variant="body" color="muted">Booking ID</Text>
            <Pressable onPress={handleCopyBookingId} style={styles.bookingIdPressable}>
              <Text variant="body" weight="medium" numberOfLines={1} ellipsizeMode="middle">
                {bookingRef}
              </Text>
              <MaterialCommunityIcons name="content-copy" size={16} color={colors.textSecondary} />
            </Pressable>
          </View>
        </View>

        {/* Refund note */}
        <View style={[styles.refundBanner, { backgroundColor: colors.surface }]}>
          <MaterialCommunityIcons name="information-outline" size={18} color={colors.textSecondary} />
          <Text variant="bodySmall" color="muted" style={{ flex: 1 }}>
            If payment was made, a refund will be processed within 3-5 business days.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Back to Rides"
          variant="outline"
          fullWidth
          onPress={() => router.replace('/(tabs)/rides')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg
  },
  content: {
    gap: spacing.md,
    paddingBottom: spacing.lg
  },
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  statusText: {
    gap: spacing.xs,
    flex: 1
  },
  reasonBanner: {
    marginTop: spacing.md,
    padding: spacing.sm,
    borderRadius: borderRadius.sm
  },
  sectionLabel: {
    marginBottom: spacing.md
  },
  routeContainer: {
    flexDirection: 'row',
    gap: spacing.md
  },
  routeIconColumn: {
    alignItems: 'center',
    paddingTop: spacing.xs
  },
  routeDash: {
    width: 2,
    flexGrow: 1,
    minHeight: 28,
    borderRadius: 999,
    marginVertical: spacing.xs
  },
  routeDetails: {
    flex: 1,
    gap: spacing.xl
  },
  routeStop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm
  },
  routeStopText: {
    flex: 1
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md
  },
  bookingIdPressable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xs,
    minWidth: 0
  },
  refundBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md
  },
  footer: {
    marginTop: spacing.lg
  }
});
