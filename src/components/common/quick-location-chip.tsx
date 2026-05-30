import { StyleSheet, Pressable } from 'react-native';

import { Text } from './text';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { spacing, borderRadius } from '@/constants/spacing';

interface QuickLocationChipProps {
  label?: string;
  translationKey?: string;
  isSelected?: boolean;
  onPress: () => void;
}

export function QuickLocationChip({
  label,
  translationKey,
  isSelected = false,
  onPress,
}: QuickLocationChipProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const displayLabel = translationKey ? t(translationKey) : label;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: isSelected ? colors.primary : colors.surface,
          borderColor: isSelected ? colors.primary : colors.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
      onPress={onPress}
    >
      <Text
        variant="bodySmall"
        style={{ color: isSelected ? colors.buttonPrimaryText : colors.textPrimary }}
      >
        {displayLabel}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
});
