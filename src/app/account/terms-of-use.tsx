import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { StackHeader } from '@/components/common/stack-header';
import { Text } from '@/components/common/text';
import { spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';

const sections = [
  {
    titleKey: 'account.terms_intro_title',
    bodyKey: 'account.terms_intro_body',
  },
  {
    titleKey: 'account.terms_usage_title',
    bodyKey: 'account.terms_usage_body',
  },
  {
    titleKey: 'account.terms_cancellation_title',
    bodyKey: 'account.terms_cancellation_body',
  },
  {
    titleKey: 'account.terms_liability_title',
    bodyKey: 'account.terms_liability_body',
  },
];

export default function TermsOfUseScreen() {
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
        translationKey="account.terms_of_use"
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
