import { StyleSheet, ScrollView } from 'react-native';

import { Text } from '@/components/common/text';
import { LocationInput } from '@/components/common/location-input';
import { QuickLocationChip } from '@/components/common/quick-location-chip';
import LocationPinOutline from '@/components/svg/LocationPinOutline';
import { spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { SavedLocation } from '@/services/location-history';

interface QuickLocation {
  key: string;
  translationKey: string;
}

interface HomeContentProps {
  quickLocations: QuickLocation[];
  savedLocations: SavedLocation[];
  onEnterLocationPress: () => void;
  onQuickLocationPress: (location: SavedLocation) => void;
}

export function HomeContent({
  quickLocations,
  savedLocations,
  onEnterLocationPress,
  onQuickLocationPress,
}: HomeContentProps) {
  const { colors } = useTheme();

  return (
    <>
      <Text
        variant="h3"
        font="medium"
        translationKey="location.where_to"
        style={styles.cardTitle}
      />

      <LocationInput
        type="origin"
        placeholderKey="location.enter_location"
        leftIcon={<LocationPinOutline size={20} color={colors.textSecondary} />}
        onPress={onEnterLocationPress}
        isEditable={false}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickLocationsContainer}
      >
        {quickLocations.map((loc) => {
          const savedLoc = savedLocations.find((s) => s.label === loc.key);
          return (
            <QuickLocationChip
              key={loc.key}
              translationKey={loc.translationKey}
              onPress={() => {
                if (savedLoc) {
                  onQuickLocationPress(savedLoc);
                } else {
                  onEnterLocationPress();
                }
              }}
            />
          );
        })}
        {savedLocations
          .filter((s) => !['home', 'office', 'apartment'].includes(s.label))
          .map((loc) => (
            <QuickLocationChip
              key={loc.id}
              label={loc.name}
              onPress={() => onQuickLocationPress(loc)}
            />
          ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  cardTitle: {
    marginBottom: spacing.lg,
  },
  quickLocationsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingBottom: spacing.md,
  },
});
