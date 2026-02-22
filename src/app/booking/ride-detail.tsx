import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Text } from '@/components/common/text';
import { Button } from '@/components/common/button';
import { StackHeader } from '@/components/common/stack-header';
import LocationPinGreen from '@/components/svg/LocationPinGreen';
import LocationPinRed from '@/components/svg/LocationPinRed';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { localJsonApi } from '@/api/local-json-api';

type RideStatus = 'Completed' | 'Cancelled' | 'Ongoing';

export default function RideDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const params = useLocalSearchParams<{
    rideStatus?: string;
    driverId?: string;
    fare?: string;
    stops?: string;
    vehicleName?: string;
    schedule?: string;
  }>();

  const rideStatus = (params.rideStatus || 'Completed') as RideStatus;
  const driver = localJsonApi.getDriverById(params.driverId);
  const activeBooking = localJsonApi.getActiveBooking();
  const stops = params.stops ? JSON.parse(params.stops) : [];
  const fare = params.fare || activeBooking.fare_breakdown.total;
  const vehicleName = params.vehicleName || driver.vehicle.display_name;
  const schedule = params.schedule || 'Today, Dec 14';

  const tripFare = fare;
  const tax = activeBooking.fare_breakdown.tax;
  const total = fare;
  const transactionId = 'TRX1222240942';
  const bookingId = 'BKG22942';

  const dateMatch = schedule.match(/(\w+),\s*(\w+)\s+(\d+)/);
  const detailDate = dateMatch ? `${dateMatch[3]}, ${dateMatch[2]}, 2025` : '14, Dec, 2025';
  const firstStopTime = stops.length > 0 ? stops[0].time : '10:00 AM';

  const statusColor =
    rideStatus === 'Completed'
      ? colors.success
      : rideStatus === 'Cancelled'
        ? colors.error
        : colors.primary;

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
      <StackHeader title="Details" align="center" onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Vehicle Info */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.vehicleRow}>
            <View>
              <Text variant="body" weight="medium">
                {vehicleName}
              </Text>
              <Text variant="caption" color="muted">
                {activeBooking.trip_metrics.duration_text}
              </Text>
            </View>
            <Text variant="body" weight="medium">
              {fare}
            </Text>
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
                  <Text variant="body" weight="semiBold">
                    {stops[0]?.title || activeBooking.route_defaults.origin_name}
                  </Text>
                  <Text variant="caption" color="muted">
                    {stops[0]?.subtitle || activeBooking.route_defaults.origin_address}
                  </Text>
                </View>
                <Text variant="bodySmall" color="muted">
                  {stops[0]?.time || '10:00 AM'}
                </Text>
              </View>
              <View style={styles.routeStop}>
                <View style={styles.routeStopText}>
                  <Text variant="body" weight="semiBold">
                    {stops[stops.length - 1]?.title || activeBooking.route_defaults.destination_name}
                  </Text>
                  <Text variant="caption" color="muted">
                    {stops[stops.length - 1]?.subtitle || activeBooking.route_defaults.destination_address}
                  </Text>
                </View>
                <Text variant="bodySmall" color="muted">
                  {stops[stops.length - 1]?.time || '10:08 AM'}
                </Text>
              </View>
            </View>
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

        {/* Booking Details */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.detailRow}>
            <Text variant="body" color="muted">Status</Text>
            <Text variant="body" weight="medium" style={{ color: statusColor }}>
              {rideStatus}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text variant="body" color="muted">Payment</Text>
            <Text variant="body" weight="medium">{fare}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text variant="body" color="muted">Date</Text>
            <Text variant="body" weight="medium">{detailDate}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text variant="body" color="muted">Time</Text>
            <Text variant="body" weight="medium">{firstStopTime}</Text>
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
          title="Share Receipt"
          variant="outline"
          fullWidth
          onPress={() => {}}
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
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
