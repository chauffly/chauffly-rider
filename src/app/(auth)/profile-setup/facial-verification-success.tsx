import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/common/text';
import { Button } from '@/components/common/button';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { spacing } from '@/constants/spacing';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function FacialVerificationSuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const handleDone = () => {
    router.replace('/(tabs)');
  };

  const handleRetake = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colors.statusBar as 'light' | 'dark'} />

      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + spacing.xxxl,
            paddingBottom: insets.bottom + spacing.xxl,
          },
        ]}
      >
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <View style={[styles.iconCircle, { backgroundColor: colors.textPrimary }]}>
            <View style={styles.checkmark}>
              <MaterialCommunityIcons name='check' size={50} color={colors.background} />
            </View>
          </View>
        </View>

        {/* Title */}
        <Text variant="h3" weight="medium" style={styles.title}>
          {t('profile_setup.facial_verification_enabled')}
        </Text>

        {/* Description */}
        <Text variant="body" color="muted" style={styles.description}>
          {t('profile_setup.facial_verification_success_description')}
        </Text>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            translationKey="common.done"
            variant="primary"
            fullWidth
            onPress={handleDone}
          />
          <Pressable onPress={handleRetake} style={styles.retakeButton}>
            <Text variant="body" color="muted" weight="medium">
              {t('common.retake')}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: spacing.xxxl,
    alignItems: 'center',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    width: 50,
    height: 50,
    position: 'relative',
  },

  title: {
    marginBottom: spacing.lg,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  description: {
    marginBottom: spacing.xxxl,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 'auto',
  },
  retakeButton: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});
