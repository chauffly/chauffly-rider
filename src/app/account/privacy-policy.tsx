import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { StackHeader } from '@/components/common/stack-header';
import { Text } from '@/components/common/text';
import { spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';

const sections = [
  {
    titleKey: 'account.privacy_intro_title',
    bodyKey: 'account.privacy_intro_body',
  },
  {
    titleKey: 'account.privacy_data_title',
    bodyKey: 'account.privacy_data_body',
  },
  {
    titleKey: 'account.privacy_usage_title',
    bodyKey: 'account.privacy_usage_body',
  },
  {
    titleKey: 'account.privacy_sharing_title',
    bodyKey: 'account.privacy_sharing_body',
  },
];

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + spacing.lg,
          paddingBottom: insets.bottom + spacing.md,
        },
      ]}
    >
      <StackHeader
        translationKey="account.privacy_policy_title"
        align="center"
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {sections.map((section) => (
          <View key={section.titleKey} style={styles.section}>
            <Text variant="h1" size="xxl" weight="medium" translationKey={section.titleKey} />
            <Text variant="bodySmall" translationKey={section.bodyKey} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  content: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.xxxl,
  },
  section: {
    gap: spacing.lg,
  },
});
