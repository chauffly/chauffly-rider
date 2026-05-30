import { ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';

import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications
} from '@/api-client';
import { Text } from '@/components/common/text';
import { StackHeader } from '@/components/common/stack-header';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { asArray, asBoolean, asRecord, asString } from '@/utils/api-helpers';

const parseTimestamp = (value: string): Date | null => {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  const isoLike = trimmed
    .replace(' ', 'T')
    .replace(/\.(\d{3})\d+/, '.$1')
    .replace(/([+-]\d{2})$/, '$1:00');
  const date = new Date(isoLike);
  if (Number.isNaN(date.getTime())) {
    const fallback = new Date(trimmed);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }
  return date;
};

const formatRelativeTime = (value: string): string => {
  const date = parseTimestamp(value);
  if (!date) {
    return '--';
  }
  return formatDistanceToNow(date, { addSuffix: true });
};

const typeToIcon: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  ride_update: 'car',
  payment: 'cash',
  promotion: 'tag',
  safety: 'shield-check',
  system: 'cog'
};

const typeToColor: Record<string, string> = {
  ride_update: '#43A047',
  payment: '#c29d59',
  promotion: '#2563EB',
  safety: '#9C27B0',
  system: '#607D8B'
};

const typeToBackground: Record<string, string> = {
  ride_update: '#E8F5E9',
  payment: 'rgba(194,157,89,0.15)',
  promotion: '#E3F2FD',
  safety: '#F3E5F5',
  system: '#ECEFF1'
};

export default function NotificationListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const { data: notificationsData, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
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

      {unread.length > 0 ? (
        <Pressable
          onPress={() => markAllRead.mutate()}
          style={styles.markAllRow}
        >
          <MaterialCommunityIcons name="check-all" size={16} color={colors.primary} />
          <Text variant="caption" weight="medium" color="primary">
            {t('account.notifications_mark_all_read')}
          </Text>
        </Pressable>
      ) : null}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.emptyState}>
            <Text variant="bodySmall" color="muted">Loading notifications...</Text>
          </View>
        ) : null}

        {!isLoading && notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.surface }]}>
              <MaterialCommunityIcons name="bell-off-outline" size={32} color={colors.textSecondary} />
            </View>
            <Text variant="body" weight="medium" style={{ marginTop: spacing.md }}>No notifications yet</Text>
            <Text variant="bodySmall" color="muted" style={{ marginTop: spacing.xs, textAlign: 'center' }}>
              You&apos;re all caught up!
            </Text>
          </View>
        ) : null}

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
          const iconColor = typeToColor[type] ?? colors.textPrimary;
          const createdAt = asString(notification.createdAt ?? notification.created_at);
          return (
            <Pressable
              key={notificationId}
              style={({ pressed }) => [
                styles.notificationItem,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.primary,
                  borderWidth: 1,
                  opacity: pressed ? 0.75 : 1
                }
              ]}
              onPress={() => markRead.mutate({ id: notificationId })}
            >
              <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
                <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
              </View>
              <View style={styles.textWrap}>
                <View style={styles.titleRow}>
                  <View style={styles.titleWithDot}>
                    <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                    <Text variant="bodySmall" weight="semiBold" style={{ flex: 1 }}>
                      {asString(notification.title, '--')}
                    </Text>
                  </View>
                  <Text variant="caption" color="muted">
                    {formatRelativeTime(createdAt)}
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
            <View key={notificationId} style={[styles.notificationItem, { backgroundColor: colors.surface }]}>
              <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
                <MaterialCommunityIcons name={icon} size={20} color={colors.textSecondary} />
              </View>
              <View style={styles.textWrap}>
                <View style={styles.titleRow}>
                  <Text variant="bodySmall" weight="medium" color="secondary" style={{ flex: 1 }}>
                    {asString(notification.title, '--')}
                  </Text>
                  <Text variant="caption" color="muted">
                    {formatRelativeTime(createdAt)}
                  </Text>
                </View>
                <Text variant="caption" color="muted" numberOfLines={2}>
                  {asString(notification.body, '--')}
                </Text>
              </View>
            </View>
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
    paddingTop: spacing.xs,
    paddingBottom: spacing.xxl,
    gap: spacing.sm
  },
  markAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-end',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm
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
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
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
  },
  titleWithDot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    flexShrink: 0
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
