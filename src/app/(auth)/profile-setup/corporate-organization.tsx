import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/common/button';
import { SelectInput } from '@/components/common/select-input';
import { StackHeader } from '@/components/common/stack-header';
import { Text } from '@/components/common/text';
import { TextInput } from '@/components/common/text-input';
import CallOutline from '@/components/svg/CallOutline';
import EmailOutline from '@/components/svg/EmailOutline';
import UserOutline from '@/components/svg/UserOutline';
import { spacing } from '@/constants/spacing';
import { useTranslation } from '@/context/language-context';
import { useTheme } from '@/context/theme-context';
import { riderOnboardingProgressStorage } from '@/services/rider-onboarding-progress';

const businessTypeOptions = [
  { label: 'Technology', value: 'technology', translationKey: 'profile_setup.corporate_business_type_technology' },
  { label: 'Finance', value: 'finance', translationKey: 'profile_setup.corporate_business_type_finance' },
  { label: 'Hospitality', value: 'hospitality', translationKey: 'profile_setup.corporate_business_type_hospitality' },
  { label: 'Government', value: 'government', translationKey: 'profile_setup.corporate_business_type_government' },
  { label: 'Other', value: 'other', translationKey: 'profile_setup.corporate_business_type_other' },
];

const countryOptions = [
  { label: 'Nigeria', value: 'nigeria', translationKey: 'profile_setup.corporate_country_nigeria' },
];

export default function CorporateOrganizationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: string }>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [organizationName, setOrganizationName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('nigeria');

  useEffect(() => {
    void riderOnboardingProgressStorage.setCurrentRoute('/(auth)/profile-setup/corporate-organization');
  }, []);

  const handleContinue = () => {
    router.push({
      pathname: '/(auth)/profile-setup/corporate-admin-info',
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
        translationKey="profile_setup.corporate_organization_title"
        onBack={() => router.back()}
        style={{ paddingTop: insets.top + spacing.md, paddingHorizontal: spacing.lg }}
        titleVariant="body"
        titleWeight="semiBold"
        right={
          <Text variant="bodySmall" color="muted">
            1 {t('common.of')} 4
          </Text>
        }
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xxl }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TextInput
          labelTranslationKey="profile_setup.corporate_organization_name"
          placeholderTranslationKey="profile_setup.corporate_organization_name_placeholder"
          leftIcon={<UserOutline />}
          value={organizationName}
          onChangeText={setOrganizationName}
          autoCapitalize="words"
        />

        <SelectInput
          labelTranslationKey="profile_setup.corporate_business_type"
          placeholderTranslationKey="profile_setup.corporate_business_type_placeholder"
          options={businessTypeOptions}
          value={businessType}
          onValueChange={setBusinessType}
        />

        <TextInput
          labelTranslationKey="profile_setup.corporate_company_email"
          placeholderTranslationKey="profile_setup.corporate_company_email_placeholder"
          leftIcon={<EmailOutline />}
          value={companyEmail}
          onChangeText={setCompanyEmail}
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
          labelTranslationKey="profile_setup.corporate_address"
          placeholderTranslationKey="profile_setup.corporate_address_placeholder"
          value={address}
          onChangeText={setAddress}
          autoCapitalize="words"
        />

        <SelectInput
          labelTranslationKey="profile_setup.corporate_country"
          placeholderTranslationKey="profile_setup.corporate_country_placeholder"
          options={countryOptions}
          value={country}
          onValueChange={setCountry}
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
