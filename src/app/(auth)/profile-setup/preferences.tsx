import { useEffect, useState } from 'react';
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
import { SelectInput } from '@/components/common/select-input';
import { Button } from '@/components/common/button';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { spacing } from '@/constants/spacing';
import { StackHeader } from '@/components/common/stack-header';
import { riderOnboardingProgressStorage } from '@/services/rider-onboarding-progress';

const chauffeurOptions = [
  { label: 'Any Available', value: 'any' },
  { label: 'Male Chauffeur', value: 'male' },
  { label: 'Female Chauffeur', value: 'female' },
];

const rideStyleOptions = [
  { label: 'Go', value: 'go', translationKey: 'profile_setup.ride_style_go' },
  { label: 'Plus', value: 'plus', translationKey: 'profile_setup.ride_style_plus' },
  { label: 'Luxe', value: 'luxe', translationKey: 'profile_setup.ride_style_luxe' },
  { label: 'Black', value: 'black', translationKey: 'profile_setup.ride_style_black' },
];

const accessibilityOptions = [
  { label: 'No assistance needed', value: 'none', translationKey: 'profile_setup.accessibility_none' },
  { label: 'Wheelchair accessible', value: 'wheelchair', translationKey: 'profile_setup.accessibility_wheelchair' },
  { label: 'Hearing assistance', value: 'hearing', translationKey: 'profile_setup.accessibility_hearing' },
  { label: 'Visual assistance', value: 'visual', translationKey: 'profile_setup.accessibility_visual' },
];

export default function PreferencesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ role: string }>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [preferredChauffeur, setPreferredChauffeur] = useState('');
  const [rideStyle, setRideStyle] = useState('');
  const [accessibility, setAccessibility] = useState('');

  useEffect(() => {
    void riderOnboardingProgressStorage.setCurrentRoute('/(auth)/profile-setup/preferences');
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleContinue = async () => {
    await riderOnboardingProgressStorage.markComplete();
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style={colors.statusBar as 'light' | 'dark'} />

      {/* Header */}
      <StackHeader
        translationKey="profile_setup.preference"
        onBack={handleBack}
        style={{ paddingTop: insets.top + spacing.md, paddingHorizontal: spacing.lg }}
        titleVariant="body"
        titleWeight="semiBold"
        right={
          <Text variant="bodySmall" color="muted">
            2 {t('common.of')} 3
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
        {/* Form */}
        <View style={styles.form}>

          <SelectInput
            labelTranslationKey="profile_setup.ride_style"
            placeholderTranslationKey="profile_setup.ride_style_placeholder"
            options={rideStyleOptions}
            value={rideStyle}
            onValueChange={setRideStyle}
          />

          <SelectInput
            labelTranslationKey="profile_setup.preferred_chauffeurs"
            placeholderTranslationKey="profile_setup.preferred_chauffeurs_placeholder"
            options={chauffeurOptions}
            value={preferredChauffeur}
            onValueChange={setPreferredChauffeur}
          />

          <SelectInput
            labelTranslationKey="profile_setup.accessibility_options"
            placeholderTranslationKey="profile_setup.accessibility_options_placeholder"
            options={accessibilityOptions}
            value={accessibility}
            onValueChange={setAccessibility}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            translationKey="common.continue"
            variant="primary"
            fullWidth
            onPress={handleContinue}
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
    paddingTop: spacing.xl,
  },
  form: {
    flex: 1,
    marginBottom: spacing.xxl,
  },
  buttonContainer: {
    marginTop: 'auto',
  },
});
