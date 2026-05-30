import { useEffect, useState } from "react";
import { StyleSheet, View, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { Text } from "@/components/common/text";
import { Button } from "@/components/common/button";
import { StackHeader } from "@/components/common/stack-header";
import { borderRadius, spacing } from "@/constants/spacing";
import { useTheme } from "@/context/theme-context";
import { useTranslation } from "@/context/language-context";
import { useCurrentUser } from "@/api-client";
import Temperature from "@/components/svg/Temperature";
import Music from "@/components/svg/Music";
import Message from "@/components/svg/Message";
import Door from "@/components/svg/Door";
import AmbientScent from "@/components/svg/AmbientScent";
import {
  defaultRidePreferencePreset,
  RidePreferencePreset,
  RidePreferenceValue,
  ridePreferenceStorage
} from "@/services/ride-preference-storage";

type PillValue = RidePreferenceValue;

interface PillOption {
  value: PillValue;
  labelKey: string;
}


const cabinOptions: PillOption[] = [
  { value: "t_18_20", labelKey: "booking.preference_cabin_18_20" },
  { value: "t_20_22", labelKey: "booking.preference_cabin_20_22" },
  { value: "t_22_24", labelKey: "booking.preference_cabin_22_24" },
  { value: "t_24_26", labelKey: "booking.preference_cabin_24_26" },
];

const musicOptions: PillOption[] = [
  { value: "fm", labelKey: "booking.preference_music_fm" },
  { value: "jazz", labelKey: "booking.preference_music_jazz" },
  { value: "classical", labelKey: "booking.preference_music_classical" },
  { value: "afrobeats", labelKey: "booking.preference_music_afrobeats" },
  { value: "no_music", labelKey: "booking.preference_music_none" },
  { value: "connect_device", labelKey: "booking.preference_music_connect_device" },
];

const conversationOptions: PillOption[] = [
  { value: "quiet", labelKey: "booking.preference_conversation_quiet" },
  { value: "minimal", labelKey: "booking.preference_conversation_minimal" },
  { value: "open", labelKey: "booking.preference_conversation_open" },
];

const doorOptions: PillOption[] = [
  { value: "door_always", labelKey: "booking.preference_door_always" },
  { value: "door_pickup", labelKey: "booking.preference_door_pickup_only" },
  { value: "door_dropoff", labelKey: "booking.preference_door_dropoff_only" },
  { value: "door_none", labelKey: "booking.preference_door_none" },
];

const scentOptions: PillOption[] = [
  { value: "scent_neutral", labelKey: "booking.preference_scent_neutral" },
  { value: "citrus", labelKey: "booking.preference_scent_citrus" },
  { value: "wood", labelKey: "booking.preference_scent_wood" },
  { value: "floral", labelKey: "booking.preference_scent_floral" },
];

export default function RidePreferenceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { data: currentUserData } = useCurrentUser();

  const [cabinTemp, setCabinTemp] = useState<PillValue>(defaultRidePreferencePreset.cabinTemp);
  const [musicGenre, setMusicGenre] = useState<PillValue>(defaultRidePreferencePreset.musicGenre);
  const [conversationMode, setConversationMode] =
    useState<PillValue>(defaultRidePreferencePreset.conversationMode);
  const [doorEtiquette, setDoorEtiquette] = useState<PillValue>(defaultRidePreferencePreset.doorEtiquette);
  const [ambientScent, setAmbientScent] = useState<PillValue>(defaultRidePreferencePreset.ambientScent);
  const [saving, setSaving] = useState(false);
  const currentUserRecord =
    currentUserData && typeof currentUserData === "object"
      ? (currentUserData as Record<string, unknown>)
      : {};
  const preferenceOwnerKey =
    (typeof currentUserRecord.id === "string" && currentUserRecord.id.trim()) ||
    (typeof currentUserRecord.email === "string" && currentUserRecord.email.trim()) ||
    null;

  useEffect(() => {
    const loadPreset = async () => {
      const preset = await ridePreferenceStorage.get(preferenceOwnerKey);
      setCabinTemp(preset.cabinTemp);
      setMusicGenre(preset.musicGenre);
      setConversationMode(preset.conversationMode);
      setDoorEtiquette(preset.doorEtiquette);
      setAmbientScent(preset.ambientScent);
    };

    void loadPreset();
  }, [preferenceOwnerKey]);

  const handleSave = async () => {
    if (saving) {
      return;
    }

    const preset: RidePreferencePreset = {
      cabinTemp,
      musicGenre,
      conversationMode,
      doorEtiquette,
      ambientScent
    };

    setSaving(true);
    try {
      await ridePreferenceStorage.set(preferenceOwnerKey, preset);
      router.back();
    } finally {
      setSaving(false);
    }
  };

  const renderPills = (
    options: PillOption[],
    value: PillValue,
    onSelect: (val: PillValue) => void,
  ) => (
    <View style={styles.pillRow}>
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <Pressable
            key={option.value}
            style={[
              styles.pill,
              {
                backgroundColor: isSelected ? colors.primary : colors.surface,
                borderColor: isSelected ? colors.primary : colors.border,
              },
            ]}
            onPress={() => onSelect(option.value)}
            accessibilityRole="button"
            accessibilityLabel={t(option.labelKey)}
          >
            <Text variant="caption" color={isSelected ? "inverse" : "muted"}>
              {t(option.labelKey)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

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
        translationKey="booking.ride_preference"
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.labelWrapper}>
          <Temperature color={colors.textPrimary} />
          <Text
            variant="label"
            size={"lg"}
            translationKey="booking.preference_cabin_temperature"
          />
        </View>
        {renderPills(cabinOptions, cabinTemp, setCabinTemp)}
        <View style={styles.labelWrapper}>
          <Music color={colors.textPrimary} />
          <Text
            variant="label"
            size={"lg"}
            translationKey="booking.preference_music_genre"
          />
        </View>
        {renderPills(musicOptions, musicGenre, setMusicGenre)}

        <View style={styles.labelWrapper}>
          <Message color={colors.textPrimary} />
          <Text
            variant="label"
            size={"lg"}
            translationKey="booking.preference_conversation_mode"
          />
        </View>
        {renderPills(
          conversationOptions,
          conversationMode,
          setConversationMode,
        )}

        <View style={styles.labelWrapper}>
          <Door color={colors.textPrimary} />
          <Text
            variant="label"
            size={"lg"}
            translationKey="booking.preference_door_etiquette"
          />
        </View>
        {renderPills(doorOptions, doorEtiquette, setDoorEtiquette)}

        <View style={styles.labelWrapper}>
          <AmbientScent color={colors.textPrimary} />
          <Text
            variant="label"
            size={"lg"}
            translationKey="booking.preference_ambient_scent"
          />
        </View>
        {renderPills(scentOptions, ambientScent, setAmbientScent)}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={saving ? t("common.loading") : t("common.save")}
          fullWidth
          onPress={handleSave}
          disabled={saving}
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
  labelWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  content: {
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  pill: {
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
  },
  footer: {
    paddingVertical: spacing.lg,
  },
});
