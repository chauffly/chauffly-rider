import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

import { useBookingById } from '@/api-client';
import { PaymentModal } from '@/components/booking/payment-modal';
import { Text } from '@/components/common/text';
import { StackHeader } from '@/components/common/stack-header';
import LocationPinGreen from '@/components/svg/LocationPinGreen';
import LocationPinRed from '@/components/svg/LocationPinRed';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { asArray, asRecord, asString } from '@/utils/api-helpers';

const statusLabel = (status: string): string => {
  switch (status) {
    case 'driver_heading': return 'Driver is on the way';
    case 'driver_arrived': return 'Driver has arrived';
    case 'in_progress': return 'Ride in progress';
    case 'searching': return 'Finding your driver...';
    case 'driver_assigned': return 'Driver assigned';
    default: return status.replace(/_/g, ' ');
  }
};

const statusColor = (status: string, colors: { primary: string; success: string; error: string; textSecondary: string }): string => {
  switch (status) {
    case 'driver_heading': return colors.primary;
    case 'driver_arrived': return colors.success;
    case 'in_progress': return colors.success;
    case 'searching': return colors.textSecondary;
    case 'driver_assigned': return colors.primary;
    default: return colors.textSecondary;
  }
};

export default function OngoingDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const params = useLocalSearchParams<{ bookingId?: string; autoPayment?: string }>();
  const bookingId = params.bookingId ?? '';

  const [showPayment, setShowPayment] = useState(params.autoPayment === '1');

  useEffect(() => {
    if (params.autoPayment === '1') {
      setShowPayment(true);
    }
  }, [params.autoPayment]);

  const { data: bookingDetailData } = useBookingById(bookingId, {
    enabled: Boolean(bookingId),
    refetchInterval: 5000
  });

  const detailRecord = asRecord(bookingDetailData);
  const booking = asRecord(detailRecord.booking);
  const driver = asRecord(detailRecord.driver);
  const vehicle = asRecord(driver.vehicle);
  const stops = asArray<Record<string, unknown>>(detailRecord.stops);

  const lastStop = stops.length > 0 ? asRecord(stops[stops.length - 1]) : {};
  const pickupName = asString(booking.pickupName, asString(booking.pickupAddress, '--'));
  const pickupAddress = asString(booking.pickupAddress, '--');
  const destinationName = asString(lastStop.name, asString(lastStop.address, '--'));
  const destinationAddress = asString(lastStop.address, '--');

  const driverName = `${asString(driver.firstName)} ${asString(driver.lastName)}`.trim() || 'Driver';
  const driverRating = asString(driver.rating, '--');
  const vehicleName = `${asString(vehicle.make)} ${asString(vehicle.model)}`.trim() || '--';
  const plateNumber = asString(vehicle.plateNumber, asString(vehicle.plate_number, '--'));

  const status = asString(booking.status, 'in_progress');
  const bookingRef = asString(booking.id, bookingId || '--');

  const fareRecord = asRecord(detailRecord.fare);
  const fare = bookingDetailData
    ? {
        tripFare: Number(fareRecord.tripFare ?? fareRecord.estimatedFare ?? 0),
        surgeFee: Number(fareRecord.surgeFee ?? 0),
        tax: Number(fareRecord.tax ?? 0),
        total: Number(fareRecord.total ?? fareRecord.estimatedFare ?? 0),
        currency: asString(fareRecord.currency, 'NGN')
      }
    : null;

  const canPay = status === 'in_progress' || status === 'pending_payment';

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
      <StackHeader title="Ongoing Ride" align="center" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status badge */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor(status, colors)}22` }]}>
            <MaterialCommunityIcons
              name={status === 'in_progress' ? 'car' : status === 'driver_arrived' ? 'map-marker-check' : 'car-clock'}
              size={20}
              color={statusColor(status, colors)}
            />
            <Text variant="body" weight="semiBold" style={{ color: statusColor(status, colors) }}>
              {statusLabel(status)}
            </Text>
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
                {plateNumber !== '--' ? (
                  <Text variant="caption" color="muted">{plateNumber}</Text>
                ) : null}
              </View>
            </View>
            <Pressable style={[styles.chatIcon, { borderColor: colors.border }]}>
              <MaterialCommunityIcons name="chat-outline" size={20} color={colors.textSecondary} />
            </Pressable>
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

        {canPay ? (
          <Pressable
            style={[styles.payButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowPayment(true)}
          >
            <MaterialCommunityIcons name="credit-card-outline" size={20} color="#fff" />
            <Text variant="body" weight="semiBold" color="inverse">
              Pay Now
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>

      <PaymentModal
        visible={showPayment}
        bookingId={bookingId}
        fare={fare}
        onClose={() => setShowPayment(false)}
        onPaid={() => {
          setShowPayment(false);
          router.replace({ pathname: '/booking/trip-arrived', params: { bookingId } });
        }}
      />
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md
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
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    marginTop: spacing.sm
  }
});
