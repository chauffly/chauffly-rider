import { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/common/text';
import { TextInput } from '@/components/common/text-input';
import { SelectInput } from '@/components/common/select-input';
import { Button } from '@/components/common/button';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { borderRadius, spacing } from '@/constants/spacing';
import UserOutline from '@/components/svg/UserOutline';
import EmailOutline from '@/components/svg/EmailOutline';
import CallOutline from '@/components/svg/CallOutline';
import GenderOutline from '@/components/svg/GenderOutline';
import CalendarOutline from '@/components/svg/CalendarOutline';
import ChevronLeft from '@/components/svg/ChevronLeft';
import CameraOutline from '@/components/svg/CameraOutline';
import PersonPlaceholder from '@/components/svg/PersonPlaceholder';

const genderOptions = [
  { label: 'Male', value: 'male', translationKey: 'profile_setup.gender_male' },
  { label: 'Female', value: 'female', translationKey: 'profile_setup.gender_female' },
];

export default function PersonalInfoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ role: string }>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    // Navigate to preferences screen
    router.push({
      pathname: '/(auth)/profile-setup/preferences',
      params: { role: params.role },
    });
  };

  const handlePhotoUpload = () => {
    // TODO: Implement photo upload
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style={colors.statusBar as 'light' | 'dark'} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Pressable onPress={handleBack} style={styles.backButton} hitSlop={8}>
          <ChevronLeft color={colors.textPrimary} />
        </Pressable>
        <Text variant="body" weight="semiBold" style={styles.headerTitle}>
          {t('profile_setup.fill_personal_info')}
        </Text>
        <Text variant="bodySmall" color="muted">
          1 {t('common.of')} 3
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xxl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Photo */}
        <View style={styles.photoContainer}>
          <View style={[styles.photoPlaceholder, { backgroundColor: "#D9D9D9" }]}>
            <PersonPlaceholder />
          </View>
          <Pressable
            onPress={handlePhotoUpload}
            style={[styles.cameraButton, { backgroundColor: colors.primary }]}
          >
            <CameraOutline size={16} color={colors.buttonPrimaryText} />
          </Pressable>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            labelTranslationKey="profile_setup.full_name"
            placeholderTranslationKey="profile_setup.full_name_placeholder"
            leftIcon={<UserOutline />}
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />

          <TextInput
            labelTranslationKey="profile_setup.email"
            placeholderTranslationKey="profile_setup.email_placeholder"
            leftIcon={<EmailOutline />}
            value={email}
            onChangeText={setEmail}
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

          <SelectInput
            labelTranslationKey="profile_setup.gender"
            placeholderTranslationKey="profile_setup.gender_placeholder"
            leftIcon={<GenderOutline />}
            options={genderOptions}
            value={gender}
            onValueChange={setGender}
          />

          <TextInput
            labelTranslationKey="profile_setup.date_of_birth"
            placeholderTranslationKey="profile_setup.date_of_birth_placeholder"
            leftIcon={<CalendarOutline />}
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            keyboardType="numbers-and-punctuation"
          />
        </View>

        <Button
          translationKey="common.continue"
          variant="primary"
          fullWidth
          onPress={handleContinue}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    marginBottom: spacing.xxl,
  },
});
