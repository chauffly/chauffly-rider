import { useEffect, useMemo, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';

import { useBookings, useCorporateRides, useCurrentUser } from '@/api-client';
import { Text } from '@/components/common/text';
import { TextInput } from '@/components/common/text-input';
import SearchIcon from '@/components/svg/SearchIcon';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { accountRoleService } from '@/services/account-role';
import { asArray, asRecord, asString, parseDateTimeString } from '@/utils/api-helpers';
import { formatNairaAmount } from '@/utils/currency';


type RideTabKey = 'past' | 'upcoming' | 'ongoing' | 'canceled';

const tabToDetailScreen: Record<RideTabKey, string> = {
  upcoming: '/booking/schedule-detail',
  ongoing: '/booking/ongoing-detail',
  past: '/booking/ride-detail',
  canceled: '/booking/cancelled-detail'
};

const rideTabs: Array<{ key: RideTabKey; translationKey: string }> = [
  { key: 'upcoming', translationKey: 'rides.tabs.upcoming' },
  { key: 'ongoing', translationKey: 'rides.tabs.ongoing' },
  { key: 'past', translationKey: 'rides.tabs.past' },
  { key: 'canceled', translationKey: 'rides.tabs.canceled' }
];

const mapTabToApi = (tab: RideTabKey): 'past' | 'upcoming' | 'ongoing' | 'cancelled' => {
  if (tab === 'canceled') {
    return 'cancelled';
  }
  return tab;
};

const statusLabel = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'searching':
      return 'Searching';
    case 'driver_assigned':
      return 'Driver assigned';
    case 'driver_heading':
      return 'Driver heading';
    case 'driver_arrived':
      return 'Driver arrived';
    case 'in_progress':
      return 'In progress';
    case 'pending_payment':
      return 'Payment due';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    case 'no_drivers':
      return 'No drivers';
    default:
      return status || '--';
  }
};

const getDestinationLabel = (item: Record<string, unknown>): string => {
  const destination = asRecord(item.destination);
  const destinationName =
    asString(item.destinationName) ||
    asString(item.destination_name) ||
    asString(destination.name, '');
  const destinationAddress =
    asString(item.destinationAddress) ||
    asString(item.destination_address) ||
    asString(destination.address, '');

  if (destinationName && destinationAddress && destinationName !== destinationAddress) {
    return `${destinationName} • ${destinationAddress}`;
  }

  return destinationName || destinationAddress || 'Destination';
};

