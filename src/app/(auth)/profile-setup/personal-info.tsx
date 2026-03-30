import { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { format } from 'date-fns';

import { Text } from '@/components/common/text';
import { TextInput } from '@/components/common/text-input';
import { SelectInput } from '@/components/common/select-input';
import { Button } from '@/components/common/button';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { borderRadius, spacing } from '@/constants/spacing';
import UserOutline from '@/components/svg/UserOutline';
import EmailOutline from '@/components/svg/EmailOutline';
import GenderOutline from '@/components/svg/GenderOutline';
import CalendarOutline from '@/components/svg/CalendarOutline';
import CameraOutline from '@/components/svg/CameraOutline';
import PersonPlaceholder from '@/components/svg/PersonPlaceholder';
import { StackHeader } from '@/components/common/stack-header';
import { riderOnboardingProgressStorage } from '@/services/rider-onboarding-progress';

const genderOptions = [
  { label: 'Male', value: 'male', translationKey: 'profile_setup.gender_male' },
  { label: 'Female', value: 'female', translationKey: 'profile_setup.gender_female' },
];

export default function PersonalInfoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ role: string }>();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const dateOfBirthValue = useMemo(
    () => (dateOfBirth ? format(dateOfBirth, 'dd/MM/yyyy') : ''),
    [dateOfBirth]
  );
  const selectedDateKey = dateOfBirth ? format(dateOfBirth, 'yyyy-MM-dd') : undefined;
  const todayKey = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    void riderOnboardingProgressStorage.setCurrentRoute('/(auth)/profile-setup/personal-info');
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    // Navigate to preferences screen
    router.push({
      pathname: '/(auth)/profile-setup/preferences',
      params: { role: params.role ?? 'passenger' },
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
      <StackHeader
        translationKey="profile_setup.fill_personal_info"
        onBack={handleBack}
        style={{ paddingTop: insets.top + spacing.md, paddingHorizontal: spacing.lg }}
        titleVariant="body"
        titleWeight="semiBold"
        right={
          <Text variant="bodySmall" color="muted">
            1 {t('common.of')} 3
          </Text>
        }
      />

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

          <SelectInput
            labelTranslationKey="profile_setup.gender"
            placeholderTranslationKey="profile_setup.gender_placeholder"
            leftIcon={<GenderOutline />}
            options={genderOptions}
            value={gender}
            onValueChange={setGender}
          />

          <Pressable onPress={() => setIsDatePickerOpen(true)}>
            <View pointerEvents="none">
              <TextInput
                labelTranslationKey="profile_setup.date_of_birth"
                placeholderTranslationKey="profile_setup.date_of_birth_placeholder"
                leftIcon={<CalendarOutline />}
                value={dateOfBirthValue}
                editable={false}
              />
            </View>
          </Pressable>
        </View>

        <Button
          translationKey="common.continue"
          variant="primary"
          fullWidth
          onPress={handleContinue}
        />
      </ScrollView>

      <Modal
        transparent
        animationType="fade"
        visible={isDatePickerOpen}
        onRequestClose={() => setIsDatePickerOpen(false)}
      >
        <View style={styles.popoverOverlay} pointerEvents="box-none">
          <Pressable style={styles.popoverBackdrop} onPress={() => setIsDatePickerOpen(false)} />
          <View
            style={[
              styles.popoverCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowColor: colors.textPrimary,
                width: Math.min(screenWidth - spacing.xl, 340),
              },
            ]}
          >
            <Calendar
              current={selectedDateKey ?? todayKey}
              maxDate={todayKey}
              onDayPress={(day) => {
                setDateOfBirth(new Date(`${day.dateString}T00:00:00`));
                setIsDatePickerOpen(false);
              }}
              markedDates={
                selectedDateKey
                  ? {
                      [selectedDateKey]: {
                        selected: true,
                        selectedColor: colors.primary,
                        selectedTextColor: colors.textInverse,
                      },
                    }
                  : undefined
              }
              theme={{
                backgroundColor: colors.surface,
                calendarBackground: colors.surface,
                textSectionTitleColor: colors.textSecondary,
                selectedDayBackgroundColor: colors.primary,
                selectedDayTextColor: colors.textInverse,
                todayTextColor: colors.primary,
                dayTextColor: colors.textPrimary,
                monthTextColor: colors.textPrimary,
                arrowColor: colors.textPrimary,
              }}
            />
          </View>
        </View>
      </Modal>
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
  popoverOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  popoverBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  popoverCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
});
