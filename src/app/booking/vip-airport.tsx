import { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Text } from '@/components/common/text';
import { TextInput } from '@/components/common/text-input';
import { DatePicker } from '@/components/common/date-picker';
import { TimePicker } from '@/components/common/time-picker';
import { SelectInput } from '@/components/common/select-input';
import { Button } from '@/components/common/button';
import { StackHeader } from '@/components/common/stack-header';
import { spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';

export default function VipAirportCoordinationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [flightDate, setFlightDate] = useState<Date | null>(null);
  const [arrivalTime, setArrivalTime] = useState<Date | null>(null);
  const [landingTime, setLandingTime] = useState<Date | null>(null);
  const [pickupTime, setPickupTime] = useState<Date | null>(null);
  const [bufferTime, setBufferTime] = useState<string | undefined>(undefined);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + spacing.md }]}>
      <StackHeader
        translationKey="booking.vip_airport_coordination"
        onBack={() => router.back()}
      />

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
            <DatePicker
              placeholderTranslationKey="booking.date_placeholder"
              value={flightDate}
              onChange={setFlightDate}
            />
          </View>
          <View style={styles.half}>
            <TimePicker
              placeholderTranslationKey="booking.arrival_time_placeholder"
              value={arrivalTime}
              onChange={setArrivalTime}
            />
          </View>
        </View>
        <TextInput placeholderTranslationKey="booking.airline_name_placeholder" />

        <Text variant="label" translationKey="booking.arrival_timing_sync" />
        <View style={styles.row}>
          <View style={styles.half}>
            <TimePicker
              placeholderTranslationKey="booking.landing_time_placeholder"
              value={landingTime}
              onChange={setLandingTime}
            />
          </View>
          <View style={styles.half}>
            <TimePicker
              placeholderTranslationKey="booking.pickup_time_placeholder"
              value={pickupTime}
              onChange={setPickupTime}
            />
          </View>
        </View>
        <SelectInput
          placeholderTranslationKey="booking.buffer_time_placeholder"
          value={bufferTime}
          onValueChange={setBufferTime}
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
