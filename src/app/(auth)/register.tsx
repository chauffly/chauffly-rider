import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ApiClientError, useApiClient } from '@/api-client';
import { Button } from '@/components/common/button';
import { Checkbox } from '@/components/common/checkbox';
import { SocialButton } from '@/components/common/social-button';
import { Text } from '@/components/common/text';
import { TextInput } from '@/components/common/text-input';
import CallOutline from '@/components/svg/CallOutline';
import Password from '@/components/svg/Password';
import { spacing } from '@/constants/spacing';
import { useTranslation } from '@/context/language-context';
import { useTheme } from '@/context/theme-context';
import { authFlowStorage } from '@/services/auth-flow-storage';

const NIGERIAN_PHONE_REGEX = /^\+234\d{10}$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof ApiClientError) {
    return error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
};

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const api = useApiClient();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreateAccount = async () => {
    if (!NIGERIAN_PHONE_REGEX.test(phoneNumber.trim())) {
      setErrorMessage('Use Nigerian format: +234XXXXXXXXXX');
      return;
    }

    if (!PASSWORD_REGEX.test(password)) {
      setErrorMessage('Password must be 8+ chars with uppercase, lowercase, number, and symbol.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (!agreeToTerms) {
      setErrorMessage('You must agree to the terms to continue.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      await api.authApi.register({
        phone_number: phoneNumber.trim(),
        password,
        role: 'rider'
      });

      await authFlowStorage.set({
        mode: 'register',
        phoneNumber: phoneNumber.trim()
      });

      router.push('/(auth)/verify-otp');
    } catch (error) {
      setErrorMessage(extractErrorMessage(error, 'Failed to create account. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style={colors.statusBar as 'light' | 'dark'} />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing.xxl, paddingBottom: insets.bottom + spacing.xxl }
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image
            source={require('../../../assets/images/logo-sm.png')}
            style={styles.logo}
            contentFit="contain"
          />
          <Text variant="h1" align="center" font="medium" style={styles.title}>
            {t('auth.create_account')}
          </Text>
          <Text variant="body" color="muted" align="center">
            {t('auth.register_subtitle')}
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            labelTranslationKey="auth.phone_number"
            placeholder={'+2348123456789'}
            leftIcon={<CallOutline />}
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />

          <TextInput
            labelTranslationKey="auth.new_password"
            placeholderTranslationKey="auth.create_password_placeholder"
            leftIcon={<Password />}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TextInput
            labelTranslationKey="auth.confirm_password"
            placeholderTranslationKey="auth.confirm_password_placeholder"
            leftIcon={<Password />}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <Pressable
            onPress={() => setAgreeToTerms(!agreeToTerms)}
            style={styles.termsContainer}
            disabled={submitting}
          >
            <Checkbox checked={agreeToTerms} onPress={() => setAgreeToTerms(!agreeToTerms)} />
            <Text variant="caption" color="muted" style={styles.termsText}>
              {t('auth.agree_to_terms')}
            </Text>
          </Pressable>

          {errorMessage ? (
            <Text variant="bodySmall" color="error" style={styles.errorText}>
              {errorMessage}
            </Text>
          ) : null}

          <Button
            translationKey="auth.create_account_button"
            variant="primary"
            fullWidth
            onPress={handleCreateAccount}
            disabled={submitting || !agreeToTerms}
            style={styles.createButton}
            title={submitting ? 'Please wait...' : undefined}
          />
        </View>

        <View style={styles.dividerContainer}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Text variant="caption" color="muted" style={styles.dividerText}>
            {t('auth.or_continue_with')}
          </Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        <View style={styles.socialButtons}>
          <SocialButton provider="google" onPress={() => {}} />
          <SocialButton provider="apple" onPress={() => {}} />
        </View>

        <View style={styles.footer}>
          <Text variant="bodySmall" color="muted">
            {t('auth.have_account')}{' '}
          </Text>
          <Pressable onPress={() => router.push('/(auth)/login')} disabled={submitting}>
            <Text variant="bodySmall" weight="semiBold" style={{ textDecorationLine: 'underline' }}>
              {t('auth.log_in')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxxl
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: spacing.xl
  },
  title: {
    marginBottom: spacing.sm
  },
  form: {
    marginBottom: spacing.xxl
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl
  },
  termsText: {
    flex: 1,
    marginLeft: spacing.md
  },
  createButton: {
    marginTop: spacing.md
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xxl
  },
  dividerLine: {
    flex: 1,
    height: 1
  },
  dividerText: {
    marginHorizontal: spacing.lg
  },
  socialButtons: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.xxxl
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorText: {
    marginBottom: spacing.sm
  }
});
