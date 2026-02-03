import { StyleSheet, Pressable } from 'react-native';

import ChevronLeft from '@/components/svg/ChevronLeft';
import CurrentLocationIcon from '@/components/svg/CurrentLocationIcon';
import { spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';

interface MapControlsProps {
  showBack: boolean;
  onBack: () => void;
  onCurrentLocation: () => void;
  bottomOffset: number;
}

export function MapControls({
  showBack,
  onBack,
  onCurrentLocation,
  bottomOffset,
}: MapControlsProps) {
  const { colors } = useTheme();

  return (
    <>
      {showBack && (
        <Pressable
          style={[
            styles.mapButton,
            styles.backButton,
            {
              backgroundColor: colors.surface,
              bottom: bottomOffset,
            },
          ]}
          onPress={onBack}
        >
          <ChevronLeft size={24} color={colors.textPrimary} />
        </Pressable>
      )}

      <Pressable
        style={[
          styles.mapButton,
          styles.currentLocationButton,
          {
            backgroundColor: colors.surface,
            bottom: bottomOffset,
          },
        ]}
        onPress={onCurrentLocation}
      >
        <CurrentLocationIcon size={24} color={colors.textPrimary} />
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  mapButton: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    left: spacing.lg,
  },
  currentLocationButton: {
    right: spacing.lg,
  },
});
