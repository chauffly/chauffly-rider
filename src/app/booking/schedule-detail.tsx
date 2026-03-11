import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { format } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';

import { useBookingById, useBookingCancel } from '@/api-client';
import { Text } from '@/components/common/text';
import { Button } from '@/components/common/button';
import { StackHeader } from '@/components/common/stack-header';
import LocationPinGreen from '@/components/svg/LocationPinGreen';
import LocationPinRed from '@/components/svg/LocationPinRed';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { asArray, asRecord, asString } from '@/utils/api-helpers';
import { formatNairaAmount } from '@/utils/currency';

export default function ScheduleDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [cancelError, setCancelError] = useState('');

  const params = useLocalSearchParams<{
    bookingId?: string;
    pickupDate?: string;
    pickupTime?: string;
  }>();
  const bookingId = params.bookingId ?? '';

  const { data: bookingDetailData } = useBookingById(bookingId, {
    enabled: Boolean(bookingId)
  });
  const cancelBooking = useBookingCancel();

  const detailRecord = asRecord(bookingDetailData);
  const booking = asRecord(detailRecord.booking);
  const fare = asRecord(detailRecord.fare);
  const driver = asRecord(detailRecord.driver);
  const vehicle = asRecord(driver.vehicle);
  const stops = asArray<Record<string, unknown>>(detailRecord.stops);

  const pickupAtRaw = asString(booking.scheduledAt || booking.createdAt);
  const pickupAt = pickupAtRaw ? new Date(pickupAtRaw) : null;
  const dateDisplay = pickupAt ? format(pickupAt, 'EEE, MMM d - h:mm a') : '--';
  const pickupTime = pickupAt ? format(pickupAt, 'h:mm a') : '--';
  const detailDate = pickupAt ? format(pickupAt, 'd, MMM, yyyy') : '--';

  const lastStop = stops.length > 0 ? asRecord(stops[stops.length - 1]) : {};
  const pickupName = asString(booking.pickupName, asString(booking.pickupAddress, '--'));
  const pickupAddress = asString(booking.pickupAddress, '--');
  const destinationName = asString(lastStop.name, asString(lastStop.address, '--'));
  const destinationAddress = asString(lastStop.address, '--');

  const dropoffTimeRaw = asString(lastStop.arrivedAt);
  const dropoffTime = dropoffTimeRaw ? format(new Date(dropoffTimeRaw), 'h:mm a') : '--';

  const driverName = `${asString(driver.firstName)} ${asString(driver.lastName)}`.trim() || 'Awaiting driver';
  const driverRating = asString(driver.rating, '--');
  const vehicleName = `${asString(vehicle.make)} ${asString(vehicle.model)}`.trim() || '--';

  const totalFare = formatNairaAmount(fare.total);
  const tripFare = formatNairaAmount(fare.tripFare);
  const tax = formatNairaAmount(fare.tax);

  const handleCancelRide = async () => {
    if (!bookingId || cancelBooking.isPending) {
      return;
    }

    setCancelError('');
    try {
      await cancelBooking.mutateAsync({
        bookingId,
        reason: 'Cancelled by rider'
      });
      router.replace('/(tabs)/rides');
    } catch (error) {
      setCancelError(error instanceof Error ? error.message : 'Unable to cancel ride right now.');
    }
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
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text variant="h3" weight="semiBold" align="center">
            {t('booking.scheduled_ride_title')}
          </Text>
          <Text variant="bodySmall" color="muted" align="center" style={styles.dateSubtitle}>
            {dateDisplay}
          </Text>
          <View style={[styles.notifyBanner, { backgroundColor: colors.primary }]}>
            <MaterialCommunityIcons name="information" size={18} color="#FFFFFF" />
            <Text variant="bodySmall" style={{ color: '#FFFFFF', flex: 1 }}>
              {t('booking.notify_when_driver_found')}
            </Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.driverRow}>
            <View style={styles.driverLeft}>
              <View style={[styles.driverAvatar, { backgroundColor: colors.border }]}>
                <MaterialCommunityIcons name="account" size={28} color={colors.textSecondary} />
              </View>
              <View>
                <View style={styles.driverNameRow}>
                  <Text variant="body" weight="semiBold">
                    {driverName}
                  </Text>
                  {driverRating !== '--' ? (
                    <>
                      <MaterialCommunityIcons name="star" size={14} color={colors.primary} />
                      <Text variant="bodySmall">{driverRating}</Text>
                    </>
                  ) : null}
                </View>
                <Text variant="caption" color="muted">
                  {vehicleName}
                </Text>
              </View>
            </View>
            <View style={[styles.chatIcon, { borderColor: colors.border }]}>
              <MaterialCommunityIcons name="chat-outline" size={20} color={colors.textSecondary} />
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.routeContainer}>
            <View style={styles.routeIconColumn}>
              <LocationPinGreen size={18} />
              <View style={[styles.routeDash, { borderLeftColor: colors.border }]} />
              <LocationPinRed size={18} />
            </View>
            <View style={styles.routeDetails}>
              <View style={styles.routeStop}>
                <View style={styles.routeStopText}>
                  <Text variant="body" weight="medium">
                    {pickupName}
                  </Text>
                  <Text variant="caption" color="muted">
                    {pickupAddress}
                  </Text>
                </View>
                <Text variant="bodySmall" color="muted">
                  {pickupTime}
                </Text>
              </View>
              <View style={styles.routeStop}>
                <View style={styles.routeStopText}>
                  <Text variant="body" weight="medium">
                    {destinationName}
                  </Text>
                  <Text variant="caption" color="muted">
                    {destinationAddress}
                  </Text>
                </View>
                <Text variant="bodySmall" color="muted">
                  {dropoffTime}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.detailRow}>
            <Text variant="body" color="muted">
              {t('booking.status_label')}
            </Text>
            <Text variant="body" weight="medium">
              {t('booking.scheduled_status')}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text variant="body" color="muted">
              {t('booking.payment_label')}
            </Text>
            <Text variant="body" weight="medium">
              {totalFare}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text variant="body" color="muted">
              {t('booking.date_label')}
            </Text>
            <Text variant="body" weight="medium">
              {detailDate}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text variant="body" color="muted">
              {t('booking.time_label')}
            </Text>
            <Text variant="body" weight="medium">
              {pickupTime}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text variant="body" color="muted">
              {t('booking.booking_id_label')}
            </Text>
            <Text variant="body" weight="medium">
              {asString(booking.id, bookingId || '--')}
            </Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.detailRow}>
            <Text variant="body" color="muted">
              {t('booking.trip_earning_x2')}
            </Text>
            <Text variant="body" weight="medium">
              {tripFare}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text variant="body" color="muted">
              {t('booking.app_deduction_5')}
            </Text>
            <Text variant="body" weight="medium">
              {tax}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.detailRow}>
            <Text variant="body" weight="semiBold">
              {t('booking.total')}
            </Text>
            <Text variant="body" weight="semiBold">
              {totalFare}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {cancelError ? (
          <Text variant="bodySmall" color="error" style={styles.cancelError}>
            {cancelError}
          </Text>
        ) : null}
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
  dateSubtitle: {
    marginTop: spacing.xs
  },
  notifyBanner: {
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  driverLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md
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
    flex: 1,
    borderLeftWidth: 1.5,
    borderStyle: 'dashed',
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
    gap: spacing.md
  },
  divider: {
    height: 1
  },
  footer: {
    marginTop: spacing.lg
  },
  cancelError: {
    marginBottom: spacing.sm
  }
});
