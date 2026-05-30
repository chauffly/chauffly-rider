import { Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { useJourneyState } from '@/hooks/use-journey-state';

export function JourneyHomeButton() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { dismissJourney } = useJourneyState();

  const handlePress = async () => {
    await dismissJourney();
    router.replace('/(tabs)');
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.button,
        {
          top: insets.top + spacing.md,
          backgroundColor: colors.surface,
          shadowColor: colors.textPrimary
        }
      ]}
      accessibilityRole="button"
      accessibilityLabel="Go home"
      hitSlop={12}
    >
      <MaterialCommunityIcons name="home-outline" size={22} color={colors.textPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 50
  }
});
