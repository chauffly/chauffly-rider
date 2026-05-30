import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';

import { ApiClientError, useCurrentUser, useJoinCompany } from '@/api-client';
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
  const isFocused = useIsFocused();
  const { data: currentUserData, refetch: refetchCurrentUser } = useCurrentUser();
  const joinCompany = useJoinCompany();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [showAwaitingModal, setShowAwaitingModal] = useState(false);
  const companyMembership =
    currentUserData && typeof currentUserData === 'object' && 'companyMembership' in currentUserData
      ? (currentUserData.companyMembership as Record<string, unknown> | null)
      : null;
  const organization =
    companyMembership && typeof companyMembership.organization === 'object'
      ? (companyMembership.organization as Record<string, unknown> | null)
      : null;
  const membership =
    companyMembership && typeof companyMembership.membership === 'object'
      ? (companyMembership.membership as Record<string, unknown> | null)
      : null;
  const policy =
    companyMembership && typeof companyMembership.policy === 'object'
      ? (companyMembership.policy as Record<string, unknown> | null)
      : null;
  const membershipStatus = typeof membership?.status === 'string' ? membership.status : null;
  const hasMembership = Boolean(membershipStatus);
  const isActiveMembership = membershipStatus === 'active';

  useEffect(() => {
    if (isFocused) {
      void refetchCurrentUser();
    }
  }, [isFocused, refetchCurrentUser]);

  const handleSubmit = async () => {
    const organizationCode = code.trim().toUpperCase();
    if (!organizationCode) {
      setError(t('account.join_company_code_error'));
      return;
    }

    setError('');
    try {
      await joinCompany.mutateAsync({
        organization_code: organizationCode
      });
      setShowAwaitingModal(true);
    } catch (submissionError) {
      const fallback = 'Could not submit company code right now.';
      setError(
        submissionError instanceof ApiClientError
          ? submissionError.message || fallback
          : submissionError instanceof Error
            ? submissionError.message || fallback
            : fallback
      );
    }
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

        {hasMembership ? (
          <View
            style={[
              styles.statusCard,
              { backgroundColor: colors.surface, borderColor: colors.border }
            ]}
          >
            <Text variant="body" weight="semiBold">
              {typeof organization?.name === 'string' ? organization.name : 'Company membership'}
            </Text>
            <Text variant="caption" color="muted">
              Status: {membershipStatus}
            </Text>
            {typeof organization?.orgCode === 'string' ? (
              <Text variant="caption" color="muted">
                Code: {organization.orgCode}
              </Text>
            ) : null}
            {policy ? (
              <View style={styles.policyMeta}>
                <Text variant="caption" color="muted">
                  Travel limit:{' '}
                  {typeof policy.budgetLimit === 'number'
                    ? `₦${policy.budgetLimit} / ${typeof policy.budgetPeriod === 'string' ? policy.budgetPeriod : 'policy window'}`
                    : 'Use company policy to determine eligibility'}
                </Text>
                {Array.isArray(policy.allowedTiers) && policy.allowedTiers.length > 0 ? (
                  <Text variant="caption" color="muted">
                    Allowed tiers: {policy.allowedTiers.join(', ')}
                  </Text>
                ) : null}
                {typeof policy.maxFarePerTrip === 'number' ? (
                  <Text variant="caption" color="muted">
                    Max fare per trip: ₦{policy.maxFarePerTrip}
                  </Text>
                ) : null}
              </View>
            ) : null}
          </View>
        ) : null}

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
          editable={!joinCompany.isPending && !isActiveMembership}
        />
      </ScrollView>

      <Button
        title={joinCompany.isPending ? t('common.loading') : t('account.join_company_submit')}
        onPress={handleSubmit}
        style={styles.submitButton}
        disabled={joinCompany.isPending || isActiveMembership}
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
              {t('account.join_company_awaiting_message', {
                company: typeof organization?.name === 'string' ? organization.name : 'Your organization'
              })}
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
  statusCard: {
    borderWidth: 1,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    gap: spacing.xs
  },
  policyMeta: {
    gap: 2
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
