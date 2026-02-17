import { ReactNode } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';

import { Text, type TextProps, type TextVariant } from '@/components/common/text';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { spacing } from '@/constants/spacing';
import ChevronLeft from '@/components/svg/ChevronLeft';
import CloseIcon from '@/components/svg/CloseIcon';

type HeaderAlign = 'left' | 'center';
type LeftIcon = 'back' | 'close';

interface StackHeaderProps {
  title?: string;
  translationKey?: string;
  onBack?: () => void;
  leftIcon?: LeftIcon;
  right?: ReactNode;
  align?: HeaderAlign;
  titleVariant?: TextVariant;
  titleSize?: TextProps['size'];
  titleWeight?: TextProps['weight'];
  style?: ViewStyle;
}

export function StackHeader({
  title,
  translationKey,
  onBack,
  leftIcon = 'back',
  right,
  align = 'left',
  titleVariant = 'h3',
  titleSize = 'xl',
  titleWeight = 'medium',
  style,
}: StackHeaderProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    router.back();
  };

  const accessibilityLabel =
    leftIcon === 'close' ? t('common.cancel') : t('common.back');

  return (
    <View style={[styles.container, style]}>
      <Pressable
        onPress={handleBack}
        style={styles.backButton}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        hitSlop={8}
      >
        {leftIcon === 'close' ? (
          <CloseIcon size={24} color={colors.textPrimary} />
        ) : (
          <ChevronLeft size={24} color={colors.textPrimary} />
        )}
      </Pressable>

      <View
        style={[
          styles.titleContainer,
          align === 'center' && styles.titleCenter,
        ]}
      >
        <Text
          variant={titleVariant}
          weight={titleWeight}
          size={titleSize}
          translationKey={translationKey}
        >
          {title}
        </Text>
      </View>

      {right ? (
        <View style={styles.rightSlot}>{right}</View>
      ) : align === 'center' ? (
        <View style={styles.rightSpacer} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  titleCenter: {
    alignItems: 'center',
  },
  rightSlot: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
  rightSpacer: {
    width: 40,
  },
});
