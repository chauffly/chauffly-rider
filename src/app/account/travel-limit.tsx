import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { TextInput } from '@/components/common/text-input';
import { Button } from '@/components/common/button';
import { StackHeader } from '@/components/common/stack-header';
import { spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';

export default function TravelLimitScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const [dailySpendLimit, setDailySpendLimit] = useState('');
  const [monthlySpendLimit, setMonthlySpendLimit] = useState('');
  const [allowedRideHours, setAllowedRideHours] = useState('');
  const [minimumRideTime, setMinimumRideTime] = useState('');
  const [restrictionNotes, setRestrictionNotes] = useState('');

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
        translationKey="account.travel_limit_title"
        align="center"
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TextInput
          labelTranslationKey="account.travel_limit_daily_spend"
          placeholderTranslationKey="account.travel_limit_daily_spend_placeholder"
          value={dailySpendLimit}
          onChangeText={setDailySpendLimit}
          keyboardType="numeric"
        />

        <TextInput
          labelTranslationKey="account.travel_limit_monthly_spend"
          placeholderTranslationKey="account.travel_limit_monthly_spend_placeholder"
          value={monthlySpendLimit}
          onChangeText={setMonthlySpendLimit}
          keyboardType="numeric"
        />

        <TextInput
          labelTranslationKey="account.travel_limit_allowed_hours"
          placeholderTranslationKey="account.travel_limit_allowed_hours_placeholder"
          value={allowedRideHours}
          onChangeText={setAllowedRideHours}
        />

        <TextInput
          labelTranslationKey="account.travel_limit_minimum_ride_time"
          placeholderTranslationKey="account.travel_limit_minimum_ride_time_placeholder"
          value={minimumRideTime}
          onChangeText={setMinimumRideTime}
          keyboardType="numeric"
        />

        <TextInput
          labelTranslationKey="account.travel_limit_restriction_notes"
          placeholderTranslationKey="account.travel_limit_restriction_notes_placeholder"
          value={restrictionNotes}
          onChangeText={setRestrictionNotes}
          multiline
        />
      </ScrollView>

      <Button
        translationKey="account.travel_limit_save"
        style={styles.submitButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  content: {
    gap: spacing.sm,
    paddingBottom: spacing.xxxxl,
  },
  submitButton: {
    marginBottom: spacing.md,
  },
});
