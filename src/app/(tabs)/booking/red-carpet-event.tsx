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

export default function RedCarpetEventScreen() {
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
        <Text variant="h3" font="medium" translationKey="booking.red_carpet_event_service" />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text variant="label" translationKey="booking.event_type_label" />
        <SelectInput
          placeholderTranslationKey="booking.event_type_placeholder"
          options={[
            { value: 'awards', label: t('booking.event_awards') },
            { value: 'gala', label: t('booking.event_gala') },
            { value: 'premiere', label: t('booking.event_premiere') },
          ]}
        />

        <Text variant="label" translationKey="booking.venue_label" />
        <TextInput placeholderTranslationKey="booking.venue_placeholder" />

        <Text variant="label" translationKey="booking.arrival_label" />
        <TextInput placeholderTranslationKey="booking.arrival_time_placeholder" />
        <TextInput placeholderTranslationKey="booking.pickup_time_placeholder" />

        <Text variant="label" translationKey="booking.additional_notes_label" />
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
