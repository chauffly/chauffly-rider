import { ScrollView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/common/button';
import { StackHeader } from '@/components/common/stack-header';
import { Text } from '@/components/common/text';
import FaceOutline from '@/components/svg/FaceOutline';
import { spacing } from '@/constants/spacing';
import { useTranslation } from '@/context/language-context';
import { useTheme } from '@/context/theme-context';

export default function CorporateKycVerificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: string }>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const handleSetUpNow = () => {
    router.push({
      pathname: '/(auth)/profile-setup/facial-recognition',
      params: { role: params.role ?? 'corporate' },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colors.statusBar as 'light' | 'dark'} />

      <StackHeader
        translationKey="profile_setup.corporate_kyc_title"
        onBack={() => router.back()}
        style={{ paddingTop: insets.top + spacing.md, paddingHorizontal: spacing.lg }}
        titleVariant="body"
        titleWeight="semiBold"
        right={
          <Text variant="bodySmall" color="muted">
            4 {t('common.of')} 4
          </Text>
        }
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconWrap}>
          <FaceOutline size={116} color={colors.textPrimary} />
        </View>

        <Text variant="h3" weight="medium" size={"xl"} style={styles.title}>
          {t('profile_setup.corporate_identity_validation')}
        </Text>

        <Text variant="bodySmall" color="muted" style={styles.description}>
          {t('profile_setup.corporate_identity_validation_note')}
        </Text>

        <View style={styles.bullets}>
          <Text variant="bodySmall" color="muted">
            {`• ${t('profile_setup.corporate_identity_bullet_1')}`}
          </Text>
          <Text variant="bodySmall" color="muted">
            {`• ${t('profile_setup.corporate_identity_bullet_2')}`}
          </Text>
        </View>

        <Button translationKey="common.set_up_now" fullWidth onPress={handleSetUpNow} style={styles.button} />
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
  },
  iconWrap: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  title: {
    marginBottom: spacing.md,
  },
  description: {
    marginBottom: spacing.lg,
  },
  bullets: {
    gap: spacing.sm,
  },
  button: {
    marginTop: 'auto',
  },
});
