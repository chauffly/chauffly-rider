import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { type Href, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { StackHeader } from '@/components/common/stack-header';
import { Text } from '@/components/common/text';
import { spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';

type HelpMenuItem = {
  key: string;
  labelKey: string;
  route: Href;
};

const helpMenuItems: HelpMenuItem[] = [
  { key: 'faqs', labelKey: 'account.help_faqs', route: '/account/help-faq' },
  {
    key: 'contact_support',
    labelKey: 'account.contact_support',
    route: '/account/contact-support',
  },
  {
    key: 'privacy_policy',
    labelKey: 'account.privacy_policy',
    route: '/account/privacy-policy',
  },
  {
    key: 'terms_of_use',
    labelKey: 'account.terms_of_use',
    route: '/account/terms-of-use',
  },
  {
    key: 'visit_website',
    labelKey: 'account.visit_website',
    route: '/account/visit-website',
  },
];

export default function HelpSupportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();

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
        translationKey="account.help_support"
        align="center"
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {helpMenuItems.map((item) => (
          <Pressable
            key={item.key}
            style={styles.row}
            onPress={() => router.push(item.route)}
            accessibilityRole="button"
            accessibilityLabel={t(item.labelKey)}
          >
            <Text variant="body" weight="regular" translationKey={item.labelKey} />
            <Ionicons name="chevron-forward" size={20} color={colors.textPrimary} />
          </Pressable>
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
    gap: spacing.xxl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
