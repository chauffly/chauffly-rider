import { useEffect, useState } from 'react';
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
import { Text } from '@/components/common/text';
import { TextInput } from '@/components/common/text-input';
import { spacing } from '@/constants/spacing';
import { useTranslation } from '@/context/language-context';
import { useTheme } from '@/context/theme-context';
import { connectRiderSockets } from '@/runtime/rider-runtime';
import { AuthFlowState, authFlowStorage } from '@/services/auth-flow-storage';

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof ApiClientError) {
    return error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
};

export default function VerifyOtpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const api = useApiClient();

  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [flowState, setFlowState] = useState<AuthFlowState | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadFlow = async () => {
      const flow = await authFlowStorage.get();
      if (!mounted) return;

      if (!flow) {
        router.replace('/(auth)/login');
        return;
      }

      setFlowState(flow);
    };
    void loadFlow();
    return () => {
      mounted = false;
    };
  }, [router]);

  const handleConfirmCode = async () => {
    if (!flowState) {
      return;
    }

    if (!otpCode || otpCode.length !== 6) {
      setOtpError(t('auth.invalid_otp'));
      return;
    }

    setSubmitting(true);
    setOtpError('');
    setGeneralError('');

    try {
      if (flowState.mode === 'register') {
        const session = await api.authApi.verifyOtp({
          phone_number: flowState.phoneNumber,
          otp: otpCode
        });
        await api.session.setTokens(session.tokens);
        await connectRiderSockets();
        await authFlowStorage.clear();
        router.replace('/(tabs)');
        return;
      }

      router.push({
        pathname: '/(auth)/create-new-password',
        params: {
          phone_number: flowState.phoneNumber,
          otp: otpCode
        }
      });
    } catch (error) {
      setGeneralError(extractErrorMessage(error, 'OTP verification failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!flowState || submitting) {
      return;
    }

    setGeneralError('');
    try {
      if (flowState.mode === 'reset_password') {
        await api.authApi.forgotPassword({
          phone_number: flowState.phoneNumber
        });
        return;
      }

      setGeneralError('OTP resend for registration is temporarily unavailable. Please retry registration.');
    } catch (error) {
      setGeneralError(extractErrorMessage(error, 'Unable to resend code right now.'));
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
          <Text variant="h1" font="medium" align="center" style={styles.title}>
            {t('auth.enter_otp')}
          </Text>
          <Text variant="body" color="muted" align="center">
            {t('auth.verify_your_number')}
          </Text>
          <Text variant="body" color="muted" align="center">
            {t('auth.otp_subtitle')}
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            labelTranslationKey="auth.verify_code"
            placeholderTranslationKey="auth.enter_code_placeholder"
            keyboardType="number-pad"
            maxLength={6}
            value={otpCode}
            onChangeText={(text) => {
              setOtpCode(text);
              if (otpError) setOtpError('');
              if (generalError) setGeneralError('');
            }}
            error={otpError}
          />

          <Pressable onPress={handleResendCode} style={styles.resendCode} disabled={submitting}>
            <Text variant="bodySmall" weight="medium" style={{ color: colors.primary }}>
              {t('auth.resend_code')}
            </Text>
          </Pressable>

          {generalError ? (
            <Text variant="bodySmall" color="error" style={styles.errorText}>
              {generalError}
            </Text>
          ) : null}

          <Button
            translationKey="auth.confirm_code"
            variant="primary"
            fullWidth
            onPress={handleConfirmCode}
            style={styles.submitButton}
            disabled={submitting}
            title={submitting ? 'Please wait...' : undefined}
          />
        </View>

        <View style={styles.footer}>
          <Text variant="bodySmall" color="muted">
            {t('auth.remember_password')}{' '}
          </Text>
          <Pressable onPress={() => router.push('/(auth)/login')} disabled={submitting}>
            <Text variant="bodySmall" weight="medium" style={{ textDecorationLine: 'underline' }}>
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
    width: 100,
    height: 100
  },
  title: {
    marginBottom: spacing.sm
  },
  form: {
    marginBottom: spacing.xxl
  },
  resendCode: {
    alignSelf: 'flex-end',
    marginBottom: spacing.xl,
    marginTop: -spacing.sm
  },
  submitButton: {
    marginTop: spacing.md
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
