import { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
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
import Password from '@/components/svg/Password';

export default function CreateNewPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSavePassword = () => {
    if (!newPassword || newPassword.length < 6) {
      setPasswordError(t('auth.password_too_short'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t('auth.passwords_dont_match'));
      return;
    }
    setPasswordError('');
    // TODO: Implement password save logic
    router.replace('/(auth)/login');
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
            {t('auth.create_new_password')}
          </Text>
          <Text variant="body" color="muted" align="center">
            {t('auth.create_new_password_subtitle')}
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            labelTranslationKey="auth.new_password"
            placeholderTranslationKey="auth.create_password_placeholder"
            leftIcon={<Password />}
            secureTextEntry
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              if (passwordError) setPasswordError('');
            }}
            error={passwordError}
          />

          <TextInput
            labelTranslationKey="auth.confirm_password"
            placeholderTranslationKey="auth.confirm_password_placeholder"
            leftIcon={<Password />}
            secureTextEntry
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (passwordError) setPasswordError('');
            }}
          />

          <Button
            translationKey="auth.save_password"
            variant="primary"
            fullWidth
            onPress={handleSavePassword}
            style={styles.submitButton}
          />
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
  submitButton: {
    marginTop: spacing.xl,
  },
});
