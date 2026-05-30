import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import {
  useMarkAllNotificationsRead,
  useNotificationPreferences,
  useUpdateNotificationPreferences
} from '@/api-client';
import { Text } from '@/components/common/text';
import { StackHeader } from '@/components/common/stack-header';
import { Switch } from '@/components/common/switch';
import { Button } from '@/components/common/button';
import { spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { asBoolean, asRecord } from '@/utils/api-helpers';

type NotificationSettings = {
  push_enabled: boolean;
  sms_enabled: boolean;
  email_enabled: boolean;
  ride_updates: boolean;
  promotions: boolean;
  payment_alerts: boolean;
};

const defaultSettings: NotificationSettings = {
  push_enabled: true,
  sms_enabled: true,
  email_enabled: true,
  ride_updates: true,
  promotions: false,
  payment_alerts: true
};

const mapPreferencesToSettings = (value: Record<string, unknown>): NotificationSettings => ({
  push_enabled: asBoolean(value.pushEnabled ?? value.push_enabled, true),
  sms_enabled: asBoolean(value.smsEnabled ?? value.sms_enabled, true),
  email_enabled: asBoolean(value.emailEnabled ?? value.email_enabled, true),
  ride_updates: asBoolean(value.rideUpdates ?? value.ride_updates, true),
  promotions: asBoolean(value.promotions, false),
  payment_alerts: asBoolean(value.paymentAlerts ?? value.payment_alerts, true)
});

const areSettingsEqual = (left: NotificationSettings, right: NotificationSettings): boolean =>
  left.push_enabled === right.push_enabled &&
  left.sms_enabled === right.sms_enabled &&
  left.email_enabled === right.email_enabled &&
  left.ride_updates === right.ride_updates &&
  left.promotions === right.promotions &&
  left.payment_alerts === right.payment_alerts;

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const { data: preferencesData, isLoading: preferencesLoading } = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();
  const markAllRead = useMarkAllNotificationsRead();

  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [initialSettings, setInitialSettings] = useState<NotificationSettings>(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const record = asRecord(preferencesData);
    if (Object.keys(record).length === 0) {
      return;
    }
    const nextSettings = mapPreferencesToSettings(record);
    setSettings(nextSettings);
    setInitialSettings(nextSettings);
    setStatus('idle');
  }, [preferencesData]);

  const handleToggle = (key: keyof NotificationSettings, value: boolean) => {
    setStatus('idle');
    setSettings((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    if (saving || areSettingsEqual(settings, initialSettings)) {
      return;
    }
    setSaving(true);
    setStatus('idle');
    try {
      await updatePreferences.mutateAsync(settings);
      setInitialSettings(settings);
      setStatus('success');
    } catch {
      setStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = !areSettingsEqual(settings, initialSettings);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + spacing.lg,
          paddingBottom: insets.bottom + spacing.md
        }
      ]}
    >
      <StackHeader translationKey="account.notifications_title" align="center" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.row}>
          <Text variant="body" translationKey="account.notification_general_update" />
          <Switch
            value={settings.push_enabled}
            onValueChange={(value) => handleToggle('push_enabled', value)}
            trackOn={colors.primary}
            trackOff={colors.border}
            thumbOn={colors.surface}
            thumbOff={colors.surface}
          />
        </View>

        <View style={styles.row}>
          <Text variant="body" translationKey="account.notification_account" />
          <Switch
            value={settings.email_enabled}
            onValueChange={(value) => handleToggle('email_enabled', value)}
            trackOn={colors.primary}
            trackOff={colors.border}
            thumbOn={colors.surface}
            thumbOff={colors.surface}
          />
        </View>

        <View style={styles.row}>
          <Text variant="body" translationKey="account.notification_safety_security_alerts" />
          <Switch
            value={settings.sms_enabled}
            onValueChange={(value) => handleToggle('sms_enabled', value)}
            trackOn={colors.primary}
            trackOff={colors.border}
            thumbOn={colors.surface}
            thumbOff={colors.surface}
          />
        </View>

        <View style={styles.row}>
          <Text variant="body" translationKey="account.notification_ride_status_updates" />
          <Switch
            value={settings.ride_updates}
            onValueChange={(value) => handleToggle('ride_updates', value)}
            trackOn={colors.primary}
            trackOff={colors.border}
            thumbOn={colors.surface}
            thumbOff={colors.surface}
          />
        </View>

        <View style={styles.row}>
          <Text variant="body" translationKey="account.notification_ratings_reviews" />
          <Switch
            value={settings.payment_alerts}
            onValueChange={(value) => handleToggle('payment_alerts', value)}
            trackOn={colors.primary}
            trackOff={colors.border}
            thumbOn={colors.surface}
            thumbOff={colors.surface}
          />
        </View>

        <View style={styles.row}>
          <Text variant="body" translationKey="account.notification_app_update" />
          <Switch
            value={settings.promotions}
            onValueChange={(value) => handleToggle('promotions', value)}
            trackOn={colors.primary}
            trackOff={colors.border}
            thumbOn={colors.surface}
            thumbOff={colors.surface}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {preferencesLoading ? (
          <Text variant="bodySmall" color="muted">
            {t('account.notifications_loading_preferences')}
          </Text>
        ) : null}
        {status === 'success' ? (
          <Text variant="bodySmall" color="success">
            {t('account.notifications_save_success')}
          </Text>
        ) : null}
        {status === 'error' || updatePreferences.isError ? (
          <Text variant="bodySmall" color="error">
            {t('account.notifications_save_error')}
          </Text>
        ) : null}
        <Button
          title={
            saving
              ? t('account.notifications_saving')
              : hasChanges
                ? t('common.save')
                : t('account.notifications_saved')
          }
          fullWidth
          onPress={handleSave}
          disabled={saving || preferencesLoading || !hasChanges}
        />
        <Button
          title={t('account.notifications_mark_all_read')}
          fullWidth
          variant="outline"
          onPress={() => markAllRead.mutate()}
          disabled={markAllRead.isPending}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg
  },
  content: {
    paddingTop: spacing.lg,
    gap: spacing.xxl + spacing.sm
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg
  },
  footer: {
    marginTop: spacing.xl,
    gap: spacing.md
  }
});
