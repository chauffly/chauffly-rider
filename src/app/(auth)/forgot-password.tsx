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
import { Text } from '@/components/common/text';
import { TextInput } from '@/components/common/text-input';
import CallOutline from '@/components/svg/CallOutline';
import { spacing } from '@/constants/spacing';
import { useTranslation } from '@/context/language-context';
import { useTheme } from '@/context/theme-context';
import { authFlowStorage } from '@/services/auth-flow-storage';
import { normalizeNigerianPhoneNumber } from '@/utils/phone';

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof ApiClientError) {
    return error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
};

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const api = useApiClient();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSendResetCode = async () => {
    const normalizedPhoneNumber = normalizeNigerianPhoneNumber(phoneNumber);

    if (!normalizedPhoneNumber) {
      setPhoneError('Use a valid Nigerian number (e.g. 08012345678 or +2348012345678).');
      return;
    }

    setSubmitting(true);
    setGeneralError('');
    setPhoneError('');

    try {
      await api.authApi.forgotPassword({
        phone_number: normalizedPhoneNumber
      });

      await authFlowStorage.set({
        mode: 'reset_password',
        phoneNumber: normalizedPhoneNumber
      });

      router.push('/(auth)/verify-otp');
    } catch (error) {
      setGeneralError(extractErrorMessage(error, 'Unable to send reset code. Please try again.'));
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
          <Text variant="h1" font="medium" align="center" style={styles.title}>
            {t('auth.reset_password')}
          </Text>
          <Text variant="body" color="muted" align="center">
            {t('auth.reset_password_subtitle')}
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            labelTranslationKey="auth.phone_number"
            placeholder={'08012345678'}
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

          {generalError ? (
            <Text variant="bodySmall" color="error" style={styles.errorText}>
              {generalError}
            </Text>
          ) : null}

          <Button
            translationKey="auth.send_reset_code"
            variant="primary"
            fullWidth
            onPress={handleSendResetCode}
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
    marginBottom: spacing.xxxl,
    marginTop: spacing.xxxxl
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
  submitButton: {
    marginTop: spacing.xl
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorText: {
    marginTop: spacing.sm
  }
});
