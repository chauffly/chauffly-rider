import { StyleSheet, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/common/text';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { spacing } from '@/constants/spacing';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { colors, themeMode, setTheme, isDark } = useTheme();
  const { t } = useTranslation();

  const themeModes = [
    { key: 'light' as const, labelKey: 'settings.theme_light' },
    { key: 'dark' as const, labelKey: 'settings.theme_dark' },
    { key: 'system' as const, labelKey: 'settings.theme_system' },
  ];

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
      <Text variant="h2" style={styles.title}>
        {t('home.title')}
      </Text>

      <View style={styles.section}>
        <Text variant="label" style={styles.sectionTitle}>
          {t('settings.theme')}
        </Text>
        <View style={styles.themeButtons}>
          {themeModes.map((mode) => (
            <Pressable
              key={mode.key}
              style={[
                styles.themeButton,
                {
                  backgroundColor:
                    themeMode === mode.key
                      ? colors.primary
                      : colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setTheme(mode.key)}
            >
              <Text
                variant="body"
                style={{
                  color:
                    themeMode === mode.key
                      ? colors.buttonPrimaryText
                      : colors.textPrimary,
                }}
              >
                {t(mode.labelKey)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  title: {
    marginBottom: spacing.xxl,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  themeButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  themeButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.sm,
    borderWidth: 1,
  },
});
