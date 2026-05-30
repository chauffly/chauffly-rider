import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/context/theme-context';
import { borderRadius, spacing } from '@/constants/spacing';

export interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export function Checkbox({ checked, onPress, disabled }: CheckboxProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        {
          borderColor: checked ? colors.primary : colors.border,
          backgroundColor: checked ? colors.primary : colors.transparent,
          opacity: pressed ? 0.7 : disabled ? 0.5 : 1,
        },
      ]}
      hitSlop={8}
    >
      {checked && (
        <Ionicons name="checkmark" size={12} color={colors.white} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 16,
    height: 16,
    borderRadius: 2,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
