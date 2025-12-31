import { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/common/text';
import { TextInput } from '@/components/common/text-input';
import { Button } from '@/components/common/button';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { spacing } from '@/constants/spacing';

export default function VerifyOtpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');

  const handleConfirmCode = () => {
    if (!otpCode || otpCode.length !== 6) {
      setOtpError(t('auth.invalid_otp'));
      return;
    }
    setOtpError('');
    router.push('/(auth)/create-new-password');
  };

  const handleResendCode = () => {
    // TODO: Implement resend code logic
  };

  const handleLogin = () => {
    router.push('/(auth)/login');
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
          { paddingTop: insets.top + spacing.xxl, paddingBottom: insets.bottom + spacing.xxl },
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
            }}
            error={otpError}
          />

          <Pressable onPress={handleResendCode} style={styles.resendCode}>
            <Text variant="bodySmall" weight="medium" style={{ color: colors.primary }}>
              {t('auth.resend_code')}
            </Text>
          </Pressable>

          <Button
            translationKey="auth.confirm_code"
            variant="primary"
            fullWidth
            onPress={handleConfirmCode}
            style={styles.submitButton}
          />
        </View>

        <View style={styles.footer}>
          <Text variant="bodySmall" color="muted">
            {t('auth.remember_password')}{' '}
          </Text>
          <Pressable onPress={handleLogin}>
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
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    marginBottom: spacing.sm,
  },
  form: {
    marginBottom: spacing.xxl,
  },
  resendCode: {
    alignSelf: 'flex-end',
    marginBottom: spacing.xl,
    marginTop: -spacing.sm,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
