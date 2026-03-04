import { ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Text } from '@/components/common/text';
import { StackHeader } from '@/components/common/stack-header';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';

interface Notification {
  id: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconBg: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    icon: 'car',
    iconBg: '#E8F5E9',
    title: 'Ride Completed',
    message: 'Your ride to Larchmont Hotel has been completed. Rate your chauffeur!',
    time: '2 min ago',
    read: false,
  },
  {
    id: '2',
    icon: 'cash',
    iconBg: '#FFF8E1',
    title: 'Payment Successful',
    message: 'Payment of \u20A68,500 for your last ride has been processed.',
    time: '15 min ago',
    read: false,
  },
  {
    id: '3',
    icon: 'tag',
    iconBg: '#E3F2FD',
    title: 'Special Offer',
    message: 'Get 20% off on your next 3 rides. Use code CHAUFFLY20.',
    time: '1 hr ago',
    read: false,
  },
  {
    id: '4',
    icon: 'shield-check',
    iconBg: '#F3E5F5',
    title: 'Safety Update',
    message: 'We\'ve updated our safety features. Tap to learn more.',
    time: '3 hrs ago',
    read: true,
  },
  {
    id: '5',
    icon: 'car-clock',
    iconBg: '#E8F5E9',
    title: 'Scheduled Ride Reminder',
    message: 'Your ride to Victoria Island is scheduled for tomorrow at 9:00 AM.',
    time: '5 hrs ago',
    read: true,
  },
  {
    id: '6',
    icon: 'star',
    iconBg: '#FFF8E1',
    title: 'Rate Your Ride',
    message: 'You haven\'t rated your ride with David O. yet. Share your feedback!',
    time: 'Yesterday',
    read: true,
  },
  {
    id: '7',
    icon: 'account-check',
    iconBg: '#E3F2FD',
    title: 'Account Verified',
    message: 'Your identity has been verified successfully.',
    time: 'Yesterday',
    read: true,
  },
  {
    id: '8',
    icon: 'weather-cloudy',
    iconBg: '#ECEFF1',
    title: 'Weather Advisory',
    message: 'Heavy rain expected in Lagos. Fares may be higher than usual.',
    time: '2 days ago',
    read: true,
  },
];

export default function NotificationListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + spacing.lg,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <StackHeader
        title={t('account.notifications_title')}
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {unreadCount > 0 && (
          <Text variant="bodySmall" color="muted" style={styles.sectionLabel}>
            {t('account.notifications_new')}
          </Text>
        )}

        {MOCK_NOTIFICATIONS.filter((n) => !n.read).map((notification) => (
          <Pressable
            key={notification.id}
            style={[
              styles.notificationItem,
              {
                backgroundColor: colors.surface,
                borderColor: colors.primary,
                borderWidth: 1,
              },
            ]}
          >
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: notification.iconBg },
              ]}
            >
              <MaterialCommunityIcons
                name={notification.icon}
                size={20}
                color={colors.textPrimary}
              />
            </View>
            <View style={styles.textWrap}>
              <View style={styles.titleRow}>
                <Text variant="bodySmall" weight="medium" style={{ flex: 1 }}>
                  {notification.title}
                </Text>
                <Text variant="caption" color="muted">
                  {notification.time}
                </Text>
              </View>
              <Text variant="caption" color="muted" numberOfLines={2}>
                {notification.message}
              </Text>
            </View>
          </Pressable>
        ))}

        {MOCK_NOTIFICATIONS.some((n) => n.read) && (
          <Text variant="bodySmall" color="muted" style={styles.sectionLabel}>
            {t('account.notifications_earlier')}
          </Text>
        )}

        {MOCK_NOTIFICATIONS.filter((n) => n.read).map((notification) => (
          <Pressable
            key={notification.id}
            style={[
              styles.notificationItem,
              { backgroundColor: colors.surface },
            ]}
          >
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: notification.iconBg },
              ]}
            >
              <MaterialCommunityIcons
                name={notification.icon}
                size={20}
                color={colors.textSecondary}
              />
            </View>
            <View style={styles.textWrap}>
              <View style={styles.titleRow}>
                <Text variant="bodySmall" weight="medium" color="secondary" style={{ flex: 1 }}>
                  {notification.title}
                </Text>
                <Text variant="caption" color="muted">
                  {notification.time}
                </Text>
              </View>
              <Text variant="caption" color="muted" numberOfLines={2}>
                {notification.message}
              </Text>
            </View>
          </Pressable>
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
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  sectionLabel: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
});
