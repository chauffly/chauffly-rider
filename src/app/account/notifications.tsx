import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Text } from '@/components/common/text';
import { StackHeader } from '@/components/common/stack-header';
import { Switch } from '@/components/common/switch';
import { spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';

type NotificationItem = {
  key: string;
  labelKey: string;
};

const notificationItems: NotificationItem[] = [
  { key: 'generalUpdate', labelKey: 'account.notification_general_update' },
  {
    key: 'safetySecurity',
    labelKey: 'account.notification_safety_security_alerts',
  },
  {
    key: 'accountNotification',
    labelKey: 'account.notification_account',
  },
  {
    key: 'rideStatusUpdates',
    labelKey: 'account.notification_ride_status_updates',
  },
  {
    key: 'ratingsReviews',
    labelKey: 'account.notification_ratings_reviews',
  },
  { key: 'appUpdate', labelKey: 'account.notification_app_update' },
  {
    key: 'bookingMistake',
    labelKey: 'account.notification_booking_mistake',
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [notificationToggles, setNotificationToggles] = useState<
    Record<string, boolean>
  >({
    generalUpdate: true,
    safetySecurity: true,
    accountNotification: false,
    rideStatusUpdates: false,
    ratingsReviews: false,
    appUpdate: false,
    bookingMistake: false,
  });

  const handleToggle = (key: string, value: boolean) => {
    setNotificationToggles((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + spacing.lg,
          paddingBottom: insets.bottom + spacing.md,
        },
      ]}
    >
      <StackHeader
        translationKey="account.notifications_title"
        align="center"
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {notificationItems.map((item) => (
          <View key={item.key} style={styles.row}>
            <Text variant="body" translationKey={item.labelKey} />
            <Switch
              value={notificationToggles[item.key]}
              onValueChange={(value) => handleToggle(item.key, value)}
              trackOn={colors.primary}
              trackOff={colors.border}
              thumbOn={colors.surface}
              thumbOff={colors.surface}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  content: {
    paddingTop: spacing.lg,
    gap: spacing.xxl + spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
});
