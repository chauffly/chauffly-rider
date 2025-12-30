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
import { Checkbox } from '@/components/common/checkbox';
import { SocialButton } from '@/components/common/social-button';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { spacing } from '@/constants/spacing';
import CallOutline from '@/components/svg/CallOutline';
import Password from '@/components/svg/Password';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handleCreateAccount = () => {
    // TODO: Implement account creation
    router.replace('/(tabs)');
  };

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  const handleGoogleLogin = () => {
    // TODO: Implement Google login
  };

  const handleAppleLogin = () => {
    // TODO: Implement Apple login
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
          <Text variant="h1" align="center" font='medium' style={styles.title}>
            {t('auth.create_account')}
          </Text>
          <Text variant="body" color="muted" align="center">
            {t('auth.register_subtitle')}
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            labelTranslationKey="auth.phone_number"
            placeholderTranslationKey="auth.phone_placeholder"
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
          >
            <Checkbox checked={agreeToTerms} onPress={() => setAgreeToTerms(!agreeToTerms)} />
            <Text variant="caption" color="muted" style={styles.termsText}>
              {t('auth.agree_to_terms')}
            </Text>
          </Pressable>

          <Button
            translationKey="auth.create_account_button"
            variant="primary"
            fullWidth
            onPress={handleCreateAccount}
            disabled={!agreeToTerms}
            style={styles.createButton}
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
          <SocialButton provider="google" onPress={handleGoogleLogin} />
          <SocialButton provider="apple" onPress={handleAppleLogin} />
        </View>

        <View style={styles.footer}>
          <Text variant="bodySmall" color="muted">
            {t('auth.have_account')}{' '}
          </Text>
          <Pressable onPress={handleLogin}>
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
    width: 80,
    height: 80,
    marginBottom: spacing.xl,
  },
  title: {
    marginBottom: spacing.sm,
  },
  form: {
    marginBottom: spacing.xxl,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  termsText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  createButton: {
    marginTop: spacing.md,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: spacing.lg,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.xxxl,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
