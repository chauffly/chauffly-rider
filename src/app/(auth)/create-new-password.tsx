import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ApiClientError, useApiClient } from '@/api-client';
import { Button } from '@/components/common/button';
import { Text } from '@/components/common/text';
import { TextInput } from '@/components/common/text-input';
import Password from '@/components/svg/Password';
import { spacing } from '@/constants/spacing';
import { useTranslation } from '@/context/language-context';
import { useTheme } from '@/context/theme-context';
import { authFlowStorage } from '@/services/auth-flow-storage';

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

export default function CreateNewPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const api = useApiClient();
  const params = useLocalSearchParams<{ email?: string; otp?: string }>();

  const [email, setEmail] = useState(params.email ?? '');
  const [otp, setOtp] = useState(params.otp ?? '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (email && otp) {
      return;
    }

    let mounted = true;
    const loadFlow = async () => {
      const flow = await authFlowStorage.get();
      if (!mounted || !flow) return;
      setEmail((current) => current || flow.email);
    };
    void loadFlow();

    return () => {
      mounted = false;
    };
  }, [email, otp]);

  const handleSavePassword = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !otp) {
      setErrorMessage('Missing password reset context. Request a new OTP.');
      return;
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      setErrorMessage('Password must be 8+ chars with uppercase, lowercase, number, and symbol.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage(t('auth.passwords_dont_match'));
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      await api.authApi.resetPassword({
        email: normalizedEmail,
        otp,
        new_password: newPassword
      });

      await authFlowStorage.clear();
      router.replace('/(auth)/login');
    } catch (error) {
      setErrorMessage(extractErrorMessage(error, 'Unable to reset password. Please try again.'));
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
            {t('auth.create_new_password')}
          </Text>
          <Text variant="body" color="muted" align="center">
            {t('auth.create_new_password_subtitle')}
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            labelTranslationKey="auth.verify_code"
            placeholderTranslationKey="auth.enter_code_placeholder"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
          />

          <TextInput
            labelTranslationKey="auth.new_password"
            placeholderTranslationKey="auth.create_password_placeholder"
            leftIcon={<Password />}
            secureTextEntry
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              if (errorMessage) setErrorMessage('');
            }}
            error={errorMessage}
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
          />

          <Button
            translationKey="auth.save_password"
            variant="primary"
            fullWidth
            onPress={handleSavePassword}
            style={styles.submitButton}
            disabled={submitting}
            loading={submitting}
          />
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
  submitButton: {
    marginTop: spacing.xl
  }
});
