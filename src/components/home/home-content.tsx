import { StyleSheet, ScrollView } from 'react-native';

import { Text } from '@/components/common/text';
import { LocationInput } from '@/components/common/location-input';
import { QuickLocationChip } from '@/components/common/quick-location-chip';
import LocationPinOutline from '@/components/svg/LocationPinOutline';
import { spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';

export interface QuickDestination {
  id: string;
  name: string;
  address: string;
  coordinates: { latitude: number; longitude: number };
}

interface HomeContentProps {
  quickDestinations: QuickDestination[];
  onEnterLocationPress: () => void;
  onQuickDestinationPress: (destination: QuickDestination) => void;
}

export function HomeContent({
  quickDestinations,
  onEnterLocationPress,
  onQuickDestinationPress,
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

      {quickDestinations.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickLocationsContainer}
        >
          {quickDestinations.map((dest) => (
            <QuickLocationChip
              key={dest.id}
              label={dest.name}
              onPress={() => onQuickDestinationPress(dest)}
            />
          ))}
        </ScrollView>
      ) : null}
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
