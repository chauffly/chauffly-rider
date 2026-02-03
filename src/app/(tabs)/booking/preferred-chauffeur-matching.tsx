import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Text } from '@/components/common/text';
import { TextInput } from '@/components/common/text-input';
import { SelectInput } from '@/components/common/select-input';
import { Button } from '@/components/common/button';
import ChevronLeft from '@/components/svg/ChevronLeft';
import { spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';

export default function PreferredChauffeurMatchingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + spacing.md }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel={t('common.cancel')}
        >
          <ChevronLeft size={24} color={colors.textPrimary} />
        </Pressable>
        <Text variant="h3" font="medium" translationKey="booking.preferred_chauffeur_matching" />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text variant="label" translationKey="booking.preferred_chauffeur_label" />
        <TextInput placeholderTranslationKey="booking.preferred_chauffeur_placeholder" />

        <Text variant="label" translationKey="booking.chauffeur_language_label" />
        <SelectInput
          placeholderTranslationKey="booking.chauffeur_language_placeholder"
          options={[
            { value: 'english', label: t('booking.language_english') },
            { value: 'hausa', label: t('booking.language_hausa') },
            { value: 'igbo', label: t('booking.language_igbo') },
            { value: 'yoruba', label: t('booking.language_yoruba') },
          ]}
        />

        <Text variant="label" translationKey="booking.chauffeur_notes_label" />
        <TextInput placeholderTranslationKey="booking.additional_notes_placeholder" />
      </ScrollView>

      <View style={styles.footer}>
        <Button translationKey="booking.save_preference" fullWidth onPress={() => router.back()} />
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
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  footer: {
    paddingBottom: spacing.lg,
  },
});
