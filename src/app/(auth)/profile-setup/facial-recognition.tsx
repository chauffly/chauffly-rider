import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/common/text';
import { Button } from '@/components/common/button';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { spacing } from '@/constants/spacing';
import FaceOutline from '@/components/svg/FaceOutline';
import { StackHeader } from '@/components/common/stack-header';

export default function FacialRecognitionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: string }>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const isCorporate = params.role === 'corporate';
  const currentStep = isCorporate ? 5 : 3;
  const totalSteps = isCorporate ? 5 : 3;

  const handleBack = () => {
    router.back();
  };

  const handleSkip = () => {
    // Navigate to main app
    router.replace('/(tabs)');
  };

  const handleSetUp = () => {
    // Navigate to facial verification success screen
    router.push('/(auth)/profile-setup/facial-verification-success');
  };

  const bulletPoints = [
    t('profile_setup.facial_bullet_1'),
    t('profile_setup.facial_bullet_2'),
    t('profile_setup.facial_bullet_3'),
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colors.statusBar as 'light' | 'dark'} />

      {/* Header */}
      <StackHeader
        translationKey="profile_setup.facial_recognition"
        onBack={handleBack}
        style={{ paddingTop: insets.top + spacing.md, paddingHorizontal: spacing.lg }}
        titleVariant="body"
        titleWeight="semiBold"
        right={
          <Text variant="bodySmall" color="muted">
            {currentStep} {t('common.of')} {totalSteps}
          </Text>
        }
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Face Icon */}
        <View style={styles.iconContainer}>
          <FaceOutline size={120} color={colors.textPrimary} />
        </View>

        {/* Title */}
        <Text variant="body" weight="medium" style={styles.title}>
          {t('profile_setup.enable_facial_verification')}
        </Text>

        {/* Description */}
        <Text variant="bodySmall" color="muted" style={styles.description}>
          {t('profile_setup.facial_verification_description')}
        </Text>

        {/* Bullet Points */}
        <View style={styles.bulletContainer}>
          {bulletPoints.map((point, index) => (
            <View key={index} style={styles.bulletItem}>
              <Text variant="bodySmall" color="muted" style={styles.bulletDot}>
                {'\u2022'}
              </Text>
              <Text variant="bodySmall" color="muted" style={styles.bulletText}>
                {point}
              </Text>
            </View>
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            translationKey="common.skip"
            variant="outline"
            onPress={handleSkip}
            style={styles.skipButton}
          />
          <Button
            translationKey="common.set_up_now"
            variant="primary"
            onPress={handleSetUp}
            style={styles.setupButton}
          />
        </View>
      </ScrollView>
    </View>
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
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  title: {
    marginBottom: spacing.lg,
  },
  description: {
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.md,
  },
  bulletContainer: {
    marginBottom: spacing.xxxl,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  bulletDot: {
    marginRight: spacing.sm,
    fontSize: 18,
  },
  bulletText: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: 'auto',
  },
  skipButton: {
    flex: 1,
  },
  setupButton: {
    flex: 1,
  },
});
