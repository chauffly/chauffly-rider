import { useMemo, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';

import { useBookings } from '@/api-client';
import { Text } from '@/components/common/text';
import { TextInput } from '@/components/common/text-input';
import SearchIcon from '@/components/svg/SearchIcon';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { asArray, asRecord, asString } from '@/utils/api-helpers';
import { formatNairaAmount } from '@/utils/currency';

type RideTabKey = 'past' | 'upcoming' | 'ongoing' | 'canceled';

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

export default function RidesScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<RideTabKey>('upcoming');
  const [search, setSearch] = useState('');

  const { data: bookingsData } = useBookings({
    tab: mapTabToApi(activeTab)
  });
  const bookingItems = asArray<Record<string, unknown>>(asRecord(bookingsData).items);

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return bookingItems;
    }

    return bookingItems.filter((item) => {
      const rideOption = asRecord(item.rideOption);
      const driver = asRecord(item.driver);
      const driverName = `${asString(driver.firstName)} ${asString(driver.lastName)}`.trim().toLowerCase();
      const pickup = asString(item.pickupAddress).toLowerCase();
      const rideName = asString(rideOption.name).toLowerCase();
      return pickup.includes(query) || driverName.includes(query) || rideName.includes(query);
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
            const bookingId = asString(item.id);
            const pickupAddress = asString(item.pickupAddress, '--');
            const pickupName = asString(item.pickupName, pickupAddress);
            const driverName =
              `${asString(driver.firstName)} ${asString(driver.lastName)}`.trim() || 'Awaiting driver';
            const createdAt = asString(item.createdAt);
            const createdAtLabel = createdAt ? format(new Date(createdAt), 'EEE, MMM d • h:mm a') : '--';
            const fareTotal = formatNairaAmount(item.fareTotal);
            const status = asString(item.status, '--');
            const statusText = statusLabel(status);

            return (
              <Pressable
                key={bookingId}
                onPress={() =>
                  router.push({
                    pathname: activeTab === 'upcoming' ? '/booking/schedule-detail' : '/booking/ride-detail',
                    params: {
                      bookingId,
                      rideStatus: statusText
                    }
                  })
                }
                style={[styles.rideCard, { backgroundColor: colors.surface }]}
              >
                <View style={styles.cardTopRow}>
                  <View style={styles.driverIdentityRow}>
                    <View style={[styles.avatarWrap, { backgroundColor: colors.border }]}>
                      <MaterialCommunityIcons
                        name="account"
                        size={28}
                        color={colors.textSecondary}
                      />
                    </View>
                    <View style={styles.driverMeta}>
                      <Text variant="body" weight="medium">
                        {driverName}
                      </Text>
                      <Text variant="caption" color="secondary">
                        {asString(rideOption.name, 'Ride')}
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

                <View style={styles.locationRow}>
                  <View style={styles.pinColumn}>
                    <MaterialCommunityIcons name="map-marker" size={22} color={colors.primary} />
                  </View>
                  <View style={styles.locationTextWrap}>
                    <Text variant="bodySmall" weight="medium">
                      {pickupName}
                    </Text>
                    <Text variant="caption" color="secondary" numberOfLines={1}>
                      {pickupAddress}
                    </Text>
                  </View>
                  <Text variant="caption" color="secondary">
                    {createdAtLabel}
                  </Text>
                </View>
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
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm
  },
  pinColumn: {
    width: 24,
    alignItems: 'center',
    paddingTop: 2
  },
  locationTextWrap: {
    flex: 1,
    gap: 2
  },
  emptyCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm
  }
});
