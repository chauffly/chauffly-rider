import { ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';

import { useMarkNotificationRead, useNotifications } from '@/api-client';
import { Text } from '@/components/common/text';
import { StackHeader } from '@/components/common/stack-header';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { asArray, asBoolean, asRecord, asString } from '@/utils/api-helpers';

const typeToIcon: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  ride_update: 'car',
  payment: 'cash',
  promotion: 'tag',
  safety: 'shield-check',
  system: 'cog'
};

const typeToBackground: Record<string, string> = {
  ride_update: '#E8F5E9',
  payment: '#FFF8E1',
  promotion: '#E3F2FD',
  safety: '#F3E5F5',
  system: '#ECEFF1'
};

export default function NotificationListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const { data: notificationsData } = useNotifications();
  const markRead = useMarkNotificationRead();
  const notifications = asArray<Record<string, unknown>>(asRecord(notificationsData).items);

  const unread = notifications.filter((entry) => !asBoolean(entry.isRead ?? entry.is_read));
  const read = notifications.filter((entry) => asBoolean(entry.isRead ?? entry.is_read));

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + spacing.lg,
          paddingBottom: insets.bottom
        }
      ]}
    >
      <StackHeader title={t('account.notifications_title')} onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {unread.length > 0 ? (
          <Text variant="bodySmall" color="muted" style={styles.sectionLabel}>
            {t('account.notifications_new')}
          </Text>
        ) : null}

        {unread.map((notification) => {
          const notificationId = asString(notification.id);
          const type = asString(notification.type, 'system');
          const icon = typeToIcon[type] ?? 'bell-outline';
          const iconBg = typeToBackground[type] ?? '#ECEFF1';
          const createdAt = asString(notification.createdAt ?? notification.created_at);
          return (
            <Pressable
              key={notificationId}
              style={[
                styles.notificationItem,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.primary,
                  borderWidth: 1
                }
              ]}
              onPress={() => markRead.mutate({ id: notificationId })}
            >
              <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
                <MaterialCommunityIcons name={icon} size={20} color={colors.textPrimary} />
              </View>
              <View style={styles.textWrap}>
                <View style={styles.titleRow}>
                  <Text variant="bodySmall" weight="medium" style={{ flex: 1 }}>
                    {asString(notification.title, '--')}
                  </Text>
                  <Text variant="caption" color="muted">
                    {createdAt ? formatDistanceToNow(new Date(createdAt), { addSuffix: true }) : '--'}
                  </Text>
                </View>
                <Text variant="caption" color="muted" numberOfLines={2}>
                  {asString(notification.body, '--')}
                </Text>
              </View>
            </Pressable>
          );
        })}

        {read.length > 0 ? (
          <Text variant="bodySmall" color="muted" style={styles.sectionLabel}>
            {t('account.notifications_earlier')}
          </Text>
        ) : null}

        {read.map((notification) => {
          const notificationId = asString(notification.id);
          const type = asString(notification.type, 'system');
          const icon = typeToIcon[type] ?? 'bell-outline';
          const iconBg = typeToBackground[type] ?? '#ECEFF1';
          const createdAt = asString(notification.createdAt ?? notification.created_at);
          return (
            <Pressable key={notificationId} style={[styles.notificationItem, { backgroundColor: colors.surface }]}>
              <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
                <MaterialCommunityIcons name={icon} size={20} color={colors.textSecondary} />
              </View>
              <View style={styles.textWrap}>
                <View style={styles.titleRow}>
                  <Text variant="bodySmall" weight="medium" color="secondary" style={{ flex: 1 }}>
                    {asString(notification.title, '--')}
                  </Text>
                  <Text variant="caption" color="muted">
                    {createdAt ? formatDistanceToNow(new Date(createdAt), { addSuffix: true }) : '--'}
                  </Text>
                </View>
                <Text variant="caption" color="muted" numberOfLines={2}>
                  {asString(notification.body, '--')}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg
  },
  content: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.sm
  },
  sectionLabel: {
    marginTop: spacing.md,
    marginBottom: spacing.xs
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.md
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  textWrap: {
    flex: 1,
    gap: 4
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm
  }
});
