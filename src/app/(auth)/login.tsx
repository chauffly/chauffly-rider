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
import { SocialButton } from '@/components/common/social-button';
import { Text } from '@/components/common/text';
import { TextInput } from '@/components/common/text-input';
import CallOutline from '@/components/svg/CallOutline';
import Password from '@/components/svg/Password';
import { spacing } from '@/constants/spacing';
import { useTranslation } from '@/context/language-context';
import { useTheme } from '@/context/theme-context';
import { connectRiderSockets } from '@/runtime/rider-runtime';

const NIGERIAN_PHONE_REGEX = /^\+234\d{10}$/;

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof ApiClientError) {
    return error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
};

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const api = useApiClient();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!NIGERIAN_PHONE_REGEX.test(phoneNumber.trim())) {
      setPhoneError('Use Nigerian format: +234XXXXXXXXXX');
      return;
    }

    if (!password) {
      setGeneralError('Password is required.');
      return;
    }

    setSubmitting(true);
    setGeneralError('');
    setPhoneError('');

    try {
      const session = await api.authApi.login({
        phone_number: phoneNumber.trim(),
        password
      });

      await api.session.setTokens(session.tokens);
      await connectRiderSockets();
      router.replace('/(tabs)');
    } catch (error) {
      setGeneralError(extractErrorMessage(error, 'Unable to log in. Please try again.'));
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
          {
            paddingTop: insets.top + spacing.xxl,
            paddingBottom: insets.bottom + spacing.xxl
          }
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
          <Text variant="h1" font="medium" align="center" style={styles.title}>
            {t('auth.welcome_back')}
          </Text>
          <Text variant="body" color="muted" align="center">
            {t('auth.login_subtitle')}
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            labelTranslationKey="auth.phone_number"
            placeholder={'+2348123456789'}
            leftIcon={<CallOutline />}
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={(text) => {
              setPhoneNumber(text);
              if (phoneError) setPhoneError('');
              if (generalError) setGeneralError('');
            }}
            error={phoneError}
          />

          <TextInput
            labelTranslationKey="auth.password"
            placeholderTranslationKey="auth.password_placeholder"
            leftIcon={<Password />}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Pressable
            onPress={() => router.push('/(auth)/forgot-password')}
            style={styles.forgotPassword}
            disabled={submitting}
          >
            <Text
              variant="bodySmall"
              weight="medium"
              style={{ textDecorationLine: 'underline' }}
            >
              {t('auth.forgot_password')}
            </Text>
          </Pressable>

          {generalError ? (
            <Text variant="bodySmall" color="error" style={styles.errorText}>
              {generalError}
            </Text>
          ) : null}

          <Button
            translationKey="auth.log_in"
            variant="primary"
            fullWidth
            onPress={handleLogin}
            style={styles.loginButton}
            disabled={submitting}
            title={submitting ? 'Please wait...' : undefined}
          />
        </View>

        <View style={styles.dividerContainer}>
          <View
            style={[styles.dividerLine, { backgroundColor: colors.border }]}
          />
          <Text variant="caption" color="muted" style={styles.dividerText}>
            {t('auth.or_continue_with')}
          </Text>
          <View
            style={[styles.dividerLine, { backgroundColor: colors.border }]}
          />
        </View>

        <View style={styles.socialButtons}>
          <SocialButton provider="google" onPress={() => {}} />
          <SocialButton provider="apple" onPress={() => {}} />
        </View>

        <View style={styles.footer}>
          <Text variant="bodySmall" color="muted">
            {t('auth.no_account')}{' '}
          </Text>
          <Pressable onPress={() => router.push('/(auth)/register')} disabled={submitting}>
            <Text
              variant="bodySmall"
              weight="medium"
              style={{ textDecorationLine: 'underline' }}
            >
              {t('auth.sign_up')}
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
    width: 100,
    height: 100
  },
  title: {
    marginBottom: spacing.sm
  },
  form: {
    marginBottom: spacing.xxl
  },
  forgotPassword: {
    alignSelf: 'flex-start',
    marginBottom: spacing.xl
  },
  loginButton: {
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
    marginBottom: spacing.md
  }
});
