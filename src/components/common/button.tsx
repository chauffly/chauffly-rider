import {
  Pressable,
  PressableProps,
  StyleSheet,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { useRouter } from 'expo-router';

import { Text } from './text';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { borderRadius, spacing } from '@/constants/spacing';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  title?: string;
  translationKey?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  navigateTo?: string;
  navigateParams?: Record<string, string | number | boolean | undefined>;
}

export function Button({
  title,
  translationKey,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  textStyle,
  style,
  disabled,
  onPress,
  navigateTo,
  navigateParams,
  ...rest
}: ButtonProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const getBackgroundColor = (): string => {
    if (disabled) {
      return colors.textDisabled;
    }
    switch (variant) {
      case 'primary':
        return colors.buttonPrimary;
      case 'secondary':
        return colors.buttonSecondary;
      case 'outline':
      case 'ghost':
        return 'transparent';
      default:
        return colors.buttonPrimary;
    }
  };

  const getTextColor = (): string => {
    if (disabled) {
      return colors.textSecondary;
    }
    switch (variant) {
      case 'primary':
        return colors.buttonPrimaryText;
      case 'secondary':
        return colors.buttonSecondaryText;
      case 'outline':
        return colors.textPrimary;
      case 'ghost':
        return colors.primary;
      default:
        return colors.buttonPrimaryText;
    }
  };

  const getBorderColor = (): string | undefined => {
    if (variant === 'outline') {
      return colors.border;
    }
    return undefined;
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.lg,
          minHeight: 36,
        };
      case 'lg':
        return {
          paddingVertical: spacing.lg,
          paddingHorizontal: spacing.xxxl,
          minHeight: 56,
        };
      case 'md':
      default:
        return {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.xxl,
          minHeight: 48,
        };
    }
  };

  const buttonText = translationKey ? t(translationKey) : title;

  const handlePress: PressableProps['onPress'] = (event) => {
    onPress?.(event);
    if (navigateTo) {
      router.push({
        pathname: navigateTo as never,
        params: navigateParams as never,
      });
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        getSizeStyles(),
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1 : 0,
          opacity: pressed ? 0.8 : 1,
        },
        fullWidth && styles.fullWidth,
        style as ViewStyle,
      ]}
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={buttonText}
      {...rest}
    >
      <Text
        variant="button"
        style={[{ color: getTextColor() }, textStyle as TextStyle,]}
      >
        {buttonText}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
});
