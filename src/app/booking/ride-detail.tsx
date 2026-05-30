import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { format } from 'date-fns';
import { useRef } from 'react';

import { useBookingById } from '@/api-client';
import { Button } from '@/components/common/button';
import { Text } from '@/components/common/text';
import { StackHeader } from '@/components/common/stack-header';
import LocationPinGreen from '@/components/svg/LocationPinGreen';
import LocationPinRed from '@/components/svg/LocationPinRed';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { asArray, asRecord, asString, parseDateTimeString } from '@/utils/api-helpers';
import { formatNairaAmount } from '@/utils/currency';

type RideStatus = 'Completed' | 'Cancelled' | 'Ongoing';

const mapStatusLabel = (status: string): RideStatus => {
  if (status === 'cancelled') return 'Cancelled';
  if (status === 'in_progress' || status === 'driver_heading' || status === 'driver_arrived') {
    return 'Ongoing';
  }
  return 'Completed';
};

export default function RideDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const receiptRef = useRef<View>(null);

  const params = useLocalSearchParams<{
    bookingId?: string;
    rideStatus?: string;
  }>();

  const bookingId = params.bookingId ?? '';
  const { data: bookingDetailData } = useBookingById(bookingId, {
    enabled: Boolean(bookingId)
  });

  const detailRecord = asRecord(bookingDetailData);
  const booking = asRecord(detailRecord.booking);
  const fare = asRecord(detailRecord.fare);
  const driver = asRecord(detailRecord.driver);
  const vehicle = asRecord(driver.vehicle);
  const stops = asArray<Record<string, unknown>>(detailRecord.stops);

  const rideStatus = params.rideStatus
    ? (params.rideStatus as RideStatus)
    : mapStatusLabel(asString(booking.status, 'completed'));

  const statusColor =
    rideStatus === 'Completed'
      ? colors.success
      : rideStatus === 'Cancelled'
        ? colors.error
        : colors.primary;

  const pickupAddress = asString(booking.pickupAddress, 'Pickup');
  const pickupName = asString(booking.pickupName, pickupAddress);
  const pickupTime = (() => {
    const d = parseDateTimeString(asString(booking.createdAt));
    return d ? format(d, 'h:mm a') : '--';
  })();

  const lastStop = stops.length > 0 ? asRecord(stops[stops.length - 1]) : {};
  const destinationAddress = asString(lastStop.address, '--');
  const destinationName = asString(lastStop.name, destinationAddress);
  const destinationTime = (() => {
    const d = parseDateTimeString(asString(lastStop.arrivedAt));
    return d ? format(d, 'h:mm a') : '--';
  })();

  const driverName = `${asString(driver.firstName)} ${asString(driver.lastName)}`.trim() || 'Driver';
  const driverRating = asString(driver.rating, '--');
  const vehicleName = `${asString(vehicle.make)} ${asString(vehicle.model)}`.trim() || '--';
  const bookingDateParsed = parseDateTimeString(asString(booking.createdAt));
  const bookingDate = bookingDateParsed ? format(bookingDateParsed, 'd MMM yyyy') : '--';

  const totalFare = formatNairaAmount(fare.total);
  const tripFare = formatNairaAmount(fare.tripFare);
  const tax = formatNairaAmount(fare.tax);
  const bookingRef = asString(booking.id, bookingId || '--');
  const transactionRef = asString(fare.transactionId, '--');

  const handleCopyBookingId = async () => {
    if (!bookingRef || bookingRef === '--') return;
    await Clipboard.setStringAsync(bookingRef);
  };

  const handleShareReceipt = async () => {
    try {
      const uri = await captureRef(receiptRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile'
      });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Share Receipt'
        });
      }
    } catch {
      // Sharing cancelled or failed silently
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
          <View style={styles.vehicleRow}>
            <View>
              <Text variant="body" weight="medium">
                {vehicleName}
              </Text>
              <Text variant="caption" color="muted">
                {asString(booking.status, '--')}
              </Text>
            </View>
            <Text variant="body" weight="medium">
              {totalFare}
            </Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.routeContainer}>
              <View style={styles.routeIconColumn}>
                <LocationPinGreen size={18} />
                <View
                  style={[
                    styles.routeDash,
                    { backgroundColor: colors.textSecondary, opacity: 0.35 }
                  ]}
                />
                <LocationPinRed size={18} />
              </View>
            <View style={styles.routeDetails}>
              <View style={styles.routeStop}>
                <View style={styles.routeStopText}>
                  <Text variant="body" weight="semiBold">
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
                  <Text variant="body" weight="semiBold">
                    {destinationName}
                  </Text>
                  <Text variant="caption" color="muted">
                    {destinationAddress}
                  </Text>
                </View>
                <Text variant="bodySmall" color="muted">
                  {destinationTime}
                </Text>
              </View>
            </View>
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
                  <MaterialCommunityIcons name="star" size={14} color={colors.primary} />
                  <Text variant="bodySmall">{driverRating}</Text>
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
          <View style={styles.detailRow}>
            <Text variant="body" color="muted">
              {t('booking.status_label')}
            </Text>
            <Text variant="body" weight="medium" style={{ color: statusColor }}>
              {rideStatus}
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
              {bookingDate}
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
              {t('booking.transaction_label')}
            </Text>
            <Text variant="body" weight="medium">
              {transactionRef}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text variant="body" color="muted">
              {t('booking.booking_id_label')}
            </Text>
            <Pressable onPress={handleCopyBookingId} style={styles.bookingIdPressable}>
              <Text variant="body" weight="medium" numberOfLines={1} ellipsizeMode="middle">
                {bookingRef}
              </Text>
              <MaterialCommunityIcons name="content-copy" size={16} color={colors.textSecondary} />
            </Pressable>
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
        <Button translationKey="booking.share_receipt" variant="outline" fullWidth onPress={handleShareReceipt} />
      </View>

      {/* Off-screen receipt view for image capture */}
      <View
        ref={receiptRef}
        collapsable={false}
        style={styles.receiptCapture}
      >
        {/* Header */}
        <View style={styles.receiptHeader}>
          <Text variant="h3" weight="bold" style={{ color: '#c29d59' }}>
            Chauffly
          </Text>
          <Text variant="caption" style={{ color: '#757575' }}>
            Official Receipt
          </Text>
        </View>

        {/* Status banner */}
        <View style={[styles.receiptBanner, { backgroundColor: rideStatus === 'Completed' ? '#43A047' : rideStatus === 'Cancelled' ? '#E53935' : '#c29d59' }]}>
          <Text variant="bodySmall" weight="semiBold" style={{ color: '#FFFFFF' }}>
            {rideStatus}
          </Text>
        </View>

        {/* Route */}
        <View style={styles.receiptCard}>
          <View style={styles.receiptRouteRow}>
            <View style={[styles.receiptDot, { backgroundColor: '#43A047' }]} />
            <View style={styles.receiptRouteText}>
              <Text variant="caption" style={{ color: '#757575' }}>Pickup</Text>
              <Text variant="bodySmall" weight="semiBold" style={{ color: '#212121' }}>{pickupName}</Text>
              <Text variant="caption" style={{ color: '#757575' }}>{pickupTime}</Text>
            </View>
          </View>
          <View style={styles.receiptRouteConnector} />
          <View style={styles.receiptRouteRow}>
            <View style={[styles.receiptDot, { backgroundColor: '#E53935' }]} />
            <View style={styles.receiptRouteText}>
              <Text variant="caption" style={{ color: '#757575' }}>Drop-off</Text>
              <Text variant="bodySmall" weight="semiBold" style={{ color: '#212121' }}>{destinationName}</Text>
              <Text variant="caption" style={{ color: '#757575' }}>{destinationTime}</Text>
            </View>
          </View>
        </View>

        {/* Driver */}
        <View style={styles.receiptCard}>
          <Text variant="caption" weight="medium" style={{ color: '#757575', marginBottom: 6 }}>Driver</Text>
          <View style={styles.receiptRow}>
            <Text variant="bodySmall" weight="semiBold" style={{ color: '#212121' }}>{driverName}</Text>
            <Text variant="bodySmall" style={{ color: '#757575' }}>{vehicleName}</Text>
          </View>
        </View>

        {/* Details */}
        <View style={styles.receiptCard}>
          <View style={[styles.receiptDetailRow, { marginBottom: 4 }]}>
            <Text variant="caption" style={{ color: '#757575' }}>Date</Text>
            <Text variant="caption" weight="medium" style={{ color: '#212121' }}>{bookingDate}</Text>
          </View>
          <View style={[styles.receiptDetailRow, { marginBottom: 4 }]}>
            <Text variant="caption" style={{ color: '#757575' }}>Transaction ID</Text>
            <Text variant="caption" weight="medium" style={{ color: '#212121' }}>{transactionRef}</Text>
          </View>
          <View style={styles.receiptDetailRow}>
            <Text variant="caption" style={{ color: '#757575' }}>Booking ID</Text>
            <Text variant="caption" weight="medium" style={{ color: '#212121' }} numberOfLines={1} ellipsizeMode="middle">
              {bookingRef}
            </Text>
          </View>
        </View>

        {/* Fare breakdown */}
        <View style={styles.receiptCard}>
          <View style={[styles.receiptDetailRow, { marginBottom: 4 }]}>
            <Text variant="caption" style={{ color: '#757575' }}>Trip Fare</Text>
            <Text variant="caption" weight="medium" style={{ color: '#212121' }}>{tripFare}</Text>
          </View>
          <View style={[styles.receiptDetailRow, { marginBottom: 8 }]}>
            <Text variant="caption" style={{ color: '#757575' }}>Tax & Fees</Text>
            <Text variant="caption" weight="medium" style={{ color: '#212121' }}>{tax}</Text>
          </View>
          <View style={[styles.receiptDivider, { backgroundColor: '#E5E7EB' }]} />
          <View style={[styles.receiptDetailRow, { marginTop: 8 }]}>
            <Text variant="bodySmall" weight="bold" style={{ color: '#212121' }}>Total</Text>
            <Text variant="bodySmall" weight="bold" style={{ color: '#c29d59' }}>{totalFare}</Text>
          </View>
        </View>

        {/* Footer */}
        <Text variant="caption" style={{ color: '#BDBDBD', textAlign: 'center', marginTop: 8 }}>
          Thank you for riding with Chauffly
        </Text>
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
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
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
  divider: {
    height: 1
  },
  footer: {
    marginTop: spacing.lg
  },
  // Off-screen receipt capture view
  receiptCapture: {
    position: 'absolute',
    top: 10000,
    left: 0,
    width: 360,
    backgroundColor: '#F7F7F7',
    padding: spacing.lg,
    gap: spacing.sm
  },
  receiptHeader: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: 2
  },
  receiptBanner: {
    borderRadius: borderRadius.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.lg,
    alignSelf: 'center'
  },
  receiptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.md
  },
  receiptRouteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm
  },
  receiptDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4
  },
  receiptRouteText: {
    flex: 1,
    gap: 2
  },
  receiptRouteConnector: {
    width: 2,
    height: 16,
    backgroundColor: '#E5E7EB',
    marginLeft: 4,
    marginVertical: 4
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  receiptDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  receiptDivider: {
    height: 1
  }
});
