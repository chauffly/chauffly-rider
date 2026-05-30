import { Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Text } from '@/components/common/text';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { useJourneyState } from '@/hooks/use-journey-state';

export function ResumeJourneyButton() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { activeJourney, clearDismissal } = useJourneyState();

  if (!activeJourney) {
    return null;
  }

  const handlePress = async () => {
    await clearDismissal();
    router.replace({
      pathname: activeJourney.path as never,
      params: { bookingId: activeJourney.bookingId } as never
    });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.pill,
        {
          bottom: insets.bottom + spacing.xl + 80,
          backgroundColor: colors.primary,
          shadowColor: colors.textPrimary
        }
      ]}
      accessibilityRole="button"
      accessibilityLabel="Resume journey"
    >
      <MaterialCommunityIcons name="navigation-variant" size={18} color={colors.textInverse} />
      <Text variant="bodySmall" weight="medium" style={{ color: colors.textInverse }}>
        Back to journey
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 50
  }
});
