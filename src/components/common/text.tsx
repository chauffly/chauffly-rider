import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';

import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { fontFamily, fontSize, FontFamily, FontSize } from '@/constants/typography';

export type TextVariant = 'h1' | 'h2' | 'h3' | 'body' | 'bodySmall' | 'caption' | 'label' | 'button';
export type TextColor = 'primary' | 'secondary' | 'error' | 'success' | 'muted' | 'inverse';
export type TextWeight = 'thin' | 'extraLight' | 'light' | 'regular' | 'medium' | 'semiBold' | 'bold' | 'extraBold' | 'black';
export type TextAlign = 'left' | 'center' | 'right';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: TextColor;
  weight?: TextWeight;
  align?: TextAlign;
  font?: FontFamily;
  size?: FontSize | number;
  translationKey?: string;
  translationParams?: Record<string, string | number>;
  children?: React.ReactNode;
}

const variantStyles: Record<TextVariant, { size: number; weight: FontFamily; lineHeight: number }> = {
  h1: { size: fontSize.h1, weight: 'bold', lineHeight: 40 },
  h2: { size: fontSize.h2, weight: 'bold', lineHeight: 36 },
  h3: { size: fontSize.h3, weight: 'semiBold', lineHeight: 32 },
  body: { size: fontSize.lg, weight: 'regular', lineHeight: 22 },
  bodySmall: { size: fontSize.md, weight: 'regular', lineHeight: 20 },
  caption: { size: fontSize.sm, weight: 'regular', lineHeight: 16 },
  label: { size: fontSize.md, weight: 'regular', lineHeight: 24 },
  button: { size: fontSize.lg, weight: 'medium', lineHeight: 24 },
};

const weightToFontFamily: Record<TextWeight, FontFamily> = {
  thin: 'thin',
  extraLight: 'extraLight',
  light: 'light',
  regular: 'regular',
  medium: 'medium',
  semiBold: 'semiBold',
  bold: 'bold',
  extraBold: 'extraBold',
  black: 'black',
};

export function Text({
  variant = 'body',
  color,
  weight,
  align,
  font,
  size,
  translationKey,
  translationParams,
  style,
  children,
  ...rest
}: TextProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const variantStyle = variantStyles[variant];

  const getTextColor = (): string => {
    switch (color) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.textSecondary;
      case 'error':
        return colors.error;
      case 'success':
        return colors.success;
      case 'muted':
        return colors.textMuted;
      case 'inverse':
        return colors.textInverse;
      default:
        return colors.textPrimary;
    }
  };

  const getFontFamily = (): string => {
    if (font) {
      return fontFamily[font];
    }
    if (weight) {
      return fontFamily[weightToFontFamily[weight]];
    }
    return fontFamily[variantStyle.weight];
  };

  const getFontSize = (): number => {
    if (typeof size === 'number') {
      return size;
    }
    if (size) {
      return fontSize[size];
    }
    return variantStyle.size;
  };

  const textStyle: TextStyle = {
    color: getTextColor(),
    fontFamily: getFontFamily(),
    fontSize: getFontSize(),
    lineHeight: variantStyle.lineHeight,
    textAlign: align,
  };

  const content = translationKey ? t(translationKey, translationParams) : children;

  return (
    <RNText style={[textStyle, style]} {...rest}>
      {content}
    </RNText>
  );
}
