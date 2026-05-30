import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';

import { Text } from './text';
import { useTheme } from '@/context/theme-context';
import { borderRadius, spacing } from '@/constants/spacing';
import Google from '../svg/Google';
import Apple from '../svg/Apple';

export type SocialProvider = 'google' | 'apple';

interface SocialButtonProps {
  provider: SocialProvider;
  onPress: () => void;
}

const providerConfig = {
  google: {
    label: 'Google',
    icon: 'https://www.google.com/favicon.ico',
  },
  apple: {
    label: 'Apple',
    icon: null,
  },
};

export function SocialButton({ provider, onPress }: SocialButtonProps) {
  const { colors, isDark } = useTheme();
  const config = providerConfig[provider];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          borderColor: colors.border,
          backgroundColor: colors.background,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      {provider === 'google' ? (
        <Google />
      ) : (
        <Apple color={isDark ? "#FFFFFF" : "#0E1B2B"} />
      )}
      <Text variant="button" style={{ color: colors.textPrimary }}>
        {config.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    gap: spacing.sm,
    minHeight: 48,
  },
  icon: {
    width: 20,
    height: 20,
  },
  appleIcon: {
    fontSize: 20,
  },
});
