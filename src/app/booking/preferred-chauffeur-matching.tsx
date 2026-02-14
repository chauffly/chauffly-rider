import { useMemo, useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Keyboard } from 'react-native';
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

export default function PreferredChauffeurMatchingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [chauffeurQuery, setChauffeurQuery] = useState('');
  const [selectedChauffeur, setSelectedChauffeur] = useState<string | null>(null);
  const [isChauffeurFocused, setIsChauffeurFocused] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string | undefined>(undefined);

  const favouriteChauffeurs = useMemo(
    () => [
      { id: 'fav-1', name: 'David Adebayo', rating: '4.9' },
      { id: 'fav-2', name: 'Nneka Okafor', rating: '4.9' },
      { id: 'fav-3', name: 'Segun Olawale', rating: '4.8' },
      { id: 'fav-4', name: 'Bola Akinyemi', rating: '4.8' },
      { id: 'fav-5', name: 'Aisha Bello', rating: '4.7' },
    ],
    [],
  );

  const allChauffeurs = useMemo(
    () => [
      ...favouriteChauffeurs,
      { id: 'c-6', name: 'Tunde Balogun', rating: '4.7' },
      { id: 'c-7', name: 'Chidi Nwosu', rating: '4.7' },
      { id: 'c-8', name: 'Kemi Ajayi', rating: '4.6' },
      { id: 'c-9', name: 'Ibrahim Musa', rating: '4.6' },
      { id: 'c-10', name: 'Yetunde Ayo', rating: '4.6' },
      { id: 'c-11', name: 'Kunle Adewale', rating: '4.5' },
      { id: 'c-12', name: 'Amaka Eze', rating: '4.5' },
      { id: 'c-13', name: 'Femi Ojo', rating: '4.5' },
      { id: 'c-14', name: 'Grace Okoro', rating: '4.4' },
      { id: 'c-15', name: 'Tomi Arinola', rating: '4.4' },
    ],
    [favouriteChauffeurs],
  );

  const filteredChauffeurs = useMemo(() => {
    const query = chauffeurQuery.trim().toLowerCase();
    if (!query) return favouriteChauffeurs.slice(0, 10);
    return allChauffeurs
      .filter((chauffeur) => chauffeur.name.toLowerCase().includes(query))
      .slice(0, 10);
  }, [chauffeurQuery, favouriteChauffeurs, allChauffeurs]);

  const showChauffeurList = isChauffeurFocused;

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
        <Text variant="h3" font="medium" size={"xl"} translationKey="booking.preferred_chauffeur_matching" />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text variant="label" translationKey="booking.preferred_chauffeur_label" />
        <TextInput
          placeholderTranslationKey="booking.preferred_chauffeur_placeholder"
          value={chauffeurQuery}
          onChangeText={(text) => {
            setChauffeurQuery(text);
            setSelectedChauffeur(null);
          }}
          onFocus={() => setIsChauffeurFocused(true)}
          onBlur={() => setIsChauffeurFocused(false)}
        />
        {showChauffeurList && (
          <View
            style={[
              styles.suggestionCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            {filteredChauffeurs.map((chauffeur, index) => (
              <Pressable
                key={chauffeur.id}
                onPress={() => {
                  setChauffeurQuery(chauffeur.name);
                  setSelectedChauffeur(chauffeur.name);
                  setIsChauffeurFocused(false);
                  Keyboard.dismiss();
                }}
                style={[
                  styles.suggestionRow,
                  index < filteredChauffeurs.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <Text variant="bodySmall" font="medium">
                  {chauffeur.name}
                </Text>
                <Text variant="caption" color="muted">
                  {chauffeur.rating} ★
                </Text>
              </Pressable>
            ))}
            {filteredChauffeurs.length === 0 && (
              <View style={styles.emptyRow}>
                <Text variant="bodySmall" color="muted">
                  No chauffeurs found
                </Text>
              </View>
            )}
          </View>
        )}

        <Text variant="label" translationKey="booking.chauffeur_language_label" />
        <SelectInput
          placeholderTranslationKey="booking.chauffeur_language_placeholder"
          value={selectedLanguage}
          onValueChange={setSelectedLanguage}
          options={[
            { value: 'english', label: t('booking.language_english') },
            { value: 'hausa', label: t('booking.language_hausa') },
            { value: 'igbo', label: t('booking.language_igbo') },
            { value: 'yoruba', label: t('booking.language_yoruba') },
          ]}
        />

        <Text variant="label" translationKey="booking.chauffeur_notes_label" />
        <TextInput placeholderTranslationKey="booking.additional_notes_placeholder" multiline />
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
  suggestionCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  emptyRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  footer: {
    paddingBottom: spacing.lg,
  },
});
