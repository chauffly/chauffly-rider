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

export default function SpecialOccasionScreen() {
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
        <Text variant="h3" font="medium" size={"xl"} translationKey="booking.special_occasion_packages" />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text variant="label" translationKey="booking.decor_section" />
        <SelectInput
          placeholderTranslationKey="booking.decor_type_placeholder"
          options={[
            { value: 'minimal', label: t('booking.decor_minimal') },
            { value: 'romantic', label: t('booking.decor_romantic') },
            { value: 'celebration', label: t('booking.decor_celebration') },
          ]}
        />
        <SelectInput
          placeholderTranslationKey="booking.color_theme_placeholder"
          options={[
            { value: 'gold', label: t('booking.color_gold') },
            { value: 'black', label: t('booking.color_black') },
            { value: 'white', label: t('booking.color_white') },
          ]}
        />
        <TextInput placeholderTranslationKey="booking.custom_decor_request_placeholder" />

        <Text variant="label" translationKey="booking.timing_section" />
        <View style={styles.row}>
          <View style={styles.half}>
            <TextInput placeholderTranslationKey="booking.preferred_time_placeholder" />
          </View>
          <View style={styles.half}>
            <TextInput placeholderTranslationKey="booking.time_window_placeholder" />
          </View>
        </View>
        <SelectInput
          placeholderTranslationKey="booking.buffer_time_placeholder"
          options={[
            { value: '15', label: t('booking.buffer_15') },
            { value: '30', label: t('booking.buffer_30') },
            { value: '45', label: t('booking.buffer_45') },
          ]}
        />

        <Text variant="label" translationKey="booking.chauffeur_briefing_section" />
        <SelectInput
          placeholderTranslationKey="booking.briefing_type_placeholder"
          options={[
            { value: 'discreet', label: t('booking.briefing_discreet') },
            { value: 'celebratory', label: t('booking.briefing_celebratory') },
            { value: 'formal', label: t('booking.briefing_formal') },
          ]}
        />
        <TextInput placeholderTranslationKey="booking.instructions_placeholder" />
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
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  half: {
    flex: 1,
  },
  footer: {
    paddingBottom: spacing.lg,
  },
});
