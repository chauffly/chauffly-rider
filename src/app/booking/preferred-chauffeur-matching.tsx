import { useMemo, useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Entypo,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";

import { Text } from '@/components/common/text';
import { Button } from "@/components/common/button";
import { TextInput } from "@/components/common/text-input";
import ChevronLeft from '@/components/svg/ChevronLeft';
import { borderRadius, spacing } from "@/constants/spacing";
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';

export default function PreferredChauffeurMatchingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [selectedChauffeurId, setSelectedChauffeurId] =
    useState<string>("fav-1");
  const [searchQuery, setSearchQuery] = useState("");

  const favouriteChauffeurs = useMemo(
    () => [
      {
        id: "fav-1",
        name: "David Immanuel",
        rating: "4.5",
        vehicle: "BMW M5 Series",
        rides: 12,
        verified: true,
      },
      {
        id: "fav-2",
        name: "Sunday Bush",
        rating: "4.5",
        vehicle: "BMW M5 Series",
        rides: 12,
        verified: true,
      },
      {
        id: "fav-3",
        name: "David Itom",
        rating: "4.5",
        vehicle: "BMW M5 Series",
        rides: 12,
        verified: true,
      },
    ],
    [],
  );

  const chauffeurs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return favouriteChauffeurs;
    return favouriteChauffeurs.filter((chauffeur) =>
      chauffeur.name.toLowerCase().includes(query),
    );
  }, [favouriteChauffeurs, searchQuery]);

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
          translationKey="booking.preferred_chauffeur_matching"
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TextInput
          placeholderTranslationKey="booking.preferred_chauffeur_search"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {chauffeurs.map((chauffeur) => {
          const isSelected = selectedChauffeurId === chauffeur.id;
          return (
            <Pressable
              key={chauffeur.id}
              onPress={() => setSelectedChauffeurId(chauffeur.id)}
              style={[
                styles.card,
                {
                  backgroundColor: isSelected ? colors.accent : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                  shadowColor: colors.textPrimary,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={chauffeur.name}
            >
              <View style={styles.cardHeader}>
                <View style={styles.nameRow}>
                  <Text variant="body" font="medium">
                    {chauffeur.name}
                  </Text>
                  {chauffeur.verified && (
                    <MaterialCommunityIcons
                      name="check-decagram"
                      size={16}
                      color={colors.brandBlue}
                    />
                  )}
                </View>
                <View
                  style={[
                    styles.selectionBox,
                    {
                      backgroundColor: isSelected
                        ? colors.textPrimary
                        : colors.surface,
                      borderColor: isSelected
                        ? colors.textPrimary
                        : colors.border,
                    },
                  ]}
                >
                  {isSelected && (
                    <MaterialCommunityIcons
                      name="check"
                      size={12}
                      color={colors.textInverse}
                    />
                  )}
                </View>
              </View>

              <View style={styles.cardMeta}>
                <MaterialCommunityIcons
                  name="star"
                  size={16}
                  color={colors.primary}
                />
                <Text variant="caption" font="medium">
                  {chauffeur.rating}
                </Text>
                <Entypo name="dot-single" />
                <Text variant="caption" color="muted">
                  {chauffeur.vehicle}
                </Text>
                <Entypo name="dot-single" />
                <Text variant="caption" color="muted">
                  {t("booking.rides_with_you", { count: chauffeur.rides })}
                </Text>
              </View>
            </Pressable>
          );
        })}
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
  content: {
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  card: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  verifiedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  selectionBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  footer: {
    paddingBottom: spacing.lg,
  },
});
