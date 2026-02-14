import { StyleSheet, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, type Href } from "expo-router";
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Text } from '@/components/common/text';
import { Button } from '@/components/common/button';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';

interface PersonalizationItem {
  key: string;
  titleKey: string;
  route: Href<string>;
}

const personalizationItems: PersonalizationItem[] = [
  { key: 'ridePreference', titleKey: 'booking.ride_preference', route: '/booking/ride-preference' },
  { key: 'concierge', titleKey: 'booking.concierge_pre_trip_setup', route: '/booking/concierge-pre-trip' },
  { key: 'chauffeurMatching', titleKey: 'booking.preferred_chauffeur_matching', route: '/booking/preferred-chauffeur-matching' },
  { key: 'vipAirport', titleKey: 'booking.vip_airport_coordination', route: '/booking/vip-airport' },
  { key: 'redCarpet', titleKey: 'booking.red_carpet_event_service', route: '/booking/red-carpet-event' },
  { key: 'specialOccasion', titleKey: 'booking.special_occasion_packages', route: '/booking/special-occasion' },
];

export default function PersonalizationScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    originName?: string;
    originAddress?: string;
    originLat?: string;
    originLng?: string;
    destinations?: string;
    selectedRideId?: string;
    bookingType?: string;
    pickupDate?: string;
    pickupTime?: string;
  }>();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingBottom: insets.bottom + spacing.lg,
        },
      ]}
    >
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.lg }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel={t("common.back")}
          hitSlop={8}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={26}
            color={colors.textPrimary}
          />
        </Pressable>
      </View>
      <View style={styles.header}>
        <Text
          variant="h3"
          font="medium"
          translationKey="booking.personalization_title"
        />
        <Text
          variant="caption"
          color="muted"
          translationKey="booking.personalization_subtitle"
        />
      </View>

      <View style={styles.list}>
        {personalizationItems.map((item) => (
          <Pressable
            key={item.key}
            onPress={() =>
              router.push({
                pathname: item.route,
                params,
              })
            }
            style={[styles.listItem, { backgroundColor: colors.surface }]}
            accessibilityRole="button"
            accessibilityLabel={t(item.titleKey)}
          >
            <Text variant="body">{t(item.titleKey)}</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={colors.textSecondary}
            />
          </Pressable>
        ))}
      </View>

      <View style={styles.footer}>
        <Button
          translationKey="booking.proceed"
          style={styles.footerButton}
          onPress={() =>
            router.push({
              pathname: "/booking/ride-summary",
              params,
            })
          }
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
  topBar: {
    width: "100%",
    alignItems: "flex-start",
    paddingBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
    gap: spacing.xs,
  },
  list: {
    gap: spacing.md,
  },
  listItem: {
    borderRadius: borderRadius.full,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footer: {
    marginTop: "auto",
    flexDirection: "row",
    gap: spacing.md,
  },
  footerButton: {
    flex: 1,
  },
});
