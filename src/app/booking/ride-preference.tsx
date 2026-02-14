import { useState } from "react";
import { StyleSheet, View, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { Text } from "@/components/common/text";
import { Button } from "@/components/common/button";
import { Switch } from "@/components/common/switch";
import ChevronLeft from "@/components/svg/ChevronLeft";
import Check from "@/components/svg/Check";
import { borderRadius, spacing } from "@/constants/spacing";
import { useTheme } from "@/context/theme-context";
import { useTranslation } from "@/context/language-context";
import Temperature from "@/components/svg/Temperature";
import Music from "@/components/svg/Music";
import Message from "@/components/svg/Message";
import Door from "@/components/svg/Door";
import AmbientScent from "@/components/svg/AmbientScent";
import Amenities from "@/components/svg/Amenities";
import Security from "@/components/svg/Security";

type PillValue =
  | "cool"
  | "neutral"
  | "warm"
  | "no_music"
  | "jazz"
  | "classical"
  | "afrobeats"
  | "quiet"
  | "minimal"
  | "open"
  | "scent_neutral"
  | "citrus"
  | "wood"
  | "floral";

interface PillOption {
  value: PillValue;
  labelKey: string;
}


const cabinOptions: PillOption[] = [
  { value: "cool", labelKey: "booking.preference_cabin_cool" },
  { value: "neutral", labelKey: "booking.preference_cabin_neutral" },
  { value: "warm", labelKey: "booking.preference_cabin_warm" },
];

const musicOptions: PillOption[] = [
  { value: "no_music", labelKey: "booking.preference_music_none" },
  { value: "jazz", labelKey: "booking.preference_music_jazz" },
  { value: "classical", labelKey: "booking.preference_music_classical" },
  { value: "afrobeats", labelKey: "booking.preference_music_afrobeats" },
];

const conversationOptions: PillOption[] = [
  { value: "quiet", labelKey: "booking.preference_conversation_quiet" },
  { value: "minimal", labelKey: "booking.preference_conversation_minimal" },
  { value: "open", labelKey: "booking.preference_conversation_open" },
];

const scentOptions: PillOption[] = [
  { value: "scent_neutral", labelKey: "booking.preference_scent_neutral" },
  { value: "citrus", labelKey: "booking.preference_scent_citrus" },
  { value: "wood", labelKey: "booking.preference_scent_wood" },
  { value: "floral", labelKey: "booking.preference_scent_floral" },
];

const amenityOptions = [
  { key: "water", labelKey: "booking.preference_amenity_water" },
  { key: "mints", labelKey: "booking.preference_amenity_mints" },
  { key: "newspaper", labelKey: "booking.preference_amenity_newspaper" },
];

export default function RidePreferenceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [cabinTemp, setCabinTemp] = useState<PillValue>("neutral");
  const [musicGenre, setMusicGenre] = useState<PillValue>("jazz");
  const [conversationMode, setConversationMode] =
    useState<PillValue>("minimal");
  const [ambientScent, setAmbientScent] = useState<PillValue>("citrus");
  const [doorEtiquette, setDoorEtiquette] = useState(false);
  const [securityEscort, setSecurityEscort] = useState(false);
  const [amenities, setAmenities] = useState<Record<string, boolean>>({
    water: false,
    mints: false,
    newspaper: false,
  });

  const toggleAmenity = (key: string) => {
    setAmenities((prev) => ({ ...prev, [key]: !prev[key] }));
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
          translationKey="booking.ride_preference"
        />
      </View>

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

        <View style={styles.toggleRow}>
          <View style={styles.labelWrapper}>
            <Door color={colors.textPrimary} />
            <Text
              variant="label"
              size={"lg"}
              translationKey="booking.preference_door_etiquette"
            />
          </View>
          <Switch
            value={doorEtiquette}
            onValueChange={setDoorEtiquette}
            trackOn={colors.primary}
            trackOff={colors.border}
            thumbOn={colors.surface}
            thumbOff={colors.surface}
          />
        </View>

        <View style={styles.labelWrapper}>
          <AmbientScent color={colors.textPrimary} />
          <Text
            variant="label"
            size={"lg"}
            translationKey="booking.preference_ambient_scent"
          />
        </View>
        {renderPills(scentOptions, ambientScent, setAmbientScent)}

        <View style={styles.labelWrapper}>
          <Amenities color={colors.textPrimary} />
          <Text
            variant="label"
            size={"lg"}
            translationKey="booking.preference_in_car_amenities"
          />
        </View>

        <View style={styles.amenities}>
          {amenityOptions.map((amenity) => {
            const isSelected = amenities[amenity.key];
            return (
              <Pressable
                key={amenity.key}
                onPress={() => toggleAmenity(amenity.key)}
                style={styles.amenityRow}
                accessibilityRole="button"
                accessibilityLabel={t(amenity.labelKey)}
              >
                <Text variant="bodySmall" color="muted">
                  {t(amenity.labelKey)}
                </Text>
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: isSelected ? colors.primary : colors.border,
                      backgroundColor: isSelected
                        ? colors.primary
                        : colors.surface,
                    },
                  ]}
                >
                  {isSelected && <Check color={colors.surface} />}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.toggleRow}>
          <View style={styles.labelWrapper}>
            <Security color={colors.textPrimary} />
            <Text
              variant="label"
              size={"lg"}
              translationKey="booking.preference_security_escort"
            />
          </View>
          <Switch
            value={securityEscort}
            onValueChange={setSecurityEscort}
            trackOn={colors.primary}
            trackOff={colors.border}
            thumbOn={colors.surface}
            thumbOff={colors.surface}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          translationKey="common.save"
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
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
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
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  amenities: {
    gap: spacing.sm,
  },
  amenityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    paddingVertical: spacing.lg,
  },
});
