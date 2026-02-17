import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { BottomSheet } from '@/components/common/bottom-sheet';
import { Button } from '@/components/common/button';
import { Text } from '@/components/common/text';
import { StackHeader } from '@/components/common/stack-header';
import { Switch } from '@/components/common/switch';
import { spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';

export default function AccountSecurityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [settings, setSettings] = useState({
    biometricId: true,
    smsAuth: false,
    emailAuth: false,
    deactivateAccount: false,
  });
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const setToggle = (key: keyof typeof settings, value: boolean) => {
    setSettings((prev) => ({
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
        translationKey="account.account_security_title"
        align="center"
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.toggleRow}>
          <Text variant="body" translationKey="account.biometric_id" />
          <Switch
            value={settings.biometricId}
            onValueChange={(value) => setToggle('biometricId', value)}
            trackOn={colors.primary}
            trackOff={colors.border}
            thumbOn={colors.surface}
            thumbOff={colors.surface}
          />
        </View>

        <View style={styles.toggleRow}>
          <Text variant="body" translationKey="account.sms_authentication" />
          <Switch
            value={settings.smsAuth}
            onValueChange={(value) => setToggle('smsAuth', value)}
            trackOn={colors.primary}
            trackOff={colors.border}
            thumbOn={colors.surface}
            thumbOff={colors.surface}
          />
        </View>

        <View style={styles.toggleRow}>
          <Text variant="body" translationKey="account.email_authentication" />
          <Switch
            value={settings.emailAuth}
            onValueChange={(value) => setToggle('emailAuth', value)}
            trackOn={colors.primary}
            trackOff={colors.border}
            thumbOn={colors.surface}
            thumbOff={colors.surface}
          />
        </View>

        <View style={styles.sectionWithDescription}>
          <View style={styles.toggleRow}>
            <Text variant="body" translationKey="account.deactivate_account" />
            <Switch
              value={settings.deactivateAccount}
              onValueChange={(value) => setToggle('deactivateAccount', value)}
              trackOn={colors.primary}
              trackOff={colors.border}
              thumbOn={colors.surface}
              thumbOff={colors.surface}
            />
          </View>
          <Text
            variant="body"
            color="muted"
            translationKey="account.deactivate_account_description"
          />
        </View>

        <View style={styles.sectionWithDescription}>
          <Pressable
            style={styles.deleteRow}
            onPress={() => setIsDeleteModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel={t('account.delete_account')}
            accessibilityHint={t('account.delete_account_hint')}
          >
            <Text
              variant="body"
              color="error"
              translationKey="account.delete_account"
            />
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
          <Text
            variant="body"
            color="muted"
            translationKey="account.delete_account_description"
          />
        </View>
      </ScrollView>

      <BottomSheet
        visible={isDeleteModalVisible}
        onClose={() => setIsDeleteModalVisible(false)}
        maxHeight={420}
      >
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: colors.background,
              paddingBottom: insets.bottom + spacing.lg,
            },
          ]}
        >
          <Text
            variant="h3"
            color="error"
            align="center"
            translationKey="account.delete_account_confirm_title"
          />
          <View style={[styles.modalDivider, { backgroundColor: colors.border }]} />
          <Text
            variant="body"
            align="center"
            translationKey="account.delete_account_confirm_message"
            style={styles.modalMessage}
          />
          <Text
            variant="bodySmall"
            color="muted"
            align="center"
            translationKey="account.delete_account_confirm_note"
          />
          <View style={styles.modalActions}>
            <Button
              variant="outline"
              translationKey="account.delete_account_cancel"
              onPress={() => setIsDeleteModalVisible(false)}
              style={styles.actionButton}
            />
            <Button
              translationKey="account.delete_account_confirm_action"
              onPress={() => setIsDeleteModalVisible(false)}
              style={[styles.actionButton, { backgroundColor: colors.error }]}
              textStyle={{ color: colors.textInverse }}
            />
          </View>
        </View>
      </BottomSheet>
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
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  sectionWithDescription: {
    gap: spacing.xs,
  },
  deleteRow: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalContent: {
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  modalDivider: {
    height: 0.5,
    marginVertical: spacing.sm,
  },
  modalMessage: {
    marginBottom: spacing.xs,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
