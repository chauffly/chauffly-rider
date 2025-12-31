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
import CallOutline from '@/components/svg/CallOutline';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const handleSendResetCode = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setPhoneError(t('auth.invalid_phone'));
      return;
    }
    setPhoneError('');
    router.push('/(auth)/verify-otp');
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
            {t('auth.reset_password')}
          </Text>
          <Text variant="body" color="muted" align="center">
            {t('auth.reset_password_subtitle')}
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            labelTranslationKey="auth.phone_number"
            placeholderTranslationKey="auth.phone_placeholder"
            leftIcon={<CallOutline />}
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={(text) => {
              setPhoneNumber(text);
              if (phoneError) setPhoneError('');
            }}
            error={phoneError}
          />

          <Button
            translationKey="auth.send_reset_code"
            variant="primary"
            fullWidth
            onPress={handleSendResetCode}
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
    marginTop: spacing.xxxxl,
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
  submitButton: {
    marginTop: spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
