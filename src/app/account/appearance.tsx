import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Text } from '@/components/common/text';
import { StackHeader } from '@/components/common/stack-header';
import { Switch } from '@/components/common/switch';
import { spacing } from '@/constants/spacing';
import { type ThemeMode, useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { type LanguageCode } from '@/locales';

type ThemeOption = {
  key: ThemeMode;
  labelKey: string;
};

type LanguageOption = {
  key: LanguageCode;
  labelKey: string;
};

const themeOptions: ThemeOption[] = [
  { key: 'dark', labelKey: 'account.appearance_dark_mode' },
  { key: 'light', labelKey: 'account.appearance_light_mode' },
  { key: 'system', labelKey: 'account.appearance_use_device_settings' },
];

const languageOptions: LanguageOption[] = [
  { key: 'yo', labelKey: 'booking.language_yoruba' },
  { key: 'en', labelKey: 'booking.language_english' },
  { key: 'ha', labelKey: 'booking.language_hausa' },
  { key: 'ig', labelKey: 'booking.language_igbo' },
];

export default function AppAppearanceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, themeMode, setTheme } = useTheme();
  const { currentLanguage, changeLanguage } = useTranslation();

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
        translationKey="account.app_appearance"
        align="center"
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="h3" weight="medium" translationKey="account.appearance_theme_title" />
        <View style={styles.list}>
          {themeOptions.map((option) => (
            <View key={option.key} style={styles.row}>
              <Text variant="body" translationKey={option.labelKey} />
              <Switch
                value={themeMode === option.key}
                onValueChange={(value) => {
                  if (value) {
                    setTheme(option.key);
                  }
                }}
                trackOn={colors.primary}
                trackOff={colors.border}
                thumbOn={colors.surface}
                thumbOff={colors.surface}
              />
            </View>
          ))}
        </View>

        <Text variant="h3" weight="medium" translationKey="account.appearance_languages_title" />
        <View style={styles.list}>
          {languageOptions.map((option) => (
            <View key={option.key} style={styles.row}>
              <Text variant="body" translationKey={option.labelKey} />
              <Switch
                value={currentLanguage === option.key}
                onValueChange={(value) => {
                  if (value) {
                    changeLanguage(option.key);
                  }
                }}
                trackOn={colors.primary}
                trackOff={colors.border}
                thumbOn={colors.surface}
                thumbOff={colors.surface}
              />
            </View>
          ))}
        </View>
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
    gap: spacing.xxxl,
  },
  list: {
    gap: spacing.xxl + spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
});
