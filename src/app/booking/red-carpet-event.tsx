import { useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { Text } from "@/components/common/text";
import { TextInput } from "@/components/common/text-input";
import { SelectInput } from "@/components/common/select-input";
import { TimePicker } from "@/components/common/time-picker";
import { Button } from "@/components/common/button";
import { StackHeader } from "@/components/common/stack-header";
import { spacing } from "@/constants/spacing";
import { useTheme } from "@/context/theme-context";
import { useTranslation } from "@/context/language-context";

export default function RedCarpetEventScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [eventType, setEventType] = useState<string | undefined>(undefined);
  const [arrivalTime, setArrivalTime] = useState<Date | null>(null);
  const [pickupTime, setPickupTime] = useState<Date | null>(null);

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
      <StackHeader
        translationKey="booking.red_carpet_event_service"
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="label" translationKey="booking.event_type_label" />
        <SelectInput
          placeholderTranslationKey="booking.event_type_placeholder"
          value={eventType}
          onValueChange={setEventType}
          options={[
            { value: "awards", label: t("booking.event_awards") },
            { value: "gala", label: t("booking.event_gala") },
            { value: "premiere", label: t("booking.event_premiere") },
          ]}
        />

        <Text variant="label" translationKey="booking.venue_label" />
        <TextInput placeholderTranslationKey="booking.venue_placeholder" />

        <Text variant="label" translationKey="booking.arrival_label" />
        <View style={styles.row}>
          <View style={styles.half}>
            <TimePicker
              placeholderTranslationKey="booking.arrival_time_placeholder"
              value={arrivalTime}
              onChange={setArrivalTime}
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

        <Text variant="label" translationKey="booking.additional_notes_label" />
        <TextInput
          placeholderTranslationKey="booking.additional_notes_placeholder"
          multiline
          numberOfLines={4}
          style={styles.notesInput}
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
  content: {
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  half: {
    flex: 1,
  },
  notesInput: {
    textAlignVertical: "top",
  },
  footer: {
    paddingBottom: spacing.lg,
  },
});
