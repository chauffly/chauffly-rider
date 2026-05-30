import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { format } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

import { useBookingById, useBookingCancel } from '@/api-client';
import { Text } from '@/components/common/text';
import { Button } from '@/components/common/button';
import { StackHeader } from '@/components/common/stack-header';
import LocationPinGreen from '@/components/svg/LocationPinGreen';
import LocationPinRed from '@/components/svg/LocationPinRed';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { asArray, asRecord, asString, parseDateTimeString } from '@/utils/api-helpers';
import { formatNairaAmount } from '@/utils/currency';

export default function ScheduleDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [cancelError, setCancelError] = useState('');
  const [canStart, setCanStart] = useState(false);
  const [timeUntilStart, setTimeUntilStart] = useState('');

  const params = useLocalSearchParams<{ bookingId?: string }>();
  const bookingId = params.bookingId ?? '';

  const { data: bookingDetailData } = useBookingById(bookingId, {
    enabled: Boolean(bookingId),
    refetchInterval: 30000
  });
  const cancelBooking = useBookingCancel();

  const detailRecord = asRecord(bookingDetailData);
  const booking = asRecord(detailRecord.booking);
  const fare = asRecord(detailRecord.fare);
  const driver = asRecord(detailRecord.driver);
  const vehicle = asRecord(driver.vehicle);
  const stops = asArray<Record<string, unknown>>(detailRecord.stops);

  const scheduledAtRaw = asString(booking.scheduledAt ?? booking.scheduled_at, '');
  const scheduledAt = parseDateTimeString(scheduledAtRaw);
  const dateDisplay = scheduledAt ? format(scheduledAt, 'EEE, MMM d • h:mm a') : '--';
  const pickupTime = scheduledAt ? format(scheduledAt, 'h:mm a') : '--';

  const lastStop = stops.length > 0 ? asRecord(stops[stops.length - 1]) : {};
  const pickupName = asString(booking.pickupName, asString(booking.pickupAddress, '--'));
  const pickupAddress = asString(booking.pickupAddress, '--');
  const destinationName = asString(lastStop.name, asString(lastStop.address, '--'));
  const destinationAddress = asString(lastStop.address, '--');

  const driverName = `${asString(driver.firstName)} ${asString(driver.lastName)}`.trim() || '';
  const hasDriver = Boolean(driverName);
  const driverRating = asString(driver.rating, '--');
  const vehicleName = `${asString(vehicle.make)} ${asString(vehicle.model)}`.trim() || '--';

  const estimatedFare = formatNairaAmount(Number(fare.estimatedFare ?? fare.total ?? 0));
  const bookingRef = asString(booking.id, bookingId || '--');
  const status = asString(booking.status, '--');
  const statusDisplay = status.replace(/_/g, ' ');

  const handleCopyBookingId = async () => {
    if (!bookingRef || bookingRef === '--') return;
    await Clipboard.setStringAsync(bookingRef);
  };

  useEffect(() => {
    if (!scheduledAtRaw) return;
    const check = () => {
      const now = Date.now();
      const parsed = parseDateTimeString(scheduledAtRaw);
      if (!parsed) return;
      const scheduled = parsed.getTime();
      const diff = scheduled - now;
      setCanStart(diff <= 5 * 60 * 1000 && diff > -10 * 60 * 1000);
      if (diff > 0) {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeUntilStart(`${mins}:${secs.toString().padStart(2, '0')}`);
      } else {
        setTimeUntilStart('');
      }
    };
    check();
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, [scheduledAtRaw]);

  const handleCancelRide = async () => {
    if (!bookingId || cancelBooking.isPending) return;
    setCancelError('');
    try {
      await cancelBooking.mutateAsync({ bookingId, reason: 'Cancelled by rider' });
      router.replace('/(tabs)/rides');
    } catch (error) {
      setCancelError(error instanceof Error ? error.message : 'Unable to cancel ride right now.');
    }
  };

  const handleStartRide = () => {
    if (!bookingId || !canStart) return;
    router.push({
      pathname: '/booking/driver-accepts',
      params: { bookingId, fromScheduledStart: 'true' }
    });
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
      <StackHeader translationKey="booking.details_title" align="center" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Scheduled time card */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.scheduledTimeRow}>
            <MaterialCommunityIcons name="calendar-clock" size={32} color={colors.primary} />
            <View style={styles.scheduledTimeText}>
              <Text variant="caption" color="muted">Scheduled Pickup</Text>
              <Text variant="h3" weight="semiBold">{dateDisplay}</Text>
            </View>
          </View>
        </View>

        {/* Driver card */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.driverRow}>
            <View style={styles.driverLeft}>
              <View style={[styles.driverAvatar, { backgroundColor: colors.border }]}>
                <MaterialCommunityIcons name="account" size={28} color={colors.textSecondary} />
              </View>
              <View>
                {hasDriver ? (
                  <>
                    <View style={styles.driverNameRow}>
                      <Text variant="body" weight="semiBold">{driverName}</Text>
                      {driverRating !== '--' ? (
                        <>
                          <MaterialCommunityIcons name="star" size={14} color={colors.primary} />
                          <Text variant="bodySmall">{driverRating}</Text>
                        </>
                      ) : null}
                    </View>
                    <Text variant="caption" color="muted">{vehicleName}</Text>
                  </>
                ) : (
                  <>
                    <Text variant="body" weight="semiBold">Driver will be matched soon</Text>
                    <Text variant="caption" color="muted">You will be notified when a driver is assigned</Text>
                  </>
                )}
              </View>
            </View>
            {hasDriver ? (
              <View style={[styles.chatIcon, { borderColor: colors.border }]}>
                <MaterialCommunityIcons name="chat-outline" size={20} color={colors.textSecondary} />
              </View>
            ) : null}
          </View>
        </View>

        {/* Route card */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
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
                <Text variant="bodySmall" color="muted">{pickupTime}</Text>
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

        {/* Details card */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.detailRow}>
            <Text variant="body" color="muted">Status</Text>
            <Text variant="body" weight="medium" style={{ textTransform: 'capitalize' }}>{statusDisplay}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text variant="body" color="muted">Estimated Fare</Text>
            <Text variant="body" weight="medium">{estimatedFare}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text variant="body" color="muted">{t('booking.booking_id_label')}</Text>
            <Pressable onPress={handleCopyBookingId} style={styles.bookingIdPressable}>
              <Text variant="body" weight="medium" numberOfLines={1} ellipsizeMode="middle">
                {bookingRef}
              </Text>
              <MaterialCommunityIcons name="content-copy" size={16} color={colors.textSecondary} />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {cancelError ? (
          <Text variant="bodySmall" color="error" style={styles.errorText}>{cancelError}</Text>
        ) : null}
        <Button
          title={
            canStart
              ? 'Start Ride'
              : (timeUntilStart ? `Start Ride in ${timeUntilStart}` : 'Start Ride')
          }
          variant="primary"
          fullWidth
          onPress={handleStartRide}
          disabled={!canStart || !bookingId}
          style={styles.startButton}
        />
        <Button
          translationKey="booking.cancel_ride"
          variant="outline"
          fullWidth
          onPress={handleCancelRide}
          disabled={!bookingId || cancelBooking.isPending}
          title={cancelBooking.isPending ? t('common.loading') : undefined}
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
  scheduledTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md
  },
  scheduledTimeText: {
    gap: spacing.xs,
    flex: 1
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  driverLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  driverNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs
  },
  chatIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
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
    justifyContent: 'space-between',
    gap: spacing.sm
  },
  routeStopText: {
    flex: 1
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.xs
  },
  bookingIdPressable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xs,
    minWidth: 0
  },
  footer: {
    marginTop: spacing.lg,
    gap: spacing.sm
  },
  startButton: {
    marginBottom: spacing.xs
  },
  errorText: {
    marginBottom: spacing.xs
  }
});
