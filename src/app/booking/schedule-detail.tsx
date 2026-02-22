import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { format } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Text } from '@/components/common/text';
import { Button } from '@/components/common/button';
import { StackHeader } from '@/components/common/stack-header';
import LocationPinGreen from '@/components/svg/LocationPinGreen';
import LocationPinRed from '@/components/svg/LocationPinRed';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { localJsonApi } from '@/api/local-json-api';

export default function ScheduleDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const activeBooking = localJsonApi.getActiveBooking();
  const fallbackDriver = localJsonApi.getDriverById(activeBooking.driver_id);

  const params = useLocalSearchParams<{
    originName?: string;
    originAddress?: string;
    destinations?: string;
    pickupDate?: string;
    pickupTime?: string;
    estimatedDurationMinutes?: string;
    driverId?: string;
    fare?: string;
    stops?: string;
    schedule?: string;
  }>();

  const driver = params.driverId
    ? localJsonApi.getDriverById(params.driverId)
    : fallbackDriver;
  const rideStops = params.stops ? JSON.parse(params.stops) : null;
  const destinations = params.destinations ? JSON.parse(params.destinations) : [];
  const pickupDate = params.pickupDate;
  const pickupTime = params.pickupTime;
  const pickupDateTime = pickupDate && pickupTime
    ? new Date(`${pickupDate}T${pickupTime}:00`)
    : new Date();
  const durationMinutes = params.estimatedDurationMinutes
    ? Number(params.estimatedDurationMinutes)
    : 45;

  const pickupTimeDisplay = rideStops
    ? rideStops[0]?.time || '10:00 AM'
    : format(pickupDateTime, 'h:mm a');
  const dropoffDateTime = new Date(pickupDateTime.getTime() + durationMinutes * 60000);
  const dropoffTimeDisplay = rideStops
    ? rideStops[rideStops.length - 1]?.time || '10:08 AM'
    : format(dropoffDateTime, 'h:mm a');
  const dateDisplay = params.schedule || format(pickupDateTime, 'EEE, MMM d - h:mm a');
  const detailDateDisplay = pickupDate
    ? format(pickupDateTime, 'd, MMM, yyyy')
    : '14, Dec, 2025';

  const bookingId = 'BKG22942';
  const transactionId = 'TRX1222240942';
  const fare = params.fare || activeBooking.fare_breakdown.total;
  const tripFare = fare;
  const tax = activeBooking.fare_breakdown.tax;
  const total = fare;

  const originName = rideStops ? rideStops[0]?.title : (params.originName || activeBooking.route_defaults.origin_name);
  const originAddress = rideStops ? rideStops[0]?.subtitle : (params.originAddress || activeBooking.route_defaults.origin_address);
  const destName = rideStops
    ? rideStops[rideStops.length - 1]?.title
    : (destinations[destinations.length - 1]?.name || activeBooking.route_defaults.destination_name);
  const destAddress = rideStops
    ? rideStops[rideStops.length - 1]?.subtitle
    : (destinations[destinations.length - 1]?.address || activeBooking.route_defaults.destination_address);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + spacing.lg,
          paddingBottom: insets.bottom + spacing.lg,
        },
      ]}
    >
      <StackHeader
        title="Details"
        align="center"
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Scheduled Ride Header */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text variant="h3" weight="bold" align="center">
            Your Scheduled Ride
          </Text>
          <Text variant="bodySmall" color="muted" align="center" style={styles.dateSubtitle}>
            {dateDisplay}
          </Text>
          <View style={[styles.notifyBanner, { backgroundColor: colors.primary }]}>
            <MaterialCommunityIcons name="information" size={18} color="#FFFFFF" />
            <Text variant="bodySmall" style={{ color: '#FFFFFF', flex: 1 }}>
              We will notify you when the driver is found
            </Text>
          </View>
        </View>

        {/* Driver Info */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.driverRow}>
            <View style={styles.driverLeft}>
              <View style={[styles.driverAvatar, { backgroundColor: colors.border }]}>
                <MaterialCommunityIcons name="account" size={28} color={colors.textSecondary} />
              </View>
              <View>
                <View style={styles.driverNameRow}>
                  <Text variant="body" weight="semiBold">
                    {driver.display_name}
                  </Text>
                  <MaterialCommunityIcons name="star" size={14} color={colors.primary} />
                  <Text variant="bodySmall">{driver.rating.toFixed(1)}</Text>
                  {driver.is_verified && (
                    <View style={[styles.verifiedBadge, { backgroundColor: '#1DA1F2' }]}>
                      <MaterialCommunityIcons name="check" size={10} color="#FFFFFF" />
                    </View>
                  )}
                </View>
                <Text variant="caption" color="muted">
                  {driver.vehicle.display_name}
                </Text>
              </View>
            </View>
            <View style={[styles.chatIcon, { borderColor: colors.border }]}>
              <MaterialCommunityIcons name="chat-outline" size={20} color={colors.textSecondary} />
            </View>
          </View>
        </View>

        {/* Route */}
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
                    {originName}
                  </Text>
                  <Text variant="caption" color="muted">
                    {originAddress}
                  </Text>
                </View>
                <Text variant="bodySmall" color="muted">{pickupTimeDisplay}</Text>
              </View>
              <View style={styles.routeStop}>
                <View style={styles.routeStopText}>
                  <Text variant="body" weight="medium">
                    {destName}
                  </Text>
                  <Text variant="caption" color="muted">
                    {destAddress}
                  </Text>
                </View>
                <Text variant="bodySmall" color="muted">{dropoffTimeDisplay}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Booking Details */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.detailRow}>
            <Text variant="body" color="muted">Status</Text>
            <Text variant="body" weight="medium">Scheduled</Text>
          </View>
          <View style={styles.detailRow}>
            <Text variant="body" color="muted">Payment</Text>
            <Text variant="body" weight="medium">{fare}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text variant="body" color="muted">Date</Text>
            <Text variant="body" weight="medium">{detailDateDisplay}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text variant="body" color="muted">Time</Text>
            <Text variant="body" weight="medium">{pickupTimeDisplay}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text variant="body" color="muted">Transaction</Text>
            <Text variant="body" weight="medium">{transactionId}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text variant="body" color="muted">Booking ID</Text>
            <Text variant="body" weight="medium">{bookingId}</Text>
          </View>
        </View>

        {/* Fare Breakdown */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.detailRow}>
            <Text variant="body" color="muted">Trip Earning (x2)</Text>
            <Text variant="body" weight="medium">{tripFare}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text variant="body" color="muted">App Deduction (5%)</Text>
            <Text variant="body" weight="medium">{tax}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.detailRow}>
            <Text variant="body" weight="semiBold">Total</Text>
            <Text variant="body" weight="semiBold">{total}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Cancel Ride"
          variant="outline"
          fullWidth
          onPress={() => router.back()}
          textStyle={{ color: colors.error }}
          style={{ borderColor: colors.error }}
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
    paddingBottom: spacing.lg,
  },
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  dateSubtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  notifyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  driverLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  routeIconColumn: {
    alignItems: 'center',
    paddingTop: spacing.xs,
  },
  routeDash: {
    flex: 1,
    borderLeftWidth: 1.5,
    borderStyle: 'dashed',
    marginVertical: spacing.xs,
  },
  routeDetails: {
    flex: 1,
    gap: spacing.xl,
  },
  routeStop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  routeStopText: {
    flex: 1,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  divider: {
    height: 1,
    marginVertical: spacing.sm,
  },
  footer: {
    paddingTop: spacing.md,
  },
});
