import { StyleSheet, View, Pressable } from 'react-native';

import { Text } from '@/components/common/text';
import { Button } from '@/components/common/button';
import LocationPinGreen from '@/components/svg/LocationPinGreen';
import LocationPinRed from '@/components/svg/LocationPinRed';
import PencilIcon from '@/components/svg/PencilIcon';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { Origin, RouteStop } from './types';

interface SetLocationContentProps {
  origin: Origin | null;
  destinations: RouteStop[];
  onEditRoute: () => void;
  onNext: () => void;
}

export function SetLocationContent({
  origin,
  destinations,
  onEditRoute,
  onNext,
}: SetLocationContentProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.setLocationContainer}>
      <Text
        variant="h3"
        font="medium"
        translationKey="location.set_location"
        style={styles.setLocationTitle}
      />

      <View style={styles.locationsContainer}>
        <View style={styles.locationRow}>
          <View style={styles.locationDotContainer}>
            <LocationPinGreen />
            {destinations.length > 0 && (
              <View style={[styles.locationLine, { borderColor: colors.border }]} />
            )}
          </View>
          <View style={styles.locationInfo}>
              <Text variant="body" font="medium" numberOfLines={1}>
                {origin?.name || 'Pickup location'}
              </Text>
              <Text variant="caption" color="muted" numberOfLines={1}>
                {origin?.address || 'Select pickup'}
              </Text>
          </View>
        </View>

        {destinations.map((dest, index) => (
          <View key={dest.id} style={styles.locationRow}>
            <View style={styles.locationDotContainer}>
              <LocationPinRed />
              {index < destinations.length - 1 && (
                <View style={[styles.locationLine, { borderColor: colors.border }]} />
              )}
            </View>
            <View style={styles.locationInfo}>
              <Text variant="body" font="medium" numberOfLines={1}>
                {dest.name}
              </Text>
              <Text variant="caption" color="muted" numberOfLines={1}>
                {dest.address}
              </Text>
            </View>
            {index === destinations.length - 1 && (
              <Pressable style={styles.editButton} onPress={onEditRoute}>
                <PencilIcon size={24} color={colors.textSecondary} />
              </Pressable>
            )}
          </View>
        ))}
      </View>

      <Button
        translationKey="location.next"
        variant="primary"
        fullWidth
        onPress={onNext}
        disabled={!origin || destinations.length === 0}
        style={styles.nextButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  setLocationContainer: {
    flex: 1,
  },
  setLocationTitle: {
    marginBottom: spacing.lg,
  },
  locationsContainer: {
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationDotContainer: {
    width: 24,
    alignItems: 'center',
  },
  locationLine: {
    width: 2,
    height: 40,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  locationInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  editButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  nextButton: {
    marginTop: spacing.xxl,
  },
});
