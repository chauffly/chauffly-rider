import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { type Href, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { StackHeader } from '@/components/common/stack-header';
import { Text } from '@/components/common/text';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';

type ContactItem = {
  key: string;
  labelKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  action: Href | string;
  type: 'route' | 'url';
};

const contactItems: ContactItem[] = [
  {
    key: 'customer_support',
    labelKey: 'account.contact_customer_support',
    icon: 'headset-outline',
    action: 'tel:+2348000000000',
    type: 'url',
  },
  {
    key: 'website',
    labelKey: 'account.contact_website',
    icon: 'globe-outline',
    action: '/account/visit-website',
    type: 'route',
  },
  {
    key: 'whatsapp',
    labelKey: 'account.contact_whatsapp',
    icon: 'logo-whatsapp',
    action: 'https://wa.me/2348000000000',
    type: 'url',
  },
  {
    key: 'instagram',
    labelKey: 'account.contact_instagram',
    icon: 'logo-instagram',
    action: 'https://instagram.com/chauffly',
    type: 'url',
  },
  {
    key: 'x',
    labelKey: 'account.contact_x',
    icon: 'logo-twitter',
    action: 'https://x.com/chauffly',
    type: 'url',
  },
];

export default function ContactSupportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const handlePress = async (item: ContactItem) => {
    if (item.type === 'route') {
      router.push(item.action as Href);
      return;
    }

    try {
      await Linking.openURL(String(item.action));
    } catch {
      // Keep the tap non-breaking if a device cannot open the url.
    }
  };

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
        translationKey="account.contact_support"
        align="center"
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {contactItems.map((item) => (
          <Pressable
            key={item.key}
            style={[styles.card, { backgroundColor: colors.surface }]}
            onPress={() => handlePress(item)}
            accessibilityRole="button"
            accessibilityLabel={t(item.labelKey)}
          >
            <View style={styles.left}>
              <Ionicons name={item.icon} size={24} color={colors.primary} />
              <Text variant="h3" size="lg" weight="regular" translationKey={item.labelKey} />
            </View>
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
    gap: spacing.md,
  },
  card: {
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
});