export default function RidesScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: currentUserData } = useCurrentUser();
  const currentUser = asRecord(currentUserData);
  const [isCorporate, setIsCorporate] = useState(false);

  const [activeTab, setActiveTab] = useState<RideTabKey>('upcoming');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;
    const syncRole = async () => {
      const storedRole = await accountRoleService.getRole();
      const nextRole = accountRoleService.resolveRole(asString(currentUser.role, ''), storedRole);
      if (active) {
        setIsCorporate(nextRole === 'corporate');
      }
    };

    void syncRole();
    return () => {
      active = false;
    };
  }, [currentUser]);

  const { data: bookingsData } = useBookings({
    tab: mapTabToApi(activeTab)
  });
  const { data: corporateRidesData } = useCorporateRides(
    { tab: mapTabToApi(activeTab) },
    { enabled: isCorporate }
  );
  const bookingItems = asArray<Record<string, unknown>>(
    asRecord(isCorporate ? corporateRidesData : bookingsData).items
  );

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return bookingItems;
    }

    return bookingItems.filter((item) => {
      const rideOption = asRecord(item.rideOption);
      const driver = asRecord(item.driver);
      const destination = getDestinationLabel(item).toLowerCase();
      const driverName = `${asString(driver.firstName)} ${asString(driver.lastName)}`.trim().toLowerCase();
      const pickup = asString(item.pickupAddress).toLowerCase();
      const rideName = asString(rideOption.name).toLowerCase();
      return pickup.includes(query) || driverName.includes(query) || rideName.includes(query) || destination.includes(query);
    });
  }, [bookingItems, search]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top + 24 }
      ]}
    >
      <Text variant="h2" weight="medium" style={styles.title}>
        {t('rides.title')}
      </Text>

      <View style={styles.searchInputWrap}>
        <TextInput
          placeholder={t('rides.search_placeholder')}
          leftIcon={<SearchIcon size={20} color={colors.textPrimary} />}
          autoCapitalize="none"
          autoCorrect={false}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={[styles.segmentWrap, { backgroundColor: colors.surface }]}>
        {rideTabs.map((tab) => {
          const active = tab.key === activeTab;
          return (
            <Pressable
              key={tab.key}
              style={[
                styles.segmentButton,
                active && { backgroundColor: colors.textPrimary }
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                variant="bodySmall"
                weight={active ? 'medium' : 'regular'}
                color={active ? 'inverse' : 'secondary'}
              >
                {t(tab.translationKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + spacing.xxxxl,
          gap: spacing.lg
        }}
      >
        {filteredBookings.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
            <MaterialCommunityIcons
              name="car-off"
              size={36}
              color={colors.textSecondary}
            />
            <Text variant="body" color="secondary">
              {t('rides.empty_state')}
            </Text>
          </View>
        ) : (
          filteredBookings.map((item) => {
            const rideOption = asRecord(item.rideOption);
            const driver = asRecord(item.driver);
            const rider = asRecord(item.rider);
            const bookingId = asString(item.id);
            const pickupAddress = asString(item.pickupAddress, '--');
            const pickupName = asString(item.pickupName, pickupAddress);
            const driverName =
              `${asString(driver.firstName)} ${asString(driver.lastName)}`.trim() || 'Awaiting driver';
            const riderName =
              `${asString(rider.firstName)} ${asString(rider.lastName)}`.trim() || 'Assigned rider';
            const destinationName = getDestinationLabel(item);
            const scheduledAtRaw = asString(item.scheduledAt ?? item.scheduled_at);
            const createdAt = asString(item.createdAt);
            const dateRaw = activeTab === 'upcoming' && scheduledAtRaw ? scheduledAtRaw : createdAt;
            const parsedDate = parseDateTimeString(dateRaw);
            const dateLabel = parsedDate ? format(parsedDate, 'EEE, MMM d • h:mm a') : '--';
            const fareTotal = formatNairaAmount(Number(item.fareTotal ?? 0));
            const status = asString(item.status, '--');
            const statusText = statusLabel(status);

            const isPendingPayment = status === 'pending_payment' || status === 'in_progress';

            return (
              <Pressable
                key={bookingId}
                onPress={() => {
                  router.push({
                    pathname: tabToDetailScreen[activeTab] as any,
                    params: { bookingId, rideStatus: statusText }
                  });
                }}
                style={[styles.rideCard, { backgroundColor: colors.surface }]}
              >
                <View style={styles.cardTopRow}>
                  <View style={styles.driverIdentityRow}>
                    <View style={[styles.avatarWrap, { backgroundColor: colors.border }]}>
                      <MaterialCommunityIcons
                        name={activeTab === 'upcoming' ? 'calendar-clock' : 'account'}
                        size={28}
                        color={activeTab === 'upcoming' ? colors.primary : colors.textSecondary}
                      />
                    </View>
                    <View style={styles.driverMeta}>
                      <Text variant="body" weight="medium">
                        {activeTab === 'upcoming'
                          ? parsedDate
                            ? format(parsedDate, 'EEE, MMM d')
                            : 'Scheduled'
                          : isCorporate
                            ? riderName
                            : driverName}
                      </Text>
                      <Text variant="caption" color="secondary">
                        {activeTab === 'upcoming'
                          ? (parsedDate ? `Scheduled for ${format(parsedDate, 'h:mm a')}` : asString(rideOption.name, 'Ride'))
                          : isCorporate
                            ? `${asString(rideOption.name, 'Ride')} • ${driverName}`
                            : asString(rideOption.name, 'Ride')}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.rightStat}>
                    <Text variant="body" weight="medium">
                      {fareTotal}
                    </Text>
                    <Text variant="caption" color="secondary">
                      {statusText}
                    </Text>
                  </View>
                </View>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <View style={styles.routeContainer}>
                  <View style={styles.routeIconColumn}>
                    <MaterialCommunityIcons name="map-marker" size={22} color={colors.primary} />
                    <View
                      style={[
                        styles.routeLine,
                        { backgroundColor: colors.textSecondary, opacity: 0.35 }
                      ]}
                    />
                    <MaterialCommunityIcons name="map-marker-check" size={22} color={colors.error} />
                  </View>
                  <View style={styles.routeDetails}>
                    <View style={styles.routeStop}>
                      <View style={styles.routeStopText}>
                        <Text variant="bodySmall" weight="medium">
                          {pickupName}
                        </Text>
                        <Text variant="caption" color="secondary" numberOfLines={1}>
                          {pickupAddress}
                        </Text>
                      </View>
                      <Text variant="caption" color="secondary">
                        {dateLabel}
                      </Text>
                    </View>

                    <View style={styles.routeStop}>
                      <View style={styles.routeStopText}>
                        <Text variant="bodySmall" weight="medium">
                          {destinationName}
                        </Text>
                      </View>
                      <Text variant="caption" color="secondary">
                        {fareTotal}
                      </Text>
                    </View>
                  </View>
                </View>

                {isPendingPayment ? (
                  <Pressable
                    style={[styles.payNowButton, { backgroundColor: colors.primary }]}
                    onPress={(e) => {
                      e.stopPropagation();
                      router.push({
                        pathname: '/booking/ongoing-detail',
                        params: { bookingId, autoPayment: '1' }
                      });
                    }}
                  >
                    <MaterialCommunityIcons name="credit-card-outline" size={16} color="#fff" />
                    <Text variant="bodySmall" weight="semiBold" color="inverse">
                      Pay Now · {fareTotal}
                    </Text>
                  </Pressable>
                ) : null}
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16
  },
  title: {
    marginBottom: 26
  },
  searchInputWrap: {
    marginBottom: 8
  },
  segmentWrap: {
    borderRadius: borderRadius.full,
    padding: 4,
    flexDirection: 'row',
    marginBottom: spacing.lg
  },
  segmentButton: {
    flex: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center'
  },
  rideCard: {
    borderRadius: 26,
    padding: 16
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  driverIdentityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1
  },
  avatarWrap: {
    width: 50,
    height: 50,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center'
  },
  driverMeta: {
    gap: 2,
    flex: 1
  },
  rightStat: {
    alignItems: 'flex-end',
    gap: 2
  },
  divider: {
    height: 1,
    marginVertical: spacing.md
  },
  routeContainer: {
    flexDirection: 'row',
    gap: spacing.md
  },
  routeIconColumn: {
    alignItems: 'center',
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs
  },
  routeLine: {
    width: 2,
    flexGrow: 1,
    minHeight: 24,
    borderRadius: 999,
    marginVertical: spacing.xs
  },
  routeDetails: {
    flex: 1,
    gap: spacing.md
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
  emptyCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm
  },
  payNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg
  }
});
