import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Text } from '@/components/common/text';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { borderRadius, spacing } from '@/constants/spacing';
import ChevronLeft from '@/components/svg/ChevronLeft';

type SavedAddress = {
  key: string;
  titleKey: string;
  addressKey: string;
};

export default function SavedAddressesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const addresses = useMemo<SavedAddress[]>(
    () => [
      {
        key: 'home',
        titleKey: 'account.address_home',
        addressKey: 'account.address_sample',
      },
      {
        key: 'office',
        titleKey: 'account.address_office',
        addressKey: 'account.address_sample',
      },
      {
        key: 'apartment',
        titleKey: 'account.address_apartment',
        addressKey: 'account.address_sample',
      },
    ],
    []
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + spacing.lg,
        },
      ]}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <ChevronLeft size={24} color={colors.textPrimary} />
        </Pressable>
        <Text variant="h3" font="medium" translationKey="account.saved_addresses_title" />
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {addresses.map((item) => (
          <View
            key={item.key}
            style={[styles.card, { backgroundColor: colors.surface }]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardTitle}>
                <Ionicons name="location-outline" size={20} color={colors.textMuted} />
                <Text variant="body" weight="semiBold" translationKey={item.titleKey} />
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('account.address_options')}
              >
                <Ionicons name="ellipsis-vertical" size={18} color={colors.textMuted} />
              </Pressable>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text
              variant="bodySmall"
              color="muted"
              translationKey={item.addressKey}
            />
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Pressable
          style={[styles.addButton, { backgroundColor: colors.buttonPrimary }]}
          accessibilityRole="button"
          accessibilityLabel={t('account.add_address')}
        >
          <Ionicons name="add" size={20} color={colors.buttonPrimaryText} />
          <Text
            variant="button"
            style={{ color: colors.buttonPrimaryText }}
            translationKey="account.add_address"
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  card: {
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  divider: {
    height: 1,
    marginVertical: spacing.lg,
  },
  footer: {
    paddingTop: spacing.sm,
  },
  addButton: {
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 52,
  },
});
