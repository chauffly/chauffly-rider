import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import {
  ApiClientError,
  useCorporateTravelPolicies,
  useUpdateCorporateTravelPolicies
} from '@/api-client';
import { Button } from '@/components/common/button';
import { SelectInput, type SelectOption } from '@/components/common/select-input';
import { StackHeader } from '@/components/common/stack-header';
import { Text } from '@/components/common/text';
import { TextInput } from '@/components/common/text-input';
import { spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { asRecord, asString } from '@/utils/api-helpers';

type AllowedHoursPreset = 'anytime' | 'business_day' | 'extended_day' | 'daytime_only';

const allowedHoursOptions: SelectOption[] = [
  { label: 'Anytime', value: 'anytime' },
  { label: '6 AM - 10 PM', value: 'business_day' },
  { label: '7 AM - 7 PM', value: 'daytime_only' },
  { label: '24 Hours', value: 'extended_day' }
];

const hoursPresetToValue = (preset: AllowedHoursPreset): Record<string, unknown> | null => {
  switch (preset) {
    case 'business_day':
      return {
        weekdays: { start: '06:00', end: '22:00' },
        weekends: { start: '06:00', end: '22:00' }
      };
    case 'daytime_only':
      return {
        weekdays: { start: '07:00', end: '19:00' },
        weekends: { start: '07:00', end: '19:00' }
      };
    case 'extended_day':
      return {
        weekdays: { start: '00:00', end: '23:59' },
        weekends: { start: '00:00', end: '23:59' }
      };
    case 'anytime':
    default:
      return null;
  }
};

const valueToHoursPreset = (value: Record<string, unknown> | null | undefined): AllowedHoursPreset => {
  const record = asRecord(value);
  const weekdays = asRecord(record.weekdays);
  const weekends = asRecord(record.weekends);
  const weekdayStart = asString(weekdays.start);
  const weekdayEnd = asString(weekdays.end);
  const weekendStart = asString(weekends.start);
  const weekendEnd = asString(weekends.end);

  if (!weekdayStart && !weekdayEnd && !weekendStart && !weekendEnd) {
    return 'anytime';
  }

  if (weekdayStart === '06:00' && weekdayEnd === '22:00' && weekendStart === '06:00' && weekendEnd === '22:00') {
    return 'business_day';
  }

  if (weekdayStart === '07:00' && weekdayEnd === '19:00' && weekendStart === '07:00' && weekendEnd === '19:00') {
    return 'daytime_only';
  }

  if (weekdayStart === '00:00' && weekdayEnd === '23:59' && weekendStart === '00:00' && weekendEnd === '23:59') {
    return 'extended_day';
  }

  return 'anytime';
};

const toNumericString = (value: unknown): string => {
  return typeof value === 'number' && Number.isFinite(value)
    ? `${value}`
    : typeof value === 'string'
      ? value
      : '';
};

export default function TravelLimitScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const { data: policyData, isLoading } = useCorporateTravelPolicies();
  const updatePolicy = useUpdateCorporateTravelPolicies();

  const [maxFarePerTrip, setMaxFarePerTrip] = useState('');
  const [monthlyBudgetLimit, setMonthlyBudgetLimit] = useState('');
  const [allowedRideHours, setAllowedRideHours] = useState<AllowedHoursPreset>('business_day');
  const [generalMessage, setGeneralMessage] = useState('');
  const [generalError, setGeneralError] = useState('');

  const policy = useMemo(() => asRecord(asRecord(policyData).policy), [policyData]);

  useEffect(() => {
    setMaxFarePerTrip(toNumericString(policy.maxFarePerTrip));
    setMonthlyBudgetLimit(toNumericString(policy.budgetLimit));
    setAllowedRideHours(valueToHoursPreset(asRecord(policy.allowedHours)));
  }, [policy]);

  const handleSave = async () => {
    setGeneralError('');
    setGeneralMessage('');

    try {
      await updatePolicy.mutateAsync({
        max_fare: maxFarePerTrip.trim().length ? Number(maxFarePerTrip) : null,
        budget_period: 'monthly',
        budget_limit: monthlyBudgetLimit.trim().length ? Number(monthlyBudgetLimit) : null,
        allowed_hours: hoursPresetToValue(allowedRideHours)
      });

      setGeneralMessage('Travel policy saved successfully.');
    } catch (error) {
      const fallback = 'Could not save policy right now.';
      setGeneralError(
        error instanceof ApiClientError
          ? error.message || fallback
          : error instanceof Error
            ? error.message || fallback
            : fallback
      );
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + spacing.lg,
          paddingBottom: insets.bottom + spacing.md
        }
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
          label="Maximum Fare Per Ride (N)"
          placeholder="5000"
          value={maxFarePerTrip}
          onChangeText={setMaxFarePerTrip}
          keyboardType="numeric"
        />

        <TextInput
          labelTranslationKey="account.travel_limit_monthly_spend"
          placeholderTranslationKey="account.travel_limit_monthly_spend_placeholder"
          value={monthlyBudgetLimit}
          onChangeText={setMonthlyBudgetLimit}
          keyboardType="numeric"
        />

        <SelectInput
          label="Allowed Ride Hours"
          placeholder="Select allowed hours"
          options={allowedHoursOptions}
          value={allowedRideHours}
          onValueChange={(value) => setAllowedRideHours(value as AllowedHoursPreset)}
        />

        {generalError ? (
          <Text variant="bodySmall" color="error" style={styles.feedback}>
            {generalError}
          </Text>
        ) : null}

        {generalMessage ? (
          <Text variant="bodySmall" color="success" style={styles.feedback}>
            {generalMessage}
          </Text>
        ) : null}
      </ScrollView>

      <Button
        translationKey="account.travel_limit_save"
        style={styles.submitButton}
        onPress={() => void handleSave()}
        loading={updatePolicy.isPending || isLoading}
        disabled={updatePolicy.isPending || isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg
  },
  content: {
    gap: spacing.sm,
    paddingBottom: spacing.xxxxl
  },
  submitButton: {
    marginBottom: spacing.md
  },
  feedback: {
    marginTop: spacing.sm
  }
});
