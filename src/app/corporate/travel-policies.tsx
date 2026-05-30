import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { TextInput } from '@/components/common/text-input';
import { Button } from '@/components/common/button';
import { StackHeader } from '@/components/common/stack-header';
import { spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';

export default function TravelPoliciesScreen() {
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
        translationKey="corporate.travel_policies.title"
        align="center"
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TextInput
          labelTranslationKey="corporate.travel_policies.daily_spend_limit"
          placeholderTranslationKey="corporate.travel_policies.daily_spend_limit_placeholder"
          value={dailySpendLimit}
          onChangeText={setDailySpendLimit}
          leftIcon={<Ionicons name="person-outline" size={20} color={colors.primary} />}
          keyboardType="numeric"
        />

        <TextInput
          labelTranslationKey="corporate.travel_policies.monthly_spend_limit"
          placeholderTranslationKey="corporate.travel_policies.monthly_spend_limit_placeholder"
          value={monthlySpendLimit}
          onChangeText={setMonthlySpendLimit}
          leftIcon={<Ionicons name="mail-outline" size={20} color={colors.primary} />}
          keyboardType="numeric"
        />

        <TextInput
          labelTranslationKey="corporate.travel_policies.allowed_ride_hours"
          placeholderTranslationKey="corporate.travel_policies.allowed_ride_hours_placeholder"
          value={allowedRideHours}
          onChangeText={setAllowedRideHours}
        />

        <TextInput
          labelTranslationKey="corporate.travel_policies.minimum_ride_time"
          placeholderTranslationKey="corporate.travel_policies.minimum_ride_time_placeholder"
          value={minimumRideTime}
          onChangeText={setMinimumRideTime}
          keyboardType="numeric"
        />

        <TextInput
          labelTranslationKey="corporate.travel_policies.restriction_notes"
          placeholderTranslationKey="corporate.travel_policies.restriction_notes_placeholder"
          value={restrictionNotes}
          onChangeText={setRestrictionNotes}
          multiline
        />
      </ScrollView>

      <Button
        translationKey="corporate.travel_policies.save_policy"
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
