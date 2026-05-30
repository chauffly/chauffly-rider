import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ApiClientError, useCurrentUser, useUpdateCurrentUser } from '@/api-client';
import { Button } from '@/components/common/button';
import { StackHeader } from '@/components/common/stack-header';
import { Text } from '@/components/common/text';
import { TextInput } from '@/components/common/text-input';
import CallOutline from '@/components/svg/CallOutline';
import EmailOutline from '@/components/svg/EmailOutline';
import { spacing } from '@/constants/spacing';
import { useTranslation } from '@/context/language-context';
import { useTheme } from '@/context/theme-context';
import { riderOnboardingProgressStorage } from '@/services/rider-onboarding-progress';
import { asRecord, asString } from '@/utils/api-helpers';

export default function CorporateAdminInfoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: string }>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { data: currentUserData } = useCurrentUser();
  const currentUser = asRecord(currentUserData);
  const updateCurrentUser = useUpdateCurrentUser();

  const [fullName, setFullName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [position, setPosition] = useState('');
  const [generalError, setGeneralError] = useState('');

  useEffect(() => {
    void riderOnboardingProgressStorage.setCurrentRoute('/(auth)/profile-setup/corporate-admin-info');
  }, []);

  useEffect(() => {
    if (!fullName) {
      const combinedName = [asString(currentUser.firstName), asString(currentUser.lastName)]
        .filter(Boolean)
        .join(' ')
        .trim();
      setFullName(combinedName || asString(currentUser.firstName));
    }
    if (!workEmail) {
      setWorkEmail(asString(currentUser.email));
    }
    if (!phoneNumber) {
      setPhoneNumber(asString(currentUser.phoneNumber));
    }
  }, [currentUser, fullName, phoneNumber, workEmail]);

  const handleContinue = async () => {
    setGeneralError('');
    try {
      if (fullName.trim() || workEmail.trim()) {
        const normalizedFullName = fullName.trim().replace(/\s+/g, ' ');
        const [firstName, ...lastNameParts] = normalizedFullName.split(' ').filter(Boolean);
        await updateCurrentUser.mutateAsync({
          first_name: firstName || undefined,
          last_name: lastNameParts.length ? lastNameParts.join(' ') : undefined,
          email: workEmail.trim() || undefined
        });
      }

      router.push({
        pathname: '/(auth)/profile-setup/corporate-document-upload',
        params: { role: params.role ?? 'corporate' }
      });
    } catch (error) {
      const fallback = 'Could not save your admin details right now.';
      setGeneralError(error instanceof ApiClientError ? error.message || fallback : error instanceof Error ? error.message || fallback : fallback);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style={colors.statusBar as 'light' | 'dark'} />

      <StackHeader
        translationKey="profile_setup.corporate_admin_info_title"
        onBack={() => router.back()}
        style={{ paddingTop: insets.top + spacing.md, paddingHorizontal: spacing.lg }}
        titleVariant="body"
        titleWeight="semiBold"
        right={
          <Text variant="bodySmall" color="muted">
            2 {t('common.of')} 4
          </Text>
        }
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xxl }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TextInput
          labelTranslationKey="profile_setup.full_name"
          placeholderTranslationKey="profile_setup.full_name_placeholder"
          leftIcon={<Ionicons name="person-outline" size={20} color={colors.primary} />}
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
        />

        <TextInput
          labelTranslationKey="profile_setup.corporate_work_email"
          placeholderTranslationKey="profile_setup.corporate_work_email_placeholder"
          leftIcon={<EmailOutline />}
          value={workEmail}
          onChangeText={setWorkEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          labelTranslationKey="auth.phone_number"
          placeholderTranslationKey="auth.phone_placeholder"
          leftIcon={<CallOutline />}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />

        <TextInput
          labelTranslationKey="profile_setup.corporate_position"
          placeholderTranslationKey="profile_setup.corporate_position_placeholder"
          value={position}
          onChangeText={setPosition}
          autoCapitalize="words"
        />

        {generalError ? (
          <Text variant="bodySmall" color="error" style={styles.errorText}>
            {generalError}
          </Text>
        ) : null}

        <Button
          translationKey="common.continue"
          fullWidth
          onPress={() => void handleContinue()}
          style={styles.button}
          loading={updateCurrentUser.isPending}
          disabled={updateCurrentUser.isPending}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  button: {
    marginTop: spacing.xl,
  },
  errorText: {
    marginTop: spacing.md,
  }
});
