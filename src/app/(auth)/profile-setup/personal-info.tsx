import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Modal,
  useWindowDimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { format } from 'date-fns';

import { Text } from '@/components/common/text';
import { TextInput } from '@/components/common/text-input';
import { SelectInput } from '@/components/common/select-input';
import { Button } from '@/components/common/button';
import { useCurrentUser, useUploadAvatar } from '@/api-client';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { borderRadius, spacing } from '@/constants/spacing';
import GenderOutline from '@/components/svg/GenderOutline';
import CalendarOutline from '@/components/svg/CalendarOutline';
import CameraOutline from '@/components/svg/CameraOutline';
import { StackHeader } from '@/components/common/stack-header';
import { riderOnboardingProgressStorage } from '@/services/rider-onboarding-progress';
import { asRecord, asString } from '@/utils/api-helpers';

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
  const { data: currentUserData } = useCurrentUser();
  const uploadAvatar = useUploadAvatar();

  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const currentUser = asRecord(currentUserData);
  const avatarUrl = asString(currentUser.avatarUrl ?? currentUser.avatar_url);

  const dateOfBirthValue = useMemo(
    () => (dateOfBirth ? format(dateOfBirth, 'dd/MM/yyyy') : ''),
    [dateOfBirth]
  );
  const selectedDateKey = dateOfBirth ? format(dateOfBirth, 'yyyy-MM-dd') : undefined;
  const todayKey = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    void riderOnboardingProgressStorage.setCurrentRoute('/(auth)/profile-setup/personal-info');
  }, []);

  useEffect(() => {
    const user =
      currentUserData && typeof currentUserData === 'object'
        ? (currentUserData as Record<string, unknown>)
        : {};
    const firstName =
      typeof user.firstName === 'string'
        ? user.firstName
        : typeof user.first_name === 'string'
          ? user.first_name
          : '';
    const lastName =
      typeof user.lastName === 'string'
        ? user.lastName
        : typeof user.last_name === 'string'
          ? user.last_name
          : '';
    const combinedName = `${firstName} ${lastName}`.trim();
    if (combinedName) {
      setFullName(combinedName);
    }
  }, [currentUserData]);

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
    void (async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.9,
        aspect: [1, 1]
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];
      const formData = new FormData();
      formData.append(
        'avatar',
        {
          uri: asset.uri,
          name: asset.fileName ?? `avatar-${Date.now()}.jpg`,
          type: asset.mimeType ?? 'image/jpeg'
        } as any
      );
      await uploadAvatar.mutateAsync(formData);
    })();
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
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.photoImage} />
            ) : (
              <Ionicons name="person" size={56} color={colors.textMuted} />
            )}
          </View>
          <Pressable
            onPress={handlePhotoUpload}
            style={[styles.cameraButton, { backgroundColor: colors.primary }]}
            disabled={uploadAvatar.isPending}
          >
            <CameraOutline size={16} color={colors.buttonPrimaryText} />
          </Pressable>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            labelTranslationKey="profile_setup.full_name"
            placeholderTranslationKey="profile_setup.full_name_placeholder"
            leftIcon={<Ionicons name="person-outline" size={20} color={colors.primary} />}
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
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
    overflow: 'hidden'
  },
  photoImage: {
    width: '100%',
    height: '100%'
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
