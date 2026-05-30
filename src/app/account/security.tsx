import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';

import {
  useApiClient,
  useChangePassword,
  useDeleteCurrentUser,
  useRevokeSession,
  useUserSessions
} from '@/api-client';
import { BottomSheet } from '@/components/common/bottom-sheet';
import { Button } from '@/components/common/button';
import { Text } from '@/components/common/text';
import { TextInput } from '@/components/common/text-input';
import { StackHeader } from '@/components/common/stack-header';
import { spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { clearRiderSession } from '@/runtime/rider-runtime';
import { asArray, asBoolean, asRecord, asString } from '@/utils/api-helpers';

export default function AccountSecurityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const api = useApiClient();

  const { data: sessionsData } = useUserSessions();
  const changePassword = useChangePassword();
  const revokeSession = useRevokeSession();
  const deleteAccount = useDeleteCurrentUser();

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const sessions = useMemo(
    () => asArray<Record<string, unknown>>(asRecord(sessionsData).items),
    [sessionsData]
  );

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      setErrorMessage(t('account.password_required'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage(t('auth.passwords_dont_match'));
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    try {
      await changePassword.mutateAsync({
        current_password: currentPassword,
        new_password: newPassword
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    try {
      await deleteAccount.mutateAsync();
      try {
        await api.authApi.logout();
      } catch {
        // Ignore logout failure after delete request.
      }
      await clearRiderSession();
      router.replace('/(auth)/login');
    } finally {
      setSubmitting(false);
    }
  };

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
      <StackHeader translationKey="account.account_security_title" align="center" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text variant="body" weight="medium" translationKey="account.change_password" />
          <TextInput
            labelTranslationKey="account.current_password"
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <TextInput
            labelTranslationKey="account.new_password"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TextInput
            labelTranslationKey="account.confirm_new_password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          {errorMessage ? (
            <Text variant="bodySmall" color="error">
              {errorMessage}
            </Text>
          ) : null}
          <Button
            title={submitting ? t('common.loading') : t('account.change_password_action')}
            fullWidth
            onPress={handleChangePassword}
            disabled={submitting}
          />
        </View>

        <View style={styles.section}>
          <Text variant="body" weight="medium" translationKey="account.active_sessions" />
          {sessions.length === 0 ? (
            <Text variant="bodySmall" color="muted">
              {t('account.no_active_sessions')}
            </Text>
          ) : (
            sessions.map((session) => {
              const sessionId = asString(session.id);
              const createdAt = asString(session.createdAt);
              const userAgent = asString(session.userAgent, '--');
              const isCurrent = asBoolean(session.isCurrent);
              return (
                <View key={sessionId} style={[styles.sessionRow, { borderColor: colors.border }]}>
                  <View style={styles.sessionMeta}>
                    <Text variant="bodySmall" weight="medium">
                      {userAgent}
                    </Text>
                    <Text variant="caption" color="muted">
                      {createdAt && !isNaN(new Date(createdAt).getTime())
                        ? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
                        : '--'}
                    </Text>
                  </View>
                  {isCurrent ? (
                    <Text variant="caption" color="success">
                      {t('account.current_session')}
                    </Text>
                  ) : (
                    <Pressable onPress={() => revokeSession.mutate({ id: sessionId })}>
                      <Ionicons name="close-circle-outline" size={22} color={colors.error} />
                    </Pressable>
                  )}
                </View>
              );
            })
          )}
        </View>

        <View style={styles.section}>
          <Pressable
            style={styles.deleteRow}
            onPress={() => setIsDeleteModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel={t('account.delete_account')}
            accessibilityHint={t('account.delete_account_hint')}
          >
            <Text variant="body" color="error" translationKey="account.delete_account" />
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
          <Text variant="body" color="muted" translationKey="account.delete_account_description" />
        </View>
      </ScrollView>

      <BottomSheet visible={isDeleteModalVisible} onClose={() => setIsDeleteModalVisible(false)} maxHeight={420}>
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: colors.background,
              paddingBottom: insets.bottom + spacing.lg
            }
          ]}
        >
          <Text variant="h3" color="error" align="center" translationKey="account.delete_account_confirm_title" />
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
              title={submitting ? t('common.loading') : t('account.delete_account_confirm_action')}
              onPress={handleDeleteAccount}
              style={[styles.actionButton, { backgroundColor: colors.error }]}
              textStyle={{ color: colors.textInverse }}
              disabled={submitting}
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
    paddingHorizontal: spacing.lg
  },
  content: {
    paddingTop: spacing.lg,
    gap: spacing.xl
  },
  section: {
    gap: spacing.sm
  },
  sessionRow: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  sessionMeta: {
    flex: 1,
    gap: 2
  },
  deleteRow: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  modalContent: {
    paddingTop: spacing.lg,
    gap: spacing.sm
  },
  modalDivider: {
    height: 0.5,
    marginVertical: spacing.sm
  },
  modalMessage: {
    marginBottom: spacing.xs
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md
  },
  actionButton: {
    flex: 1
  }
});
