import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';

import { useBookingById } from '@/api-client';
import { Button } from '@/components/common/button';
import { Text } from '@/components/common/text';
import { StackHeader } from '@/components/common/stack-header';
import LocationPinGreen from '@/components/svg/LocationPinGreen';
import LocationPinRed from '@/components/svg/LocationPinRed';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { asArray, asRecord, asString } from '@/utils/api-helpers';
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
  const pickupTime = asString(booking.createdAt)
    ? format(new Date(asString(booking.createdAt)), 'h:mm a')
    : '--';

  const lastStop = stops.length > 0 ? asRecord(stops[stops.length - 1]) : {};
  const destinationAddress = asString(lastStop.address, '--');
  const destinationName = asString(lastStop.name, destinationAddress);
  const destinationTime = asString(lastStop.arrivedAt)
    ? format(new Date(asString(lastStop.arrivedAt)), 'h:mm a')
    : '--';

  const driverName = `${asString(driver.firstName)} ${asString(driver.lastName)}`.trim() || 'Driver';
  const driverRating = asString(driver.rating, '--');
  const vehicleName = `${asString(vehicle.make)} ${asString(vehicle.model)}`.trim() || '--';
  const bookingDate = asString(booking.createdAt)
    ? format(new Date(asString(booking.createdAt)), 'd, MMM, yyyy')
    : '--';

  const totalFare = formatNairaAmount(fare.total);
  const tripFare = formatNairaAmount(fare.tripFare);
  const tax = formatNairaAmount(fare.tax);
  const bookingRef = asString(booking.id, bookingId || '--');
  const transactionRef = asString(fare.transactionId, '--');

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
              <View style={[styles.routeDash, { borderLeftColor: colors.border }]} />
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
            <Text variant="body" weight="medium">
              {bookingRef}
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
        <Button translationKey="booking.share_receipt" variant="outline" fullWidth onPress={() => {}} />
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
  divider: {
    height: 1
  },
  footer: {
    marginTop: spacing.lg
  }
});
