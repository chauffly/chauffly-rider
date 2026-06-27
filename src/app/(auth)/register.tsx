import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ApiClientError, useApiClient } from '@/api-client';
import { Button } from '@/components/common/button';
import { Checkbox } from '@/components/common/checkbox';
import { SocialButton } from '@/components/common/social-button';
import { Text } from '@/components/common/text';
import { TextInput } from '@/components/common/text-input';
import CallOutline from '@/components/svg/CallOutline';
import EmailOutline from '@/components/svg/EmailOutline';
import Password from '@/components/svg/Password';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTranslation } from '@/context/language-context';
import { useTheme } from '@/context/theme-context';
import { connectRiderSockets } from '@/runtime/rider-runtime';
import { accountRoleService } from '@/services/account-role';
import { authFlowStorage } from '@/services/auth-flow-storage';
import { riderOnboardingProgressStorage } from '@/services/rider-onboarding-progress';
import { normalizeNigerianPhoneNumber } from '@/utils/phone';
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

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isEmailValid = email.trim().includes('@');
  const normalizedFullName = fullName.trim().replace(/\s+/g, ' ');
  const fullNameParts = normalizedFullName.split(' ').filter(Boolean);
  const isFullNameValid = fullNameParts.length >= 2;
  const normalizedPhoneNumber = normalizeNigerianPhoneNumber(phoneNumber);
  const isPhoneValid = Boolean(normalizedPhoneNumber);
  const isPasswordValid = PASSWORD_REGEX.test(password);
  const doPasswordsMatch = password.length > 0 && password === confirmPassword;
  const canSubmit = !submitting;

  const handleAppleLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        setErrorMessage('Apple sign-in failed. Please try again.');
        return;
      }

      setSubmitting(true);
      setErrorMessage('');

      const session = await api.authApi.appleLogin({
        identity_token: credential.identityToken,
        email: credential.email,
        first_name: credential.fullName?.givenName ?? null,
        last_name: credential.fullName?.familyName ?? null,
        role: 'rider',
      });

      await api.session.setTokens(session.tokens);
      await accountRoleService.setRole('rider');
      await connectRiderSockets();
      const nextRoute = await riderOnboardingProgressStorage.resolvePostAuthRoute({
        id: session.user.id,
        status: session.user.status
      });
      router.replace(nextRoute);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'ERR_REQUEST_CANCELED') {
        return;
      }
      setErrorMessage(extractErrorMessage(err, 'Apple sign-in failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAccount = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = fullName.trim().replace(/\s+/g, ' ');
    const nameParts = normalizedName.split(' ').filter(Boolean);
    const normalizedPhone = normalizeNigerianPhoneNumber(phoneNumber);

    if (nameParts.length < 2) {
      setErrorMessage('Enter your full name.');
      return;
    }

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      setErrorMessage('Enter a valid email address.');
      return;
    }

    if (!normalizedPhone) {
      setErrorMessage('Enter a valid phone number using digits, with an optional leading +.');
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
      const [firstName, ...lastNameParts] = nameParts;
      await api.authApi.register({
        first_name: firstName,
        last_name: lastNameParts.join(' '),
        email: normalizedEmail,
        phone_number: normalizedPhone,
        password,
        role: 'rider'
      });

      await authFlowStorage.set({
        mode: 'register',
        email: normalizedEmail,
        phoneNumber: normalizedPhone
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
            labelTranslationKey="account.full_name_label"
            placeholderTranslationKey="account.name_placeholder"
            leftIcon={<Ionicons name="person-outline" size={20} color={colors.primary} />}
            value={fullName}
            onChangeText={(text) => {
              setFullName(text);
              if (errorMessage) setErrorMessage('');
            }}
            autoCapitalize="words"
            error={fullName.length > 0 && !isFullNameValid ? 'Enter your full name.' : undefined}
          />

          <TextInput
            labelTranslationKey="auth.email"
            placeholder="name@example.com"
            leftIcon={<EmailOutline />}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errorMessage) setErrorMessage('');
            }}
            error={email.length > 0 && !isEmailValid ? 'Enter a valid email address.' : undefined}
          />

          <TextInput
            labelTranslationKey="auth.phone_number"
            placeholder={'08012345678'}
            leftIcon={<CallOutline />}
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={(text) => {
              setPhoneNumber(text);
              if (errorMessage) setErrorMessage('');
            }}
            error={
              phoneNumber.length > 0 && !isPhoneValid
                ? 'Enter a valid phone number using digits, with an optional leading +.'
                : undefined
            }
          />

          <TextInput
            labelTranslationKey="auth.new_password"
            placeholderTranslationKey="auth.create_password_placeholder"
            leftIcon={<Password />}
            secureTextEntry
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errorMessage) setErrorMessage('');
            }}
            error={
              password.length > 0 && !isPasswordValid
                ? 'Password must be 8+ chars with uppercase, lowercase, number, and symbol.'
                : undefined
            }
          />

          <TextInput
            labelTranslationKey="auth.confirm_password"
            placeholderTranslationKey="auth.confirm_password_placeholder"
            leftIcon={<Password />}
            secureTextEntry
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errorMessage) setErrorMessage('');
            }}
            error={
              confirmPassword.length > 0 && !doPasswordsMatch ? 'Passwords do not match.' : undefined
            }
          />

          <View style={styles.termsContainer}>
            <Checkbox checked={agreeToTerms} onPress={() => setAgreeToTerms(!agreeToTerms)} />
            <Text variant="caption" color="muted" style={styles.termsText}>
              {t('auth.agree_to_terms')}
            </Text>
          </View>

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
            disabled={!canSubmit}
            style={styles.createButton}
            loading={submitting}
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
          <SocialButton provider="apple" onPress={handleAppleLogin} />
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
    borderRadius: borderRadius.full,
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
