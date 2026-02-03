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

export default function VipAirportCoordinationScreen() {
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
        <Text variant="h3" font="medium" translationKey="booking.vip_airport_coordination" />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text variant="label" translationKey="booking.lounge_pickup_coordination" />
        <TextInput placeholderTranslationKey="booking.airport_name_placeholder" />
        <TextInput placeholderTranslationKey="booking.terminal_information_placeholder" />
        <TextInput placeholderTranslationKey="booking.lounge_name_placeholder" />
        <TextInput placeholderTranslationKey="booking.preferred_pickup_location_placeholder" />

        <Text variant="label" translationKey="booking.flight_tracking" />
        <TextInput placeholderTranslationKey="booking.flight_number_placeholder" />
        <View style={styles.row}>
          <View style={styles.half}>
            <TextInput placeholderTranslationKey="booking.date_placeholder" />
          </View>
          <View style={styles.half}>
            <TextInput placeholderTranslationKey="booking.arrival_time_placeholder" />
          </View>
        </View>
        <TextInput placeholderTranslationKey="booking.airline_name_placeholder" />

        <Text variant="label" translationKey="booking.arrival_timing_sync" />
        <View style={styles.row}>
          <View style={styles.half}>
            <TextInput placeholderTranslationKey="booking.landing_time_placeholder" />
          </View>
          <View style={styles.half}>
            <TextInput placeholderTranslationKey="booking.pickup_time_placeholder" />
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
