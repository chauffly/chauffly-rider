import { useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

import { Text } from '@/components/common/text';
import { TextInput } from '@/components/common/text-input';
import { Button } from '@/components/common/button';
import ChevronLeft from '@/components/svg/ChevronLeft';
import { spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';

export default function ConciergePreTripScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [arrivalTime, setArrivalTime] = useState<Date | null>(null);
  const [bufferTime, setBufferTime] = useState<Date | null>(null);
  const [showArrivalPicker, setShowArrivalPicker] = useState(false);
  const [showBufferPicker, setShowBufferPicker] = useState(false);

  const formatTime = (value: Date | null) =>
    value ? format(value, 'h:mm a') : '';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + spacing.md,
        },
      ]}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel={t("common.cancel")}
        >
          <ChevronLeft size={24} color={colors.textPrimary} />
        </Pressable>
        <Text
          variant="h3"
          font="medium"
          size={"xl"}
          translationKey="booking.concierge_pre_trip_setup"
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text
          variant="label"
          translationKey="booking.concierge_chauffeur_briefing"
        />
        <TextInput
          placeholderTranslationKey="booking.concierge_chauffeur_briefing"
          multiline
        />

        <Text
          variant="label"
          translationKey="booking.concierge_visual_preparation"
        />
        <TextInput
          placeholderTranslationKey="booking.concierge_visual_preparation"
          multiline
        />

        <Text
          variant="label"
          translationKey="booking.concierge_timing_coordination"
        />
        <Pressable onPress={() => setShowArrivalPicker(true)}>
          <TextInput
            placeholderTranslationKey="booking.arrival_time_placeholder"
            value={formatTime(arrivalTime)}
            editable={false}
            pointerEvents="none"
          />
        </Pressable>
        {showArrivalPicker && (
          <DateTimePicker
            value={arrivalTime ?? new Date()}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            minuteInterval={5}
            onChange={(event, date) => {
              setShowArrivalPicker(false);
              if (event.type !== "dismissed" && date) {
                setArrivalTime(date);
              }
            }}
            textColor={colors.textPrimary}
            accentColor={colors.primary}
          />
        )}
        <Pressable onPress={() => setShowBufferPicker(true)}>
          <TextInput
            placeholderTranslationKey="booking.early_arrival_buffer_placeholder"
            value={formatTime(bufferTime)}
            editable={false}
            pointerEvents="none"
          />
        </Pressable>
        {showBufferPicker && (
          <DateTimePicker
            value={bufferTime ?? new Date()}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            minuteInterval={5}
            onChange={(event, date) => {
              setShowBufferPicker(false);
              if (event.type !== "dismissed" && date) {
                setBufferTime(date);
              }
            }}
            textColor={colors.textPrimary}
            accentColor={colors.primary}
          />
        )}
        <TextInput
          placeholderTranslationKey="booking.additional_notes_placeholder"
          multiline
        />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          translationKey="booking.save_preference"
          fullWidth
          onPress={() => router.back()}
        />
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

 
