import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/common/button';
import { StackHeader } from '@/components/common/stack-header';
import { Text } from '@/components/common/text';
import { TextInput } from '@/components/common/text-input';
import CallOutline from '@/components/svg/CallOutline';
import EmailOutline from '@/components/svg/EmailOutline';
import UserOutline from '@/components/svg/UserOutline';
import { spacing } from '@/constants/spacing';
import { useTranslation } from '@/context/language-context';
import { useTheme } from '@/context/theme-context';

export default function CorporateAdminInfoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: string }>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [fullName, setFullName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [position, setPosition] = useState('');

  const handleContinue = () => {
    router.push({
      pathname: '/(auth)/profile-setup/corporate-document-upload',
      params: { role: params.role ?? 'corporate' },
    });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style={colors.statusBar as 'light' | 'dark'} />

      <StackHeader
        translationKey="profile_setup.corporate_admin_info_title"
        onBack={() => router.back()}
        style={{ paddingTop: insets.top + spacing.md, paddingHorizontal: spacing.lg }}
        titleVariant="body"
        titleWeight="semiBold"
        right={
          <Text variant="bodySmall" color="muted">
            2 {t('common.of')} 4
          </Text>
        }
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xxl }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TextInput
          labelTranslationKey="profile_setup.full_name"
          placeholderTranslationKey="profile_setup.full_name_placeholder"
          leftIcon={<UserOutline />}
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
        />

        <TextInput
          labelTranslationKey="profile_setup.corporate_work_email"
          placeholderTranslationKey="profile_setup.corporate_work_email_placeholder"
          leftIcon={<EmailOutline />}
          value={workEmail}
          onChangeText={setWorkEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          labelTranslationKey="auth.phone_number"
          placeholderTranslationKey="auth.phone_placeholder"
          leftIcon={<CallOutline />}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />

        <TextInput
          labelTranslationKey="profile_setup.corporate_position"
          placeholderTranslationKey="profile_setup.corporate_position_placeholder"
          value={position}
          onChangeText={setPosition}
          autoCapitalize="words"
        />

        <Button translationKey="common.continue" fullWidth onPress={handleContinue} style={styles.button} />
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
  button: {
    marginTop: spacing.xl,
  },
});
