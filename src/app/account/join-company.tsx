import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useJoinCompany } from '@/api-client';
import { TextInput } from '@/components/common/text-input';
import { Button } from '@/components/common/button';
import { StackHeader } from '@/components/common/stack-header';
import { Text } from '@/components/common/text';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';

export default function JoinCompanyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const joinCompany = useJoinCompany();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [showAwaitingModal, setShowAwaitingModal] = useState(false);

  const handleSubmit = async () => {
    const organizationCode = code.trim().toUpperCase();
    if (!organizationCode) {
      setError(t('account.join_company_code_error'));
      return;
    }

    setError('');
    await joinCompany.mutateAsync({
      organization_code: organizationCode
    });
    setShowAwaitingModal(true);
  };

  const handleDone = () => {
    setShowAwaitingModal(false);
    router.back();
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
      <StackHeader translationKey="account.join_company_title" align="center" onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="body" color="muted">
          {t('account.join_company_subtitle')}
        </Text>

        <TextInput
          labelTranslationKey="account.join_company_code_label"
          placeholderTranslationKey="account.join_company_code_placeholder"
          value={code}
          onChangeText={(text) => {
            setCode(text.toUpperCase());
            if (error) setError('');
          }}
          error={error}
          autoCapitalize="characters"
          maxLength={32}
        />
      </ScrollView>

      <Button
        title={joinCompany.isPending ? t('common.loading') : t('account.join_company_submit')}
        onPress={handleSubmit}
        style={styles.submitButton}
        disabled={joinCompany.isPending}
      />

      <Modal transparent animationType="fade" visible={showAwaitingModal} onRequestClose={handleDone}>
        <Pressable style={styles.modalOverlay} onPress={handleDone}>
          <Pressable style={[styles.modalCard, { backgroundColor: colors.surface }]} onPress={() => {}}>
            <View style={[styles.clockIcon, { backgroundColor: colors.primary }]}>
              <MaterialCommunityIcons name="clock-outline" size={28} color={colors.white} />
            </View>

            <Text variant="h2" weight="medium" align="center">
              {t('account.join_company_awaiting_title')}
            </Text>

            <Text variant="body" color="muted" align="center" style={styles.modalMessage}>
              {t('account.join_company_awaiting_message', { company: 'Your organization' })}
            </Text>

            <View style={[styles.estimateChip, { backgroundColor: colors.accent, borderColor: colors.primary }]}>
              <Text variant="bodySmall" color="muted" align="center">
                {t('account.join_company_estimated_time_label')}
              </Text>
              <Text variant="body" weight="semiBold" align="center">
                {t('account.join_company_estimated_time_value')}
              </Text>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg
  },
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxxxl
  },
  submitButton: {
    marginBottom: spacing.md
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl
  },
  modalCard: {
    width: '100%',
    borderRadius: borderRadius.xxl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md
  },
  clockIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm
  },
  modalMessage: {
    lineHeight: 22
  },
  estimateChip: {
    borderRadius: borderRadius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
    width: '100%'
  }
});
